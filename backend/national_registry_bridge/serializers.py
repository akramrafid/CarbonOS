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
        fields = "__all__"


class RegistryProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegistryProject
        fields = "__all__"


class MonitoringReportSubmissionSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source="registry_project.project_name", read_only=True)

    class Meta:
        model = MonitoringReportSubmission
        fields = "__all__"


class CorrespondingAdjustmentSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(
        source="monitoring_report_submission.registry_project.project_name",
        read_only=True
    )

    class Meta:
        model = CorrespondingAdjustment
        fields = "__all__"


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
