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
            name='Ad',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('text', models.CharField(max_length=100)),
                ('url', models.CharField(max_length=500)),
                ('date', models.DateTimeField()),
                ('nsfw', models.BooleanField(default=False)),
            ],
        ),
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
            name='Report',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('ip', models.CharField(max_length=20)),
                ('date', models.DateTimeField()),
                ('type', models.CharField(max_length=20)),
            ],
        ),
        migrations.CreateModel(
            name='Suggestion',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('text', models.TextField(default=b'empty', max_length=3000)),
                ('date', models.DateTimeField()),
            ],
        ),
        migrations.CreateModel(
            name='Video',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('title', models.TextField(max_length=500, null=True)),
                ('extension', models.CharField(max_length=10, null=True)),
                ('size', models.IntegerField(default=False, null=True)),
                ('duration', models.IntegerField(default=False, null=True)),
                ('last_modified', models.DateTimeField()),
                ('date', models.DateTimeField()),
                ('hash', models.CharField(max_length=100)),
                ('views', models.IntegerField(default=False)),
                ('comments', models.IntegerField(default=0)),
                ('nsfw', models.BooleanField()),
                ('ip', models.CharField(max_length=20)),
                ('uid', models.CharField(max_length=11, unique=True, null=True)),
            ],
        ),
        migrations.AddField(
            model_name='report',
            name='video',
            field=models.ForeignKey(default=None, to='server.Video'),
        ),
        migrations.AddField(
            model_name='post',
            name='video',
            field=models.ForeignKey(to='server.Video'),
        ),
    ]
