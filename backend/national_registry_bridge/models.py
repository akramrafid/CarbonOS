import uuid
from django.db import models


class RegistryProject(models.Model):
    """
    Local mirror of a project's registry-side identity - NOT the source of truth,
    just enough to correlate local dMRV output with the registry's own project ID.
    Governed by Bangladesh's Department of Environment (DOE) / Article 6 DNA rules.
    """
    ELIGIBILITY_CHOICES = [
        ("pending_review", "pending_review"),
        ("positive_list", "positive_list"),
        ("negative_list", "negative_list"),
    ]

    NDC_COMMITMENT_CHOICES = [
        ("unconditional", "unconditional"),
        ("conditional", "conditional"),
        ("beyond_ndc", "beyond_ndc"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    external_project_id = models.CharField(
        max_length=64, 
        null=True, 
        blank=True,
        help_text="Assigned by DOE/Registry (e.g. CA0004-VU-CH-356, BD-JCM-004)"
    )
    project_name = models.CharField(max_length=255)
    sector = models.CharField(max_length=100, help_text="Registry sector enum (e.g. Forestry, Agriculture, Energy)")
    sectoral_scope = models.CharField(max_length=100, help_text="UNFCCC / CDM Sectoral Scope identifier")
    mitigation_type = models.CharField(max_length=100, help_text="e.g. Afforestation, Methane Avoidance, Solar Irrigation")
    company_tax_id = models.CharField(max_length=64, help_text="Registry requires this organization Tax ID / BIN")
    ndc_commitment_type = models.CharField(
        max_length=50,
        choices=NDC_COMMITMENT_CHOICES,
        default="conditional",
        help_text="Categorization under Bangladesh NDC 3.0"
    )
    eligibility_status = models.CharField(
        max_length=20,
        choices=ELIGIBILITY_CHOICES,
        default="pending_review",
        help_text="Assessed against DOE Positive/Negative List before registry onboarding"
    )
    carbon_standard = models.CharField(
        max_length=50,
        help_text="Standard under which credits are verified: Verra / Gold Standard / PACM / JCM"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Registry Project"
        verbose_name_plural = "Registry Projects"

    def __str__(self):
        ext = f" ({self.external_project_id})" if self.external_project_id else ""
        return f"{self.project_name}{ext} [{self.eligibility_status}]"

    def is_eligible_for_submission(self) -> bool:
        """Constraint 3: Projects must be confirmed on Positive List before report submission."""
        return self.eligibility_status == "positive_list"


class PositiveNegativeRule(models.Model):
    """
    Configuration table for DOE's Positive/Negative list.
    DOE's criteria evolve case-by-case; modeling this as an admin-editable database table
    decouples compliance rules from code deployments.
    """
    RULE_STATUS_CHOICES = [
        ("positive_list", "positive_list"),
        ("negative_list", "negative_list"),
        ("pending_review", "pending_review"),
    ]

    NDC_MATCH_CHOICES = [
        ("unconditional", "unconditional"),
        ("conditional", "conditional"),
        ("beyond_ndc", "beyond_ndc"),
        ("any", "any"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sector = models.CharField(max_length=100, help_text="Registry sector (or '*' for all)")
    mitigation_type = models.CharField(max_length=100, default="*", help_text="Specific activity or '*' for all")
    ndc_commitment_type = models.CharField(
        max_length=50,
        choices=NDC_MATCH_CHOICES,
        default="any",
        help_text="NDC category requirement"
    )
    status = models.CharField(
        max_length=20,
        choices=RULE_STATUS_CHOICES,
        default="pending_review"
    )
    regulatory_reference = models.CharField(
        max_length=255,
        blank=True,
        help_text="DOE Gazette notification, NDC 3.0 Annex, or Article 6 DNA circular"
    )
    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["sector", "mitigation_type", "-created_at"]
        verbose_name = "Positive/Negative List Rule"
        verbose_name_plural = "Positive/Negative List Rules"

    def __str__(self):
        return f"[{self.status.upper()}] {self.sector} / {self.mitigation_type} ({self.ndc_commitment_type})"


class MonitoringReportSubmission(models.Model):
    """
    Every submission to the national registry, logged immutably.
    This is the audit trail on the OUTBOUND side, complementing
    EstimateProvenance's inbound measurement trail.
    """
    SUBMISSION_STATUS_CHOICES = [
        ("pending", "pending"),
        ("submitted", "submitted"),
        ("accepted", "accepted"),
        ("rejected", "rejected"),
        ("failed", "failed"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    registry_project = models.ForeignKey(
        RegistryProject,
        on_delete=models.PROTECT,
        related_name="submissions"
    )
    carbon_result_ids = models.JSONField(
        help_text="List of inference-side CarbonResult.id values substantiating this submission"
    )
    provenance_chain_hash_at_submission = models.CharField(
        max_length=64,
        help_text="Snapshot of provenance.py's latest hash at submission time - proves state of evidence"
    )
    payload_sent = models.JSONField(
        help_text="Complete JSON payload transmitted to national registry national-api"
    )
    response_status = models.IntegerField(
        null=True,
        blank=True,
        help_text="HTTP status returned by registry endpoint"
    )
    response_body = models.JSONField(
        null=True,
        blank=True,
        help_text="Raw or parsed response payload returned by national registry"
    )
    submission_status = models.CharField(
        max_length=30,
        choices=SUBMISSION_STATUS_CHOICES,
        default="submitted"
    )
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-submitted_at"]
        verbose_name = "Monitoring Report Submission"
        verbose_name_plural = "Monitoring Report Submissions"

    def __str__(self):
        return f"Submission {self.id} for {self.registry_project.project_name} [{self.submission_status}]"


class CorrespondingAdjustment(models.Model):
    """
    Bangladesh's NDC 3.0 explicitly requires tracking Corresponding Adjustments.
    The registry's own credit ledger may not model it natively, so track it here
    and reconcile against official DOE authorization and BTR accounts.
    """
    RECONCILIATION_CHOICES = [
        ("pending_issuance", "pending_issuance"),
        ("issued_unadjusted", "issued_unadjusted"),
        ("adjusted_confirmed", "adjusted_confirmed"),
        ("contested", "contested"),
    ]

    NDC_SECTOR_CHOICES = [
        ("LULUCF_Forestry", "LULUCF / Forestry"),
        ("Agriculture", "Agriculture"),
        ("Energy", "Energy"),
        ("Waste", "Waste"),
        ("IPPU", "Industrial Processes and Product Use"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    monitoring_report_submission = models.ForeignKey(
        MonitoringReportSubmission,
        on_delete=models.PROTECT,
        related_name="corresponding_adjustments"
    )
    credit_serial_number = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        help_text="Filled in once national registry issues the batch serial range"
    )
    authorized_for_itmo = models.BooleanField(
        default=False,
        help_text="Flagged by Bangladesh Article 6 Designated National Authority (DNA) for international transfer"
    )
    itmo_transfer_partner = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        help_text="Acquiring Party / Partner country (e.g. Japan, Switzerland)"
    )
    adjustment_applied = models.BooleanField(
        default=False,
        help_text="Explicit confirmation that corresponding adjustment has been added to national GHG balance"
    )
    adjustment_applied_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Timestamp when DOE officially confirmed adjustment application"
    )
    adjustment_confirmation_id = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        help_text="Official DOE / UNFCCC Article 6.2 registry confirmation reference"
    )
    ndc_inventory_sector = models.CharField(
        max_length=100,
        choices=NDC_SECTOR_CHOICES,
        default="LULUCF_Forestry",
        help_text="Which BTR national inventory sector this mitigation outcome reduces"
    )
    metric_tonnes_co2e = models.FloatField(
        default=0.0,
        help_text="Total verified tCO2e to be adjusted in Bangladesh national accounts"
    )
    vintage_year = models.IntegerField(
        null=True,
        blank=True,
        help_text="Vintage year of emission reduction"
    )
    reconciliation_status = models.CharField(
        max_length=50,
        choices=RECONCILIATION_CHOICES,
        default="pending_issuance"
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Corresponding Adjustment"
        verbose_name_plural = "Corresponding Adjustments"

    def __str__(self):
        ser = self.credit_serial_number or "Pending Serial"
        status = "ADJUSTED" if self.adjustment_applied else "UNADJUSTED"
        return f"CA {ser} - {self.metric_tonnes_co2e} tCO2e ({status})"
