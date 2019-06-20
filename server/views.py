import os
import re
import json
import boto3
from boto3.s3.transfer import S3Transfer
import shutil
import random
import string
import hashlib
import datetime
import subprocess
import collections
from operator import or_
from ipware.ip import get_ip
from moviepy.editor import VideoFileClip
from django.db.models import Q
from django.db import IntegrityError
from django.db.models import Case, When
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.http import HttpResponseRedirect, HttpResponse
from django.core.context_processors import csrf
from django.shortcuts import render
from django.utils.html import linebreaks, urlize
from server.models import *

from bs4 import BeautifulSoup

videos_root = "https://vvvvvvvvvv/hbv"
thumbs_root = "https://xxxxxxxxx/hbt"

spaces_client = boto3.session.Session().client('s3',
      endpoint_url='aaaaaa',
      aws_access_key_id='bbbbbbbb',
      aws_secret_access_key='ccccccccccc')

spaces_transfer = S3Transfer(spaces_client)

root = os.path.dirname(os.path.dirname(__file__))

html_escape_table = {
	"&": "&amp;",
	'"': "\&quot;",
	"'": "&#39;",
	">": "&gt;",
	"<": "\&lt;",
	}

html_escape_table2 = {
	"&": "&amp;",
	'"': "&quot;",
	"'": "&#39;",
	">": "&gt;",
	"<": "&lt;",
	}

def html_escape(text):
	return "".join(html_escape_table.get(c,c) for c in text)
	
def html_escape2(text):
	return "".join(html_escape_table2.get(c,c) for c in text)

def log(s):
	with open(root + '/log', 'a') as log:
		log.write(str(s) + '\n\n')

def random_alpha(n):
	return ''.join(random.choice(string.letters + string.digits) for x in range(n))

def now():
	return datetime.datetime.now()

def create_c(request):
	c = {}
	c.update(csrf(request))
	return c

@csrf_exempt
def main(request):
	if request.method == 'POST':
		if not video_is_ok(request):
			return HttpResponseRedirect('/upload_error')
		video = request.FILES['video']
		video_hash = hashlib.sha1(video.read()).hexdigest()
		try:
			ov = Video.objects.filter(hash=video_hash)[0]
			return HttpResponseRedirect('/' + ov.uid + '/')
		except:
			pass
		video = handle_uploaded_file(request, video, video_hash)
		return HttpResponseRedirect('/' + video.uid + '?key=' + video.key)
	uid = Video.objects.filter(nsfw=False, duration__gte=4).order_by('?')[0].uid
	return HttpResponseRedirect('/' + uid + '/')

def show_video(request, id):
	c = create_c(request)
	time = request.GET.get('time', False)
	play_likes = request.GET.get('play_likes', False)
	if time:
		c['time'] = time
	else:
		c['time'] = 0
	if play_likes:
		c['play_likes'] = 'yes'
	else:
		c['play_likes'] = 'no'
	random_order = request.GET.get('random', False)
	if random_order:
		c['random_order'] = 'yes'
	else:
		c['random_order'] = 'no'
	try:
		video = Video.objects.get(uid=id)
		c['video_id'] = video.uid
		c['extension'] = video.extension
		if video.nsfw:
			c['title'] = '[nsfw] ' + video.title
		else:
			c['title'] = video.title
		c['days'] = (datetime.datetime.now() - video.date).days
	except:
		c['video_id'] = 0
		c['extension'] = 'nofun'
		c['days'] = -1
		c['title'] = 'nothing to see here'
	return render(request, 'main.html', c)

def get_suggested(video, watched_videos, can_play_webm):
	if video.nsfw:
		if can_play_webm:
			videos = Video.objects.filter(nsfw=True, duration__gte=4).exclude(uid__in=watched_videos).order_by('?')[:8]
		else:
			videos = Video.objects.filter(nsfw=True, duration__gte=4).exclude(uid__in=watched_videos).exclude(extension='webm').order_by('?')[:8]
	else:
		if can_play_webm:
			videos = Video.objects.filter(nsfw=False, duration__gte=4).exclude(uid__in=watched_videos).order_by('?')[:8]
		else:
			videos = Video.objects.filter(nsfw=False, duration__gte=4).exclude(uid__in=watched_videos).exclude(extension='webm').order_by('?')[:8]
	entries = []
	for v in videos:
		entry = {'video_id':v.uid, 'extension':v.extension, 'title':v.title, 'views':v.views, 'comments':v.comments, 'date':v.date.strftime('%d %b %Y'), 'nsfw':v.nsfw}
		entries.append(entry)
	return suggestions_to_html(entries)

