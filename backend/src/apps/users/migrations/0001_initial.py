from django.db import migrations

def create_groups(apps, schema_editor):
    Group = apps.get_model('auth', 'Group')
    Group.objects.get_or_create(name='Administrador')
    Group.objects.get_or_create(name='Administrador Empleado')
    Group.objects.get_or_create(name='Usuario Comun')

def reverse_create_groups(apps, schema_editor):
    Group = apps.get_model('auth', 'Group')
    Group.objects.filter(name__in=['Administrador', 'Administrador Empleado', 'Usuario Comun']).delete()

class Migration(migrations.Migration):

    dependencies = [
        ('auth', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_groups, reverse_create_groups),
    ]
