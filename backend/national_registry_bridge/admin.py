from django.contrib import admin
from django.utils import timezone
from .models import (
    RegistryProject,
    PositiveNegativeRule,
    MonitoringReportSubmission,
    CorrespondingAdjustment
)
from .positive_negative_list import evaluate_and_update_project, bootstrap_default_rules


@admin.register(RegistryProject)
class RegistryProjectAdmin(admin.ModelAdmin):
    list_display = (
        "project_name",
        "external_project_id",
        "sector",
        "mitigation_type",
        "ndc_commitment_type",
        "eligibility_status",
        "carbon_standard",
        "created_at"
    )
    list_filter = ("eligibility_status", "sector", "ndc_commitment_type", "carbon_standard")
    search_fields = ("project_name", "external_project_id", "company_tax_id")
    actions = ["check_eligibility_action"]

    @admin.action(description="Check & Update eligibility against current DOE Positive/Negative List")
    def check_eligibility_action(self, request, queryset):
        updated_count = 0
        for project in queryset:
            old_status = project.eligibility_status
            new_status = evaluate_and_update_project(project)
            if old_status != new_status:
                updated_count += 1
        self.message_user(
            request,
            f"Successfully checked {queryset.count()} project(s). {updated_count} project status(es) changed."
        )


@admin.register(PositiveNegativeRule)
class PositiveNegativeRuleAdmin(admin.ModelAdmin):
    list_display = (
        "sector",
        "mitigation_type",
        "ndc_commitment_type",
        "status",
        "regulatory_reference",
        "is_active",
        "updated_at"
    )
    list_filter = ("status", "is_active", "ndc_commitment_type", "sector")
    search_fields = ("sector", "mitigation_type", "regulatory_reference", "notes")
    list_editable = ("status", "is_active")
    actions = ["bootstrap_default_rules_action"]

    @admin.action(description="Bootstrap default Bangladesh DOE benchmark rules")
    def bootstrap_default_rules_action(self, request, queryset):
        bootstrap_default_rules()
        self.message_user(request, "Default benchmark rules initialized if table was empty.")


@admin.register(MonitoringReportSubmission)
class MonitoringReportSubmissionAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "registry_project",
        "submission_status",
        "response_status",
        "provenance_chain_hash_at_submission",
        "submitted_at"
    )
    list_filter = ("submission_status", "response_status", "submitted_at")
    search_fields = (
        "id",
        "registry_project__project_name",
        "provenance_chain_hash_at_submission"
    )
    # Immutable audit trail: prevent editing via admin UI
    readonly_fields = [
        "id",
        "registry_project",
        "carbon_result_ids",
        "provenance_chain_hash_at_submission",
        "payload_sent",
        "response_status",
        "response_body",
        "submission_status",
        "submitted_at"
    ]

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(CorrespondingAdjustment)
class CorrespondingAdjustmentAdmin(admin.ModelAdmin):
    list_display = (
        "credit_serial_number",
        "monitoring_report_submission",
        "itmo_transfer_partner",
        "ndc_inventory_sector",
        "metric_tonnes_co2e",
        "adjustment_applied",
        "adjustment_applied_at",
        "reconciliation_status"
    )
    list_filter = (
        "adjustment_applied",
        "reconciliation_status",
        "authorized_for_itmo",
        "ndc_inventory_sector",
        "itmo_transfer_partner"
    )
    search_fields = (
        "credit_serial_number",
        "adjustment_confirmation_id",
        "monitoring_report_submission__registry_project__project_name"
    )
    actions = ["confirm_adjustment_action"]

    @admin.action(description="Confirm Corresponding Adjustment applied to National GHG Inventory")
    def confirm_adjustment_action(self, request, queryset):
        now = timezone.now()
        count = queryset.update(
            adjustment_applied=True,
            adjustment_applied_at=now,
            reconciliation_status="adjusted_confirmed"
        )
        self.message_user(request, f"Marked {count} adjustment(s) as officially confirmed and applied.")