def suggestions_to_html(entries):
	s = "<center><div class='v4'></div>"
	for e in entries:
		if e['nsfw']:
			txtnsfw = '[nsfw] '
		else:
			txtnsfw = ''
		s += "<div class='suggestion_entry cursorpointer' onclick='go_to_video(\"" + str(e['video_id']) + "\",\"" + str(e['extension']) + "\",\"" + txtnsfw + html_escape(e['title']) + "\")'>"
		s += "<img class='video_thumb' src='" + thumbs_root + "/" + str(e['video_id']) + ".jpg'>"
		s += '<div class="catalog_title" title="' + html_escape2(e['title']) + '">' + html_escape2(e['title'][:15]) + '</div>'
		s += "<div class='catalog_views'>"
		if e['views'] == 1:
			s += "<span>" + str(e['views']) + " view</span>"
		else:
			s += "<span>" + str(e['views']) + " views</span>"
		if e['comments'] == 1:
			s += "&nbsp;&nbsp;&nbsp; <span>" + str(e['comments']) + " comment</span>"
		else:
			s += "&nbsp;&nbsp;&nbsp; <span>" + str(e['comments']) + " comments</span>"
		s += "</div>"
		s += "</div>"
		s += "</div>"
		s += "<div class='play_next_btn' onclick='play_next($(this),\"" + str(e['video_id']) + "\")'>play next</div>"
	s += "</center>"
	return s

@csrf_exempt
def report_view(request):
	if request.method == 'POST':
		video = Video.objects.get(uid=request.POST['id'])
		video.views += 1
		video.save()
		return HttpResponse('ok')

def video_is_ok(request):
	video = request.FILES['video']
	title = ' '.join(request.POST['title'].strip().split()).replace('\\', '/')[:240]
	if len(title) < 1:
		return False
	if len(video.name.split('.')) < 2:
		return False
	extension = video.name.split('.')[-1].lower()
	if extension not in ['webm', 'mp4']:
		return False
	if video._size > 111111111:
		return False
	try:
		ip = get_ip(request)
		last_video = Video.objects.filter(ip=ip).last()
		if now() - last_video.date < datetime.timedelta(minutes=2):
			return False
	except:
		pass
	return True

def handle_uploaded_file(request, video_file, hash):

	title = ' '.join(request.POST['title'].strip().split()).replace('\\', '/')[:240]

	# if request.POST.get('nsfw', False):
	# 	nsfw = True
	# else:
	# 	nsfw = False
	# print nsfw

	nsfw = False;

	ip = get_ip(request)
	if not ip:
		ip = 0

	extension = video_file.name.split('.')[-1].lower()
	size = video_file._size / 1000000
	video = Video(title=title, last_modified=now(), ip=ip, date=now(), hash=hash, views=0, nsfw=nsfw, extension=extension)

	video.uid = random_alpha(9)
	success = False
	failures = 0

	while not success:
		try:
			video.save()
		except IntegrityError:
			failures += 1
			if failures > 500:
				raise
			else:
				video.uid = random_alpha(9)
		else:
			success = True

	video.key = video.uid + random_alpha(9)

	with open(root + '/media/videos/' + video.uid + '.' + extension , 'wb+') as destination:
		for chunk in video_file.chunks():
			destination.write(chunk)
	try:
		clip = VideoFileClip(root + '/media/videos/' + video.uid + '.' + extension)
		duration =  int(round(clip.duration))
		video.duration = duration
	except:
		video.duration = 0

	video.size = round(os.path.getsize(root + '/media/videos/' + video.uid + '.' + extension) / (1024*1024.0))

	video.save()
			
	shutil.copy(root + '/media/img/nothumb.jpg', root + '/media/thumbs/' + video.uid + '.jpg')
	subprocess.call(['ffmpeg', '-y', '-i', root + '/media/videos/' + video.uid + '.' + extension, '-ss', '00:00:3.000', '-vframes', '1', '-s', '260x145', root + '/media/thumbs/' + video.uid + '.jpg'])
	
	spaces_transfer.upload_file(root + '/media/videos/' + video.uid + '.' + extension, 'merkoba', 'hbv/' + video.uid + '.' + extension, extra_args={'ACL': 'public-read'})
	spaces_transfer.upload_file(root + '/media/thumbs/' + video.uid + '.jpg', 'merkoba', 'hbt/' + video.uid + '.jpg', extra_args={'ACL': 'public-read'})

	os.remove(root + '/media/videos/' + video.uid + '.' + extension)
	os.remove(root + '/media/thumbs/' + video.uid + '.jpg')	

	return video

def remove_video(name):
	spaces_client.delete_object(Bucket='merkoba', Key='hbv/' + name)
	spaces_client.delete_object(Bucket='merkoba', Key='hbt/' + name.split('.')[0] + '.jpg')	

