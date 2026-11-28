from rest_framework import serializers
from .models import (
    RegistryProject,
    PositiveNegativeRule,
    MonitoringReportSubmission,
    CorrespondingAdjustment
)


class PositiveNegativeRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = PositiveNegativeRule
        # fields = "__all__"  # [COMMENTED OUT FOR PERSONAL REFERENCE — explicit allowlist enforced]
        fields = [
            "id",
            "sector",
            "mitigation_type",
            "ndc_commitment_type",
            "status",
            "regulatory_reference",
            "notes",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class RegistryProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegistryProject
        # fields = "__all__"  # [COMMENTED OUT FOR PERSONAL REFERENCE — eligibility_status must not be caller-writable on create/patch]
        fields = [
            "id",
            "organization_id",
            "owner",
            "external_project_id",
            "project_name",
            "sector",
            "sectoral_scope",
            "mitigation_type",
            "company_tax_id",
            "ndc_commitment_type",
            "eligibility_status",
            "carbon_standard",
            "polygon_geojson",
            "article62_loa_reference",
            "article62_loa_sha256",
            "article62_loa_issued_at",
            "article62_loa_status",
            "article62_loa_revoked_at",
            "cad_trust_warehouse_id",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "organization_id",
            "owner",
            "eligibility_status",
            "article62_loa_issued_at",
            "article62_loa_revoked_at",
            "article62_loa_status",
            "cad_trust_warehouse_id",
            "created_at",
            "updated_at",
        ]


class MonitoringReportSubmissionSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source="registry_project.project_name", read_only=True)

    class Meta:
        model = MonitoringReportSubmission
        # fields = "__all__"  # [COMMENTED OUT FOR PERSONAL REFERENCE]
        fields = [
            "id",
            "registry_project",
            "project_name",
            "carbon_result_ids",
            "provenance_chain_hash_at_submission",
            "payload_sent",
            "response_status",
            "response_body",
            "submission_status",
            "submitted_at",
        ]
        read_only_fields = fields


class CorrespondingAdjustmentSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(
        source="monitoring_report_submission.registry_project.project_name",
        read_only=True
    )

    class Meta:
        model = CorrespondingAdjustment
        # fields = "__all__"  # [COMMENTED OUT FOR PERSONAL REFERENCE — DOE confirmation fields must only change via confirm action]
        fields = [
            "id",
            "monitoring_report_submission",
            "project_name",
            "credit_serial_number",
            "authorized_for_itmo",
            "itmo_transfer_partner",
            "adjustment_applied",
            "adjustment_applied_at",
            "adjustment_confirmation_id",
            "ndc_inventory_sector",
            "metric_tonnes_co2e",
            "vintage_year",
            "reconciliation_status",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "adjustment_applied",
            "adjustment_applied_at",
            "adjustment_confirmation_id",
            "reconciliation_status",
            "created_at",
            "updated_at",
        ]


class SubmitMonitoringReportRequestSerializer(serializers.Serializer):
    carbon_result_ids = serializers.ListField(
        child=serializers.CharField(),
        required=True,
        help_text="List of CarbonResult UUIDs to substantiate this submission"
    )
    provenance_chain_hash = serializers.CharField(
        required=True,
        min_length=16,
        max_length=64,
        help_text="Cryptographic hash of latest EstimateProvenance record"
    )
    force_sandbox_success = serializers.BooleanField(
        required=False,
        default=True
    )
    additional_telemetry = serializers.DictField(
        required=False,
        default=dict
    )
