from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('national_registry_bridge', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='registryproject',
            name='organization_id',
            field=models.CharField(
                db_index=True,
                default='default-org',
                help_text='Tenant organization identifier owning this registry project',
                max_length=64,
            ),
        ),
        migrations.AddField(
            model_name='registryproject',
            name='owner',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='registry_projects',
                to=settings.AUTH_USER_MODEL,
            ),
        ),
    ]