def next_video(request):
	watched_videos = request.GET['watched_videos']
	nsfw = request.GET['nsfw']
	idop = request.GET['idop']
	can_play_webm = request.GET['can_play_webm']
	if can_play_webm == 'yes':
		can_play_webm = True
	else:
		can_play_webm = False
	if watched_videos == '':
		watched_videos = '0'
	watched_videos = watched_videos.split(',')
	if idop != '0':
		try:
			video = Video.objects.get(uid=idop)
			video_id = video.uid
			extension = video.extension
			if video.nsfw:
				title = '[nsfw] ' + video.title
			else:
				title = video.title
		except:
			video_id = 0
			title = 'handbeezy'
			extension = 'null'
	elif nsfw == 'yes':
		try:
			if can_play_webm:
				video = Video.objects.filter(nsfw=True, duration__gte=4).exclude(uid__in=watched_videos).order_by('?')[0]
			else:
				video = Video.objects.filter(nsfw=True, duration__gte=4).exclude(uid__in=watched_videos).exclude(extension='webm').order_by('?')[0]
			video_id = video.uid
			extension = video.extension
			title = '[nsfw] ' + video.title
		except:
			video_id = 0
			title = 'handbeezy'
			extension = 'null'
	else:
		try:
			if can_play_webm:
				video = Video.objects.filter(nsfw=False, duration__gte=4).exclude(uid__in=watched_videos).order_by('?')[0]
			else:
				video = Video.objects.filter(nsfw=False, duration__gte=4).exclude(uid__in=watched_videos).exclude(extension='webm').order_by('?')[0]
			video_id = video.uid
			extension = video.extension
			title = video.title
		except:
			video_id = 0
			title = 'handbeezy'
			extension = 'null'
	data = {'status':'ok', 'video_id':video_id, 'title': title, 'extension':extension}
	return HttpResponse(json.dumps(data), content_type="application/json")

def upload_error(request):
	return render(request, 'upload_error.html')

def add_video(request):
	c = create_c(request)
	return render(request, 'add_video.html', c)

@csrf_exempt
def edit_video(request, id, password):
	v = Video.objects.get(uid=id)
	if request.method == 'POST':
		if request.POST.get('delete', False):
			try:
				remove_video(v.uid + '.' + v.extension)
			except:
				pass
			v.delete()
			return HttpResponseRedirect('/')
		title = ' '.join(request.POST['title'].strip().split()).replace('\\', '/')[:240]
		if len(title) > 0:
			v.title = title
		if request.POST.get('nsfw', False):
			nnsfw = True
		else:
			nnsfw = False
		if nnsfw != v.nsfw:
			reports = Report.objects.filter(video_id=v, type='category')
			for r in reports:
				r.delete()
		v.nsfw = nnsfw
		v.save()
		return HttpResponseRedirect('/' + v.uid)	
	if password == 'pauver' or password == v.key:
		c = create_c(request)
		c['title'] = v.title
		c['nsfw'] = v.nsfw
		return render(request, 'edit.html', c)

@csrf_exempt
def edit_ads(request, password):
	if request.method == 'POST':
		if request.POST['password'] == 'pauver':
			text = request.POST['text'].strip()
			url = request.POST['url'].strip()
			if request.POST.get('nsfw', False):
				nsfw = True
			else:
				nsfw = False
			ad = Ad(text=text, url=url, nsfw=nsfw, date=now())
			ad.save()
			c = create_c(request)
			ads = Ad.objects.all().order_by('-date')
			c['ads'] = ads
			c['pw'] = 'pauver'
			return render(request, 'ads_editor.html', c)
		else:
			return HttpResponseRedirect('/')
	if password == 'pauver':
		c = create_c(request)
		ads = Ad.objects.all().order_by('-date')
		c['ads'] = ads
		c['pw'] = 'pauver'
		return render(request, 'ads_editor.html', c)

@csrf_exempt
def edit_one_ad(request, id, password):
	if request.method == 'POST':
		if request.POST['password'] == 'pauver':

			text = request.POST['text'].strip()
			url = request.POST['url'].strip()
			if request.POST.get('nsfw', False):
				nsfw = True
			else:
				nsfw = False
			if request.POST.get('udate', False):
				udate = True
			else:
				udate = False

			ad = Ad.objects.get(id=id)
			ad.text = text
			ad.url = url 
			ad.nsfw = nsfw 
			if udate:
				ad.date = now()	
			ad.save()

			return HttpResponseRedirect('/edit_ads/pauver')

		else:
			return HttpResponseRedirect('/')
	if password == 'pauver':
		c = create_c(request)
		ad = Ad.objects.get(id=id)
		c['ad'] = ad
		c['pw'] = 'pauver'
		return render(request, 'edit_one_ad.html', c)

def delete_ad(request, id, password):
	if password == 'pauver':
		ad = Ad.objects.get(id=id)
		ad.delete()
		return HttpResponseRedirect('/edit_ads/pauver')

def ads(request):
	c = create_c(request)
	return render(request, 'ads.html', c)

