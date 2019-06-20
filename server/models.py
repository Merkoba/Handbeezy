from django.db import models
from django.contrib.auth.models import User

class Profile(models.Model):
	user = models.ForeignKey(User, unique=True)
	movies = models.TextField(max_length=2000, default='0')

class Video(models.Model):
	title = models.TextField(max_length=500, null=True)
	extension = models.CharField(max_length=10, null=True)
	size = models.IntegerField(default=False, null=True)
	duration = models.IntegerField(default=False, null=True)
	last_modified = models.DateTimeField()
	date = models.DateTimeField()
	hash = models.CharField(max_length=100)
	views = models.IntegerField(default=False)
	comments = models.IntegerField(default=0)
	nsfw = models.BooleanField()
	ip = models.CharField(max_length=20)
	uid = models.CharField(max_length=11, null=True, unique=True)
	key = models.CharField(max_length=20, null=True)

class Post(models.Model):
	video = models.ForeignKey(Video)
	text = models.TextField(max_length=5000)
	reply = models.ForeignKey('self', null=True)
	date = models.DateTimeField()
	ip = models.CharField(max_length=20)

class Quote(models.Model):
	post = models.ForeignKey(Post, related_name='quote_post')
	quote = models.ForeignKey(Post, related_name='quote_quote')

class Movie(models.Model):
	title = models.TextField(max_length=200, default='0')
	plot = models.TextField(max_length=2000, default='0')
	genre = models.TextField(max_length=200, default='0')
	poster = models.TextField(max_length=500, default='0')
	url = models.TextField(max_length=200, default='0')
	torrent = models.TextField(max_length=500, default='0')
	score = models.IntegerField(default=0)

class Ad(models.Model):
	text = models.CharField(max_length=100)
	url = models.CharField(max_length=500)
	date = models.DateTimeField()
	nsfw = models.BooleanField(default=False)

class Report(models.Model):
	ip = models.CharField(max_length=20)
	video = models.ForeignKey(Video, default=None)
	date = models.DateTimeField()
	type = models.CharField(max_length=20)

class Suggestion(models.Model):
	text = models.TextField(max_length=3000, default='empty')
	date = models.DateTimeField()
