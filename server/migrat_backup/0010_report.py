# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('server', '0009_ad_nsfw'),
    ]

    operations = [
        migrations.CreateModel(
            name='Report',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('ip', models.CharField(max_length=20)),
                ('video_id', models.IntegerField()),
                ('date', models.DateTimeField()),
                ('type', models.CharField(max_length=20)),
            ],
        ),
    ]