def likes(request):
	c = create_c(request)
	return render(request, 'likes.html', c)

def watched(request):
	c = create_c(request)
	return render(request, 'watched.html', c)

def uploaded(request):
	c = create_c(request)
	return render(request, 'uploaded.html', c)

def apprvid(request):
	id = request.POST['id']
	video = Video.objects.get(uid=id)
	video.likes += 1
	video.save()
	return HttpResponse('ok')

#
#
#  catalog
#
#

def catalog(request):
	c = create_c(request)
	entries = []
	videos = Video.objects.filter(nsfw=False, duration__gte=4).order_by('-id')[:24]
	for v in videos:
		entry = {'video_id':v.uid, 'title':v.title, 'views':v.views, 'comments':v.comments, 'date':v.date.strftime('%d %b %Y')}
		entries.append(entry)
	c['entries'] = entries_to_html(entries)
	return render(request, 'catalog.html', c)

def nsfw_catalog(request):
	c = create_c(request)
	entries = []
	videos = Video.objects.filter(nsfw=True, duration__gte=4).order_by('-id')[:24]
	for v in videos:
		entry = {'video_id':v.uid, 'title':v.title, 'views':v.views, 'comments':v.comments, 'date':v.date.strftime('%d %b %Y')}
		entries.append(entry)
	c['entries'] = entries_to_html(entries)
	return render(request, 'nsfw_catalog.html', c)

def get_latest_entries(request):
	entries = []
	videos = Video.objects.filter(nsfw=False, duration__gte=4).order_by('-id')[:24]
	for v in videos:
		entry = {'video_id':v.uid, 'title':v.title, 'views':v.views, 'comments':v.comments, 'date':v.date.strftime('%d %b %Y')}
		entries.append(entry)
	entries_html = entries_to_html(entries)
	data = {'status':'ok', 'entries':entries_html}
	return HttpResponse(json.dumps(data), content_type="application/json")

def get_latest_entries_nsfw(request):
	entries = []
	videos = Video.objects.filter(nsfw=True, duration__gte=4).order_by('-id')[:24]
	for v in videos:
		entry = {'video_id':v.uid, 'title':v.title, 'views':v.views, 'comments':v.comments, 'date':v.date.strftime('%d %b %Y')}
		entries.append(entry)
	entries_html = entries_to_html(entries)
	data = {'status':'ok', 'entries':entries_html}
	return HttpResponse(json.dumps(data), content_type="application/json")

def search_entries(request):
	query = ' '.join(request.GET['query'].strip().split())
	if query == '':
		Video.objects.filter(nsfw=False, duration__gte=4).order_by('-id')[:24]
	else:
		# videos = Video.objects.filter(reduce(or_, (Q(title__icontains=s, nsfw=False) for s in query.split()))).order_by('-last_modified')[:24]
		videos = Video.objects.filter(title__icontains=query, nsfw=False, duration__gte=4).order_by('-last_modified')[:24]
	entries = []
	for v in videos:
		entry = {'video_id':v.uid, 'title':v.title, 'views':v.views, 'comments':v.comments, 'date':v.date.strftime('%d %b %Y')}
		entries.append(entry)
	entries_html = entries_to_html(entries)
	data = {'status':'ok', 'entries':entries_html}
	return HttpResponse(json.dumps(data), content_type="application/json")

def sugg_search_entries(request):
	video_id = request.GET['id']
	query = ' '.join(request.GET['query'].strip().split())
	nsfw = request.GET['nsfw']
	cpw = request.GET['cpw']
	video = Video.objects.get(uid=video_id)
	if query == '':
		suggested = get_suggested(video, [], cpw)
	else:
		if nsfw == 'yes':
			if cpw == 'yes':
				videos = Video.objects.filter(title__icontains=query, duration__gte=4, nsfw=True).order_by('-last_modified')[:8]
			else:
				videos = Video.objects.filter(title__icontains=query, duration__gte=4, nsfw=True).exclude(extension='webm').order_by('-last_modified')[:8]
		else:
			if cpw == 'yes':
				videos = Video.objects.filter(title__icontains=query, duration__gte=4, nsfw=False).order_by('-last_modified')[:8]
			else:
				videos = Video.objects.filter(title__icontains=query, duration__gte=4, nsfw=False).exclude(extension='webm').order_by('-last_modified')[:8]
		if len(videos) > 0:
			entries = []
			for v in videos:
				entry = {'video_id':v.uid, 'extension':v.extension, 'title':v.title, 'views':v.views, 'comments':v.comments, 'date':v.date.strftime('%d %b %Y'), 'nsfw':v.nsfw}
				entries.append(entry)
			suggested = suggestions_to_html(entries)
		else:
			suggested = "<center><div class='sugg_noresults'>no results</div></center>"
	data = {'status':'ok', 'suggested':suggested}
	return HttpResponse(json.dumps(data), content_type="application/json")

