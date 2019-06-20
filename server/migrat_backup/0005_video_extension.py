# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('server', '0004_auto_20151027_1754'),
    ]

    operations = [
        migrations.AddField(
            model_name='video',
            name='extension',
            field=models.CharField(max_length=10, null=True),
        ),
    ]
