from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('national_registry_bridge', '0002_registryproject_organization_scoping'),
    ]

    operations = [
        migrations.AddField(
            model_name='registryproject',
            name='polygon_geojson',
            field=models.TextField(blank=True, default='', help_text='Project AOI Polygon GeoJSON (EPSG:4326) used for double-counting overlap guard'),
        ),
        migrations.AddField(
            model_name='registryproject',
            name='article62_loa_reference',
            field=models.CharField(blank=True, default='', max_length=128),
        ),
        migrations.AddField(
            model_name='registryproject',
            name='article62_loa_sha256',
            field=models.CharField(blank=True, default='', max_length=64),
        ),
        migrations.AddField(
            model_name='registryproject',
            name='article62_loa_issued_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='registryproject',
            name='article62_loa_status',
            field=models.CharField(
                choices=[('PENDING', 'Pending DNA Authorization'), ('ACTIVE', 'Active Authorized LoA'), ('REVOKED', 'Revoked')],
                default='PENDING',
                max_length=16,
            ),
        ),
        migrations.AddField(
            model_name='registryproject',
            name='article62_loa_revoked_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='registryproject',
            name='cad_trust_warehouse_id',
            field=models.CharField(blank=True, default='', max_length=128),
        ),
        migrations.CreateModel(
            name='AuthorizationAndAEFExport',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('authorization_id', models.CharField(db_index=True, max_length=128)),
                ('action_type', models.CharField(choices=[('AUTHORIZATION', 'Authorization'), ('FIRST_TRANSFER', 'First Transfer'), ('ACQUISITION', 'Acquisition'), ('RETIREMENT', 'Retirement'), ('CANCELLATION', 'Cancellation')], default='AUTHORIZATION', max_length=32)),
                ('coop_approach_id', models.CharField(max_length=128)),
                ('acquiring_party', models.CharField(default='Japan', max_length=64)),
                ('vintage_year', models.IntegerField(default=2025)),
                ('quantity_tco2e', models.DecimalField(decimal_places=4, max_digits=14)),
                ('first_transfer_trigger', models.CharField(default='authorization_issuance', max_length=64)),
                ('corresponding_adjustment_status', models.CharField(default='pending_national_ledger', max_length=64)),
                ('cad_trust_sync_status', models.CharField(default='UNSYNCED', max_length=32)),
                ('aef_payload', models.JSONField(default=dict)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('registry_project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='aef_entries', to='national_registry_bridge.registryproject')),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
    ]