def search_entries_nsfw(request):
	query = ' '.join(request.GET['query'].strip().split())
	if query == '':
		Video.objects.filter(nsfw=True, duration__gte=4).order_by('-id')[:24]
	else:
		# videos = Video.objects.filter(reduce(or_, (Q(title__icontains=s, nsfw=True) for s in query.split()))).order_by('-last_modified')[:24]
		videos = Video.objects.filter(title__icontains=query, nsfw=True, duration__gte=4).order_by('-last_modified')[:24]
	entries = []
	for v in videos:
		entry = {'video_id':v.uid, 'title':v.title, 'views':v.views, 'comments':v.comments, 'date':v.date.strftime('%d %b %Y')}
		entries.append(entry)
	entries_html = entries_to_html(entries)
	data = {'status':'ok', 'entries':entries_html}
	return HttpResponse(json.dumps(data), content_type="application/json")

def search_likes(request):
	query = ' '.join(request.GET['query'].strip().split())
	likes = request.GET['likes']
	if likes == '':
		data = {'status':'ok', 'entries':''}
		return HttpResponse(json.dumps(data), content_type="application/json")
	try:
		ids = likes.split(',')[::-1][:300]
	except:
		data = {'status':'ok', 'entries':''}
		return HttpResponse(json.dumps(data), content_type="application/json")
	preserved = Case(*[When(uid=pk, then=pos) for pos, pk in enumerate(ids)])
	if query == '':
		videos = Video.objects.filter(uid__in=ids).order_by(preserved)[:24]
	else:
		# videos = Video.objects.filter(reduce(or_, (Q(title__icontains=s, nsfw=False) for s in query.split()))).order_by('-last_modified')[:24]
		videos = Video.objects.filter(uid__in=ids, title__icontains=query).order_by(preserved)[:24]
	entries = []
	for v in videos:
		entry = {'video_id':v.uid, 'title':v.title, 'views':v.views, 'comments':v.comments, 'date':v.date.strftime('%d %b %Y')}
		entries.append(entry)
	entries_html = entries_to_html(entries)
	data = {'status':'ok', 'entries':entries_html}
	return HttpResponse(json.dumps(data), content_type="application/json")

def search_watched(request):
	query = ' '.join(request.GET['query'].strip().split())
	watched = request.GET['watched']
	if watched == '':
		data = {'status':'ok', 'entries':''}
		return HttpResponse(json.dumps(data), content_type="application/json")
	try:
		ids = watched.split(',')[::-1][:300]
	except:
		data = {'status':'ok', 'entries':''}
		return HttpResponse(json.dumps(data), content_type="application/json")
	preserved = Case(*[When(uid=pk, then=pos) for pos, pk in enumerate(ids)])
	if query == '':
		videos = Video.objects.filter(uid__in=ids).order_by(preserved)[:24]
	else:
		# videos = Video.objects.filter(reduce(or_, (Q(title__icontains=s, nsfw=False) for s in query.split()))).order_by('-last_modified')[:24]
		videos = Video.objects.filter(uid__in=ids, title__icontains=query).order_by(preserved)[:24]
	entries = []
	for v in videos:
		entry = {'video_id':v.uid, 'title':v.title, 'views':v.views, 'comments':v.comments, 'date':v.date.strftime('%d %b %Y')}
		entries.append(entry)
	entries_html = entries_to_html(entries)
	data = {'status':'ok', 'entries':entries_html}
	return HttpResponse(json.dumps(data), content_type="application/json")

def search_uploaded(request):
	query = ' '.join(request.GET['query'].strip().split())
	uploaded = request.GET['uploaded']
	if uploaded == '':
		data = {'status':'ok', 'entries':''}
		return HttpResponse(json.dumps(data), content_type="application/json")
	try:
		ids = uploaded.split(',')[::-1][:300]
	except:
		data = {'status':'ok', 'entries':''}
		return HttpResponse(json.dumps(data), content_type="application/json")
	preserved = Case(*[When(uid=pk, then=pos) for pos, pk in enumerate(ids)])
	if query == '':
		tracks = Video.objects.filter(uid__in=ids).order_by(preserved)[:24]
	else:
		tracks = Video.objects.filter(uid__in=ids, title__icontains=query).order_by(preserved)[:24]
	entries = []
	for v in tracks:
		entry = {'video_id':v.uid, 'title':v.title, 'views':v.views, 'comments':v.comments, 'date':v.date.strftime('%d %b %Y')}
		entries.append(entry)
	entries_html = entries_to_html(entries)
	data = {'status':'ok', 'entries':entries_html}
	return HttpResponse(json.dumps(data), content_type="application/json")

