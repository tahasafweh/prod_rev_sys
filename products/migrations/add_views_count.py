from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('products', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='review',
            name='views_count',
            field=models.PositiveIntegerField(default=0),
        ),
    ] 