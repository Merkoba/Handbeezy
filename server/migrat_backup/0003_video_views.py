# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('server', '0002_video_hash'),
    ]

    operations = [
        migrations.AddField(
            model_name='video',
            name='views',
            field=models.IntegerField(default=0),
            preserve_default=False,
        ),
    ]