def entries_to_html(entries):
	s = ""
	for e in entries:
		s += "<div class='catalog_entry'>"
		s += "<a href='/" + str(e['video_id']) + "' class='entry'><div class='entry'>"
		s += "<img class='video_thumb' src='" + thumbs_root + "/" + str(e['video_id']) + ".jpg'>"
		s += "<div class='catalog_title' title='" + html_escape2(e['title']) + "'>" + html_escape2(e['title'][:15]) + "</div>"
		s += "</a>"
		s += "<div class='catalog_views'>"
		if e['views'] == 1:
			s += "<span>" + str(e['views']) + " view</span>"
		else:
			s += "<span>" + str(e['views']) + " views</span>"
		if e['comments'] == 1:
			s += "&nbsp;&nbsp;&nbsp; <span>" + str(e['comments']) + " comment</span>"
		else:
			s += "&nbsp;&nbsp;&nbsp; <span>" + str(e['comments']) + " comments</span>"
		s += "<div class='entry_bottom'><span>" + str(e['date']) + "</span> &nbsp;&nbsp; <span onclick='add_to_playlist(this,\"" + str(e['video_id']) + "\")' class='playlistlink' data-id='" + str(e['video_id']) + "'>add to playlist</span></div>"
		s += "</div>"
		s += "</div>"
		s += "</div>"
	return s

# def enter(request):
# 	auth_logout(request)
# 	if request.method == 'POST':
# 		username = request.POST['username']
# 		password = request.POST['password']
# 		user = authenticate(username=username, password=password)
# 		if user is not None:
# 			auth_login(request, user)
# 			return HttpResponseRedirect('/')
# 		else:
# 			if not register_details_are_ok(username, password):
# 				return HttpResponseRedirect('/enter')
# 			username = username.lower().strip()
# 			email = ''
# 			user = User.objects.create_user(username, email, password)
# 			p = Profile(user=user)
# 			p.save()
# 			user.backend='django.contrib.auth.backends.ModelBackend'
# 			auth_login(request, user)
# 			return HttpResponseRedirect('/')
# 	else:
# 		return render(request, 'enter.html')

# def register_details_are_ok(username, password):
# 	username = username.lower().strip()
# 	if not clean_username(username):
# 		return False
# 	if len(username) < 1 or len(username) > 17:
# 		return False
# 	if len(password) < 1 or len(password) > 30:
# 		return False
# 	return True

# def clean_username(username):
# 	try:
# 		p = re.compile(r"[a-zA-Z0-9]+")
# 		strlist = p.findall(username)
# 		if strlist:
# 			s = ''.join(strlist)
# 			if s == username:
# 				return s
# 			else:
# 				return False
# 		return False
# 	except:
# 		return False

def nignog(request):
	return render(request, 'nignog.html')


#
#
#
#    BOARD
#
#
#

def error(request, code):
	code = int(code)
	c = {}
	if code == 1:
		c['message'] = 'error: debe esperar un minuto para postear otra vez'
	elif code == 2:
		c['message'] = 'error: el texto no debe ser mas largo que 2000 caracteres'
	elif code == 3:
		c['message'] = 'error: no escribio ningun texto'
	elif code == 4:
		c['message'] = 'error: no eligio ninguna imagen'
	return render(request, 'message.html', c)

def save_quotes(post):
	pattern = re.compile('>>(\d+)')
	search = re.findall(pattern, post.text)
	qids = []
	for qid in search:
		if qid not in qids:
			qids.append(qid)
			quote = Post.objects.get(id=qid)
			q = Quote(post=post, quote=quote)
			q.save()

@csrf_exempt
def post_post(request):
	text = request.POST['text'].strip()[:2000]
	video_id = request.POST['video_id']
	video = Video.objects.get(uid=video_id)
	status = check_post(request, video)
	if status == 'ok':
		ip = get_ip(request)
		if not ip:
			ip = 0
		p = Post(video=video, text=text, date=now(), ip=ip)
		p.save()
		video.last_modified = now()
		video.comments += 1
		video.save()
		save_quotes(p)
		data = {'status':'ok'}
	elif status == 'mustwait':
		data = {'status':'error', 'error':'you must wait 30 seconds before commenting again'}
	elif status == 'toolong':
		data = {'status':'error', 'error':'the comment is too long'}
	elif status == 'empty':
		data = {'status':'error', 'error':'the comment is empty'}
	elif status == 'linebreaks':
		data = {'status':'error', 'error':'too many linebreaks'}
	elif status == 'full':
		data = {'status':'error', 'error':'no more comments can be posted'}
	return HttpResponse(json.dumps(data), content_type="application/json")

def check_post(request, video):
	if video.comments >= 300:
		return 'full'
	text = request.POST['text'].strip()[:2000]
	if len(text) == 0:
		return 'empty'
	# if len(text) > 2000:
	# 	return 'toolong'
	if text.count('\n') > 20:
		return 'linebreaks'
	try:
		ip = get_ip(request)
		last_post = Post.objects.filter(ip=ip).last()
		if now() - last_post.date < datetime.timedelta(seconds=30):
			return 'mustwait'
	except:
		pass
	return 'ok'

