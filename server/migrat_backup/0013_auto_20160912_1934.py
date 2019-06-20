# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('server', '0012_auto_20160912_0237'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='report',
            name='video_id',
        ),
        migrations.AddField(
            model_name='report',
            name='video',
            field=models.ForeignKey(default=None, to='server.Video'),
        ),
    ]
