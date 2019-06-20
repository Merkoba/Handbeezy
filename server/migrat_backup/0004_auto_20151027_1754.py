# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('server', '0003_video_views'),
    ]

    operations = [
        migrations.AddField(
            model_name='video',
            name='nsfw',
            field=models.BooleanField(default=False),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='video',
            name='views',
            field=models.IntegerField(default=False),
        ),
    ]