def get_info(request):
	video_id = request.GET['video_id']
	mode = request.GET['mode']
	video = Video.objects.get(uid=video_id)
	fobs = {}
	fobs['posts'] = []
	posts = Post.objects.filter(video__uid=video_id).order_by('-id')
	for p in posts:
		fobitem = {}
		fobitem['post'] = p
		fobitem['quotes'] = Quote.objects.filter(quote=p)
		fobs['posts'].append(fobitem)
	html_posts = posts_to_html(fobs)
	if mode == 'all':
		date = video.date.strftime('%d %b %Y')
		size = str(video.size)
		extension = video.extension
		watched_videos = request.GET['watched_videos']
		watched_videos = watched_videos.split(',')
		can_play_webm = request.GET['can_play_webm']
		if can_play_webm == 'yes':
			can_play_webm = True
		else:
			can_play_webm = False
		suggested = get_suggested(video, watched_videos, can_play_webm)
		try:
			ado = Ad.objects.all().filter(nsfw=video.nsfw).order_by('?')[0]
			ad = "<a target='_blank' class='scooter' href='" + ado.url + "'>" + ado.text + "</a>"
		except:
			ad = "<a target='_blank' class='scooter' href='http://handbeezy.com/ads'>your ad can be here</a>"
		data = {'status':'ok', 'posts':html_posts, 'views':video.views, 'date':date, 'size':size, 'extension':extension, 'suggested':suggested, 'ad':ad, 'uid':video.uid}
	else:
		data = {'status':'ok', 'posts':html_posts, 'views':video.views, 'date':'', 'size':'', 'extension':'', 'suggested':'', 'ad':''}
	return HttpResponse(json.dumps(data), content_type="application/json")	

def posts_to_html(fobs):
	s = ""
	for p in fobs['posts']:
		s += "<div class='v1'></div>"
		s += "<div class='reply'>"
		s += "<div class='post_id' id=" + str(p['post'].id) + "> </div>"
		s += "<div class='post_details'>"
		s += "<div onclick='go_to_post(" + str(p['post'].id) + ")' class='post_date'>" + str(p['post'].date) + "</div>"
		s += "<div onclick=\"respond('" + str(p['post'].id) + "')\" class='respond'> reply </div>"
		for q in p['quotes']:
			s += "<div onclick='go_to_post(" + str(q.post.id) + ")' class='header_quote'> >>" + str(q.post.id) + "</div>"
		s += "</div>"
		s += "<div class='post_text'>" + urlize(quotes_text(arrows(linebreaks(html_escape2(p['post'].text))))) + "</div>"
		s += "<div class='clear'></div>"
		s += "</div>"
	return s

def quotes_text(value):
	pat = "&gt;&gt;(\\d+)"
	res = re.sub(pat, check_quotes, value)
	return res

def check_quotes(match):
	g = str(match.group(1))
	return "<div onclick='go_to_post(" + g + ");' class='quote'> >>" + g + "</div>" 	

def arrows(value):
	soup = BeautifulSoup(value, 'html.parser')
	for item in soup.find_all(text=lambda x: x.strip().startswith('>')):
		item.wrap(soup.new_tag("div class='arrow'"))
	return soup.prettify()

#
#
#
#      MOVIES 
#
#
#

def movies(request):
	if not request.user.is_authenticated():
		return HttpResponseRedirect('/movies_login')
	c = create_c(request)
	p = Profile.objects.get(user=request.user)
	ulist = []
	profiles = Profile.objects.filter(~Q(movies = '0'))
	for p in profiles:
		if p.user != request.user:
			ulist.append(p.user.username)
	c['users'] = ulist
	c['username'] = request.user.username
	return render(request, 'movies.html', c)

def movies_login(request):
	if request.method == 'POST':
		username = request.POST['username']
		try:
			user = User.objects.get(username=username)
			p = Profile.objects.get(user=user)
			if p.movies != '0':
				user = authenticate(username=username, password='')
				auth_login(request, user)
				return HttpResponseRedirect('/movies')
			else:
				return HttpResponseRedirect('/')
		except:

			username = username[:17].lower().strip().replace(" ", "")
			password = ''
			email = ''
			user = User.objects.create_user(username, email, password)
			p = Profile(user=user)
			movies = Movie.objects.all()
			ms = ''
			for m in movies:
				ms += str(m.id) + ','
			ms = ms[:-1]
			p.movies = ms
			p.save()
			user.backend='django.contrib.auth.backends.ModelBackend'
			auth_login(request, user)
			return HttpResponseRedirect('/movies')

	else:
		return render(request, 'movies_login.html')

