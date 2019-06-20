import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "handbeezy.settings")
import django
django.setup()

from server.models import *

root = os.getcwd()

path = root + '/media/videos/'

videos = Video.objects.filter(nsfw=True)

deleted = 0

for video in videos:
	if video.nsfw:
		os.remove(path + video.uid + '.' + video.extension)
		video.delete()
		deleted += 1

print deleted
	