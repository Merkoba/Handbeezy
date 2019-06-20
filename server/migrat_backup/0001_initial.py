# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Movie',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('title', models.TextField(default=b'0', max_length=200)),
                ('plot', models.TextField(default=b'0', max_length=2000)),
                ('genre', models.TextField(default=b'0', max_length=200)),
                ('poster', models.TextField(default=b'0', max_length=500)),
                ('url', models.TextField(default=b'0', max_length=200)),
                ('torrent', models.TextField(default=b'0', max_length=500)),
                ('score', models.IntegerField(default=0)),
            ],
        ),
        migrations.CreateModel(
            name='Post',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('text', models.TextField(max_length=5000)),
                ('date', models.DateTimeField()),
                ('ip', models.CharField(max_length=20)),
                ('reply', models.ForeignKey(to='server.Post', null=True)),
            ],
        ),
        migrations.CreateModel(
            name='Profile',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('movies', models.TextField(default=b'0', max_length=2000)),
                ('user', models.ForeignKey(to=settings.AUTH_USER_MODEL, unique=True)),
            ],
        ),
        migrations.CreateModel(
            name='Quote',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('post', models.ForeignKey(related_name='quote_post', to='server.Post')),
                ('quote', models.ForeignKey(related_name='quote_quote', to='server.Post')),
            ],
        ),
        migrations.CreateModel(
            name='Video',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('title', models.TextField(max_length=500, null=True)),
                ('last_modified', models.DateTimeField()),
                ('date', models.DateTimeField()),
                ('ip', models.CharField(max_length=20)),
            ],
        ),
        migrations.AddField(
            model_name='post',
            name='video',
            field=models.ForeignKey(to='server.Video'),
        ),
    ]