def add_movie(request):
	title = request.POST['title']
	genre = request.POST['genre']
	plot = request.POST['plot']
	poster = request.POST['poster']
	url = request.POST['url']
	movie = Movie(title=title,genre=genre,plot=plot,poster=poster,url=url,score=0)
	movie.save()
	profiles = Profile.objects.filter(~Q(movies = '0'))
	for p in profiles:
		p.movies += ',' + str(movie.id) 
		p.save()
	update_overall_rank()
	return HttpResponse('ok')

def package_movies(movies):
	ml = []
	for m in movies:
		ms = {}
		ms['id'] = m.id
		ms['title'] = m.title
		ms['genre'] = m.genre
		ms['plot'] = m.plot
		ms['poster'] = m.poster
		ms['url'] = m.url
		ms['torrent'] = m.torrent
		ml.append(ms)
	return ml

def get_movies_rank(request):
	which = request.GET['which']
	movies = []
	if which == 'overall':
		movies = Movie.objects.all().order_by('-score')
	else:
		p = Profile.objects.get(user__username=which)
		try:
			ids = map(int, p.movies.split(','))
			movies = Movie.objects.filter(id__in=ids)
			movies = list(movies)
			movies.sort(key=lambda x: ids.index(x.id))
		except:
			pass
	data = {'status':'ok', 'movies':package_movies(movies)}
	return HttpResponse(json.dumps(data), content_type="application/json")

def update_movies_rank(request):
	movies = request.POST['movies']
	p = Profile.objects.get(user=request.user)
	p.movies = movies
	p.save()
	update_overall_rank()
	return HttpResponse('ok')

def update_overall_rank():
	movie_points = []
	profiles = Profile.objects.filter(~Q(movies = '0'))
	for p in profiles:
		movie_counter = 1;
		try:
			ids = map(int, p.movies.split(','))
			for id in ids:
				points = movie_counter
				movie_points.append({'id':id,'points':points})
				movie_counter += 1
		except:
			continue

	sums = collections.Counter()

	for obj in movie_points: 
		sums[obj['id']] += obj['points']

	movie_count = Movie.objects.count()

	for sum in sums:
		try:
			movie = Movie.objects.get(id=sum)
			movie.score = movie_count - sums[sum]
			movie.save()
		except:
			pass

def remove_movie(request):
	id = request.POST['id']
	movie = Movie.objects.get(id=id)
	movie.delete()
	return HttpResponse('ok')

def remove_user(request):
	username = request.POST['username']
	user = User.objects.get(username=username)
	user.delete()
	return HttpResponse('ok')

def add_torrent(request):
	id = request.POST['id']
	torrent = request.POST['torrent']
	movie = Movie.objects.get(id=id)
	movie.torrent = torrent
	movie.save()
	return HttpResponse('ok')


### Reports

# @csrf_exempt
# def report_video_category(request):

# 	ip = get_ip(request)
# 	if not ip:
# 		ip = 0

# 	uid = request.POST['video_id']

# 	video = Video.objects.get(uid=uid)

# 	try:
# 		Report.objects.get(ip=ip, video=video, type='category')
# 	except:
# 		report = Report(ip=ip, video=video, type='category', date=now())
# 		report.save()
# 		count = Report.objects.filter(video=video, type='category').count()
# 		if count >= 5:
# 			if video.nsfw:
# 				video.nsfw = False
# 			else:
# 				video.nsfw = True
# 			video.save()

# 			reports = Report.objects.filter(video_id=video, type='category')

# 			for r in reports:
# 				r.delete()

# 	return HttpResponse('ok')

@csrf_exempt
def report_video_serious(request):

	ip = get_ip(request)
	if not ip:
		ip = 0

	uid = request.POST['video_id']

	video = Video.objects.get(uid=uid)

	try:
		Report.objects.get(ip=ip, video=video, type='serious')
	except:
		report = Report(ip=ip, video=video, type='serious', date=now())
		report.save()
		count = Report.objects.filter(video=video, type='serious').count()
		if count >= 5:
			remove_video(video.uid + '.' + video.extension)
			video.delete()
		
	return HttpResponse('ok')

def show_reports(request, password):
	if password == 'pauver':
		c = create_c(request)
		c['reports'] = Report.objects.all().order_by('-id')[:100]
		return render(request, 'reports.html', c)
	return HttpResponseRedirect('/')

@csrf_exempt
def send_suggestion(request):
	suggestion = request.POST['suggestion'].strip()[:3000]
	the_sugg = Suggestion(text=suggestion, date=now())
	the_sugg.save()

	return HttpResponse('ok')
	
def show_suggestions(request, password):
	if password == 'pauver':
		c = create_c(request)
		c['suggestions'] = Suggestion.objects.all().order_by('-id')[:24]
		return render(request, 'suggestions.html', c)
	else:
		return HttpResponseRedirect('/')
