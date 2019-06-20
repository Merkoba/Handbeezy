# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('server', '0011_auto_20160912_0234'),
    ]

    operations = [
        migrations.AlterField(
            model_name='video',
            name='uid',
            field=models.CharField(max_length=11, unique=True, null=True),
        ),
    ]
