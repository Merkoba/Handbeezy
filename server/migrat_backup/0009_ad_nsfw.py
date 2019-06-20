# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('server', '0008_ad'),
    ]

    operations = [
        migrations.AddField(
            model_name='ad',
            name='nsfw',
            field=models.BooleanField(default=False),
        ),
    ]
