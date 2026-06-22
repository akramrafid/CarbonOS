from django.db import models
import uuid

class Diagnosis(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    species = models.CharField(max_length=100)
    disease = models.CharField(max_length=100)
    confidence = models.FloatField()
    severity = models.CharField(max_length=50)
    needs_agronomist_review = models.BooleanField(default=False)
    field_id = models.CharField(max_length=100, blank=True, null=True)
    
    # Phase V2: Carbon Asset Risk (For Tier B fruit trees)
    carbon_asset_risk = models.BooleanField(default=False, help_text="True if a Tier B tree has moderate/severe disease")
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.species} - {self.disease} ({self.created_at.date()})"
        
    def save(self, *args, **kwargs):
        # Auto-flag carbon asset risk for Tier B species
        tier_b_species = ['mango', 'jackfruit', 'guava', 'citrus']
        if self.species.lower() in tier_b_species and self.severity in ['moderate', 'severe']:
            self.carbon_asset_risk = True
        super().save(*args, **kwargs)

class WeatherRiskSnapshot(models.Model):
    field_id = models.CharField(max_length=100)
    species = models.CharField(max_length=100)
    disease_risk_type = models.CharField(max_length=100) # e.g. "fungal_blast"
    risk_index = models.FloatField(help_text="0.0 to 1.0")
    summary_bn = models.TextField(help_text="Bangla summary of the weather risk")
    valid_until = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.field_id} - Risk: {self.risk_index} ({self.valid_until.date()})"
