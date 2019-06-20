# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('server', '0010_report'),
    ]

    operations = [
        migrations.AddField(
            model_name='video',
            name='uid',
            field=models.CharField(max_length=11, null=True),
        ),
        migrations.AlterField(
            model_name='report',
            name='video_id',
            field=models.CharField(max_length=9),
        ),
    ]
