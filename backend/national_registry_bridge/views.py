from django.http import HttpResponse
from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from .btr_export import export_btr_csv, generate_btr_structured_summary
from .jcm_connector import map_to_jcm_format
from .models import (
    CorrespondingAdjustment,
    MonitoringReportSubmission,
    PositiveNegativeRule,
    RegistryProject,
)
from .positive_negative_list import bootstrap_default_rules, evaluate_and_update_project
from .registry_client import (
    IneligibleProjectError,
    NationalRegistryClient,
    ProvenanceMissingError,
    RegistryBridgeError,
)
from .serializers import (
    CorrespondingAdjustmentSerializer,
    MonitoringReportSubmissionSerializer,
    PositiveNegativeRuleSerializer,
    RegistryProjectSerializer,
    SubmitMonitoringReportRequestSerializer,
)


def _resolve_user_org_id(request) -> str:
    """Derives tenant organization_id from authenticated user identity (never arbitrary client headers)."""
    user = getattr(request, "user", None)
    if not user or not user.is_authenticated:
        return ""
    explicit_attr = getattr(user, "organization_id", None)
    if explicit_attr:
        return str(explicit_attr)
    return f"user-{user.pk}"


class RegistryProjectViewSet(viewsets.ModelViewSet):
    """
    Manages tenant-scoped project records correlated with National Carbon Registry entities.
    """
    queryset = RegistryProject.objects.all()
    serializer_class = RegistryProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.is_superuser:
            return RegistryProject.objects.all()
        org_id = _resolve_user_org_id(self.request)
        return RegistryProject.objects.filter(organization_id=org_id)

    def perform_create(self, serializer):
        org_id = _resolve_user_org_id(self.request)
        project = serializer.save(organization_id=org_id, owner=self.request.user)
        evaluate_and_update_project(project)

    @action(detail=True, methods=["post"], url_path="check-eligibility")
    def check_eligibility(self, request, pk=None):
        project = self.get_object()
        old_status = project.eligibility_status
        new_status = evaluate_and_update_project(project)
        return Response({
            "project_id": str(project.id),
            "project_name": project.project_name,
            "previous_eligibility": old_status,
            "current_eligibility": new_status,
            "is_eligible_for_submission": project.is_eligible_for_submission(),
        })

    @action(detail=True, methods=["post"], url_path="submit-monitoring-report")
    def submit_monitoring_report(self, request, pk=None):
        project = self.get_object()
        serializer = SubmitMonitoringReportRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        carbon_result_ids = serializer.validated_data["carbon_result_ids"]
        provenance_hash = serializer.validated_data["provenance_chain_hash"]
        force_success = serializer.validated_data.get("force_sandbox_success", True)
        additional_telemetry = serializer.validated_data.get("additional_telemetry", {})

        # Strictly require real CarbonResult rows in DB; never fabricate mock telemetry fallback
        from farmers_ai.models import CarbonResult
        unique_ids = list(dict.fromkeys(str(cid) for cid in carbon_result_ids))
        c_objs = list(CarbonResult.objects.filter(id__in=unique_ids))
        found_ids = {str(obj.id) for obj in c_objs}
        missing_ids = [cid for cid in unique_ids if cid not in found_ids]
        if not c_objs or missing_ids:
            return Response(
                {
                    "error": "MissingCarbonResults",
                    "detail": (
                        "All substantiating carbon_result_ids must exist in the database. "
                        "Silent mock telemetry fallback is prohibited."
                    ),
                    "missing_ids": missing_ids,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        client = NationalRegistryClient()
        try:
            result = client.submit_monitoring_report(
                registry_project=project,
                carbon_results=c_objs,
                provenance_chain_hash=provenance_hash,
                additional_telemetry=additional_telemetry,
                force_sandbox_success=force_success,
            )
            return Response(result, status=status.HTTP_201_CREATED)
        except ProvenanceMissingError as e:
            return Response(
                {"error": "ProvenanceMissingError", "detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except IneligibleProjectError as e:
            return Response(
                {"error": "IneligibleProjectError", "detail": str(e)},
                status=status.HTTP_403_FORBIDDEN,
            )
        except RegistryBridgeError as e:
            return Response(
                {"error": "RegistryBridgeError", "detail": str(e)},
                status=status.HTTP_502_BAD_GATEWAY,
            )

    @action(detail=True, methods=["get"], url_path="jcm-export")
    def jcm_export(self, request, pk=None):
        project = self.get_object()
        latest_sub = (
            MonitoringReportSubmission.objects.filter(registry_project=project)
            .order_by("-submitted_at")
            .first()
        )
        if not latest_sub:
            return Response(
                {
                    "error": "NoMonitoringSubmission",
                    "detail": (
                        "Cannot generate JCM monitoring report without a recorded "
                        "MonitoringReportSubmission substantiated by real CarbonResult data."
                    ),
                },
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

        sent = latest_sub.payload_sent or {}
        cq = sent.get("carbonQuantification", {})
        mp = cq.get("multiPoolVector", {})
        unc = sent.get("conformalUncertaintyAnalysis", {})
        prov = sent.get("provenanceAuditTrail", {})
        add_tel = sent.get("additionalTelemetry", {})

        monitoring_bundle = {
            "metadata": {
                "project_id": str(project.id),
                "analysis_date": latest_sub.submitted_at.date().isoformat(),
                "submission_id": str(latest_sub.id),
            },
            "carbon_pools": {
                "gross_tco2e_ha": cq.get("grossTonnesCo2e", 0.0),
                "total_carbon_tc_ha": cq.get("grossEstimatedCarbonTcHa", 0.0),
                "carbon_agb_tc_ha": mp.get("abovegroundBiomassCarbonTcHa", 0.0),
                "carbon_bgb_tc_ha": mp.get("belowgroundBiomassCarbonTcHa", 0.0),
                "carbon_soc_tc_ha": mp.get("soilOrganicCarbonTcHa", 0.0),
            },
            "remote_sensing_telemetry": {
                "indices": {
                    "ndvi": cq.get("averageNdvi"),
                    "s1_ratio": add_tel.get("s1_ratio"),
                    "tree_height_m": add_tel.get("tree_height_m"),
                }
            },
            "uncertainty_and_crediting": {
                "uncertainty_deduction_tco2e_ha": max(
                    0.0,
                    float(cq.get("grossTonnesCo2e", 0.0) or 0.0)
                    - float(unc.get("conservativeCreditableTco2e", 0.0) or 0.0),
                ),
                "buffer_pool_withholding_tco2e_ha": float(add_tel.get("buffer_pool_withholding_tco2e_ha", 0.0) or 0.0),
            },
            "cryptographic_provenance_and_trust": {
                "record_hash": latest_sub.provenance_chain_hash_at_submission,
                "previous_hash": prov.get("previousHash", "RECORDED"),
                "hash_chain_intact": prov.get("hashVerificationState") == "INTACT",
                "quorum_reached": bool(prov.get("quorumReached", False)),
            },
        }
        jcm_doc = map_to_jcm_format(project, monitoring_bundle)
        return Response(jcm_doc)

    @action(detail=True, methods=["get"], url_path="btr-export")
    def btr_export(self, request, pk=None):
        project = self.get_object()
        doc = generate_btr_structured_summary(registry_project=project)
        return Response(doc)


class PositiveNegativeRuleViewSet(viewsets.ModelViewSet):
    """
    Admin-editable rule engine for Bangladesh DOE's Positive/Negative list.
    Read for authenticated users; mutations restricted to staff/admins.
    """
    queryset = PositiveNegativeRule.objects.all()
    serializer_class = PositiveNegativeRuleSerializer

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]

    @action(detail=False, methods=["post"], url_path="bootstrap", permission_classes=[permissions.IsAdminUser])
    def bootstrap(self, request):
        bootstrap_default_rules()
        rules = PositiveNegativeRule.objects.all()
        serializer = self.get_serializer(rules, many=True)
        return Response({
            "message": "Default Bangladesh DOE benchmark rules initialized.",
            "rules": serializer.data,
        })


class MonitoringReportSubmissionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only tenant-scoped view of immutable outbound submissions to National Carbon Registry.
    """
    queryset = MonitoringReportSubmission.objects.all()
    serializer_class = MonitoringReportSubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.is_superuser:
            return MonitoringReportSubmission.objects.all()
        org_id = _resolve_user_org_id(self.request)
        return MonitoringReportSubmission.objects.filter(registry_project__organization_id=org_id)


class CorrespondingAdjustmentViewSet(viewsets.ModelViewSet):
    """
    Tenant-scoped tracking and reconciliation for Article 6.2 Corresponding Adjustments.
    """
    queryset = CorrespondingAdjustment.objects.all()
    serializer_class = CorrespondingAdjustmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.is_superuser:
            return CorrespondingAdjustment.objects.all()
        org_id = _resolve_user_org_id(self.request)
        return CorrespondingAdjustment.objects.filter(
            monitoring_report_submission__registry_project__organization_id=org_id
        )

    @action(detail=True, methods=["post"], url_path="confirm")
    def confirm_adjustment(self, request, pk=None):
        ca = self.get_object()
        conf_id = request.data.get("confirmation_id")
        if not conf_id:
            return Response(
                {"error": "confirmation_id from official DOE/DNA registry is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        ca.adjustment_applied = True
        ca.adjustment_applied_at = timezone.now()
        ca.adjustment_confirmation_id = conf_id
        ca.reconciliation_status = "adjusted_confirmed"
        if "notes" in request.data:
            ca.notes = request.data["notes"]
        ca.save()
        return Response({
            "status": "CONFIRMED",
            "adjustment_id": str(ca.id),
            "confirmation_id": conf_id,
            "applied_at": ca.adjustment_applied_at.isoformat(),
            "reconciliation_status": ca.reconciliation_status,
        })


class NationalBTRSummaryView(APIView):
    """
    Consolidated Article 6.2 Structured Summary for Bangladesh Biennial Transparency Report.
    Scoped to authenticated user's organization (or full national summary for staff).
    """
    permission_classes = [permissions.IsAuthenticated]

    def perform_content_negotiation(self, request, force=False):
        try:
            return super().perform_content_negotiation(request, force=force)
        except Exception:
            renderers = self.get_renderers()
            return (renderers[0], renderers[0].media_type)

    def get(self, request):
        fmt = request.query_params.get("format", "json").lower()
        user = request.user
        org_id = None if (user.is_staff or user.is_superuser) else _resolve_user_org_id(request)
        summary = generate_btr_structured_summary(include_all_projects=True, organization_id=org_id)

        if fmt == "csv":
            csv_data = export_btr_csv(summary)
            response = HttpResponse(csv_data, content_type="text/csv")
            response["Content-Disposition"] = 'attachment; filename="Bangladesh_BTR_Article6_Structured_Summary.csv"'
            return response

        return Response(summary)
