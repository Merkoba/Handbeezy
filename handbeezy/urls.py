import os
from django.conf.urls import *

handler404 = 'server.views.redirect'

handler500 = 'server.views.error'

BASE_DIR = os.path.dirname(os.path.dirname(__file__))

urlpatterns = patterns('',
    (r'^media/(?P<path>.*)$', 'django.views.static.serve',{'document_root': './media','show_indexes': False}),
    # (r'^movies/$', 'server.views.movies'),
    # (r'^movies_login/$', 'server.views.movies_login'),
    # (r'^add_movie/$', 'server.views.add_movie'),
    # (r'^get_movies_rank/$', 'server.views.get_movies_rank'),
    # (r'^update_movies_rank/$', 'server.views.update_movies_rank'),
    # (r'^remove_movie/$', 'server.views.remove_movie'),
    # (r'^remove_user/$', 'server.views.remove_user'),
    # (r'^add_torrent/$', 'server.views.add_torrent'),
    (r'^nignog/$', 'server.views.nignog'),
    (r'^next_video/$', 'server.views.next_video'),
    (r'^enter/$', 'server.views.enter'),
    (r'^post_post/$', 'server.views.post_post'),
    (r'^get_info/$', 'server.views.get_info'),
    (r'^upload_error/$', 'server.views.upload_error'),
    (r'^catalog/$', 'server.views.catalog'),
    # (r'^nsfw_catalog/$', 'server.views.nsfw_catalog'),
    # (r'^report_video_category/$', 'server.views.report_video_category'),
    (r'^report_video_serious/$', 'server.views.report_video_serious'),
    (r'^get_latest_entries/$', 'server.views.get_latest_entries'),
    (r'^get_latest_entries_nsfw/$', 'server.views.get_latest_entries_nsfw'),
    (r'^search_entries/$', 'server.views.search_entries'),
    (r'^sugg_search_entries/$', 'server.views.sugg_search_entries'),
    # (r'^search_entries_nsfw/$', 'server.views.search_entries_nsfw'),
    (r'^add_video/$', 'server.views.add_video'),
    (r'^get_metadata/$', 'server.views.report_view'),
    (r'^send_suggestion/$', 'server.views.send_suggestion'),
    (r'^suggestions/(?P<password>\w+)/$', 'server.views.show_suggestions'),
    # (r'^apprvid/$', 'server.views.apprvid'),
    (r'^ads/$', 'server.views.ads'),
    (r'^likes/$', 'server.views.likes'),
    (r'^watched/$', 'server.views.watched'),
    (r'^uploaded/$', 'server.views.uploaded'),
    (r'^search_likes/$', 'server.views.search_likes'),
    (r'^search_watched/$', 'server.views.search_watched'),
    (r'^search_uploaded/$', 'server.views.search_uploaded'),
    (r'^edit_ads/(?P<password>\w+)/$', 'server.views.edit_ads'),
    (r'^delete_ad/(?P<id>\w+)/(?P<password>\w+)/$', 'server.views.delete_ad'),
    (r'^edit_one_ad/(?P<id>\w+)/(?P<password>\w+)/$', 'server.views.edit_one_ad'),
    (r'^show_reports/(?P<password>\w+)/$', 'server.views.show_reports'),
    (r'^(?P<id>\w+)/$', 'server.views.show_video'),
    (r'^(?P<id>\w+)/edit/(?P<password>\w+)/$', 'server.views.edit_video'),
    (r'^$', 'server.views.main'),
)

