# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('server', '0005_video_extension'),
    ]

    operations = [
        migrations.AddField(
            model_name='video',
            name='comments',
            field=models.IntegerField(default=0),
        ),
    ]
