var watched_videos = [];
var autonext = false;
var nsfw = false;
var comments_count = -1;
var title;
var video_id = 0;
var next_enabled = true;
var player_counted = false;
var jumper_on = false;
var last_wv = false;
var mouse_timeout;
var other_menu_on = false;
var columns_on = false;
var last_comment_written = '';
var popup_post_timeout;
var mobile_version = false;
var likes;
var watched;
var theme;
var play_likes_index = 0;
var likes_to_play = [];
var can_play_webm = true;
var url_params={};
var next_to_play = 0;
var playlist_ids = [];

window.onbeforeunload = function()
{
	window.scrollTo(0,0);
}

function WatchedVideo()
{
	this.id;
	this.title;
	this.extension;
}

function get_wv_by_id(id)
{
	for(var i = 0; i < watched_videos.length; i++)
	{
		if(watched_videos[i].id === id)
		{
			return watched_videos[i];
		}
	}
}

function watched_videos_to_string()
{
	s = '';
	for(var i = 0; i < watched_videos.length; i++)
	{
		s += watched_videos[i].id + ',';
	}
	return s.substring(0, s.length - 1);
}

function watched_to_string(num)
{
	s = '';

	var rwatched = watched.slice(0).slice(0 - num);

	for(var i = 0; i < rwatched.length; i++)
	{
		s += rwatched[i] + ',';
	}
	return s.substring(0, s.length - 1);
}

function uploaded_to_string(num)
{
	s = '';

	var ruploaded = uploaded.slice(0).slice(0 - num);

	for(var i = 0; i < ruploaded.length; i++)
	{
		s += ruploaded[i].slice(0,9) + ',';
	}
	return s.substring(0, s.length - 1);
}

function likes_to_string(num)
{
	s = '';

	var rlikes = likes.slice(0).slice(0 - num);

	for(var i = 0; i < rlikes.length; i++)
	{
		s += rlikes[i] + ',';
	}
	return s.substring(0, s.length - 1);
}

function get_next_like()
{
	if(play_likes_index >= likes_to_play.length)
	{
		play_likes = 'no';
		return 'finished';
	}
	else
	{
		var nl = likes_to_play[play_likes_index];

		play_likes_index += 1;

		if(play_likes_index >= likes_to_play.length)
		{
			$('#autonext_checkbox').prop('checked', false);
			$('#other_menu_enable_automatic').html('Enable Automatic');
			autonext = false;
		}

		return nl;
	}
}

function get_url_params()
{
	window.location.search
	  .replace(/[?&]+([^=&]+)=([^&]*)/gi, function(str,key,value) {
	    url_params[key] = value.trim();
	  }
	);
}

function remove_url_params()
{
	window.history.replaceState({} , 'foo', window.location.href.split('?')[0]);
}

function init()
{
	get_url_params();
	get_uploaded();
	var key = url_params.key
	if(key !== undefined)
	{
		if(key != '')
		{
			add_uploaded(key);
		}
	}
	check_formats();
	var wv = new WatchedVideo();
	player_counted = false;
	wv.id = video_id;
	wv.title = document.title.replace(' - Handbeezy', '');
	title = wv.title;
	wv.extension = video_extension;
	watched_videos.push(wv);
	if(video_extension == 'webm' && can_play_webm == false)
	{
		next_video();
	}
	get_watched();
	add_watched(video_id);
	fix_layout();
	activate_resize();
	activate_key_detection();
	activate_file_detection();
	activate_autonext();
	get_likes();
	if(play_likes == 'yes')
	{
		likes_to_play = likes.slice(0);

		if(likes_to_play.length > 1)
		{
			automatic_change2();
		}

		if(random_order == 'yes')
		{
			shuffle(likes_to_play);
		}
		else
		{
			likes_to_play.reverse();
		}

		var i = likes_to_play.indexOf(video_id);

		if(i != -1)
		{
			likes_to_play.splice(i, 1);
		}
	}
	var playlist = url_params.playlist;
	if(playlist != undefined)
	{
		likes_to_play = playlist.split('_').slice(0,10)

		if(likes_to_play.length > 0)
		{
			automatic_change2();

			var i = likes_to_play.indexOf(video_id);

			if(i != -1)
			{
				likes_to_play.splice(i, 1);
			}

			play_likes = 'yes';
		}
	}
	$.data($('#info')[0], 'info_timer', setTimeout(function() {get_info('all');}, 2000));
	cursor_hider();
	other_menu_hider();
	create_video_context_menu();
	time_changer();
	start_video_click();
	activate_play_icon();
	activate_volume_scroll();
	remove_url_params();
}

function activate_key_detection()
{
     $(document).keydown(function(e)
     {
        code = (e.keyCode ? e.keyCode : e.which);

        if(code === 13)
        {
            if($('#username').is(':focus') || $('#password').is(':focus'))
            {
                document.form.submit();
            }
            if($('#input_catalog_search').is(':focus'))
            {
            	search_catalog();
            }
            if($('#input_catalog_search_nsfw').is(':focus'))
            {
            	search_catalog_nsfw();
            }
            if($('#input_likes_search').is(':focus'))
            {
            	search_likes();
            }
            if($('#input_watched_search').is(':focus'))
            {
            	search_watched();
            }
            if($('#input_uploaded_search').is(':focus'))
            {
            	search_uploaded();
            }
            if($('#input_video_title').is(':focus'))
            {
            	do_upload();
            	e.preventDefault();
            }
            if($('#hover_suggestions_filter').is(':focus'))
            {
          //   	if(e.shiftKey)
	        	// {
	        	// 	queue_first_suggestion();
	        	// }
	        	// else
	        	// {
          //   		play_first_suggestion();
	        	// }

				sugg_search_catalog();
            }
        }

        if($('#input_video_title').is(':focus'))
        {
        	if($('#input_video_title').val().length > 0)
        	{
        		if($('#input_video_title').val().length > 240)
        		{
        			$('#input_video_title').val($('#input_video_title').val().substring(0,240));
        		}
        	}
        	else
        	{
        		
        	}
        }

        if(!$('#board_post_text').is(':focus') && $('#video').length && !$('#suggestion_text').is(':focus') && !$('#hover_suggestions_filter').is(':focus'))
        {
	        if(code === 32)
	        {	
	        	if(e.ctrlKey)
	        	{
	        		replay();
	        	}
	        	else
	        	{
					toggle_player();
	        	}
	        }

	        if(code === 37)
	        {	
				previous_video();
	        }

            if(code === 38)
            {	
            	toggle_like();
            }

            if(code === 40)
            {	
            	toggle_columns();
            }

	        if(code === 39)
	        {	
				next_video();
	        }

	        if(code === 13)
	        {
	        	if(!$('#comment_submit').is(':focus'))
	        	{
	        		automatic_change2();
	        	}
	        }

        }

        if(code === 27)
        {
        	search();
        }

     });

     // $('#hover_suggestions_filter').on('input', function()
     // {
     // 	 suggfilter_timer();
     // });
}

function search()
{
	hover_suggestions();

	if($('#hover_suggestions_filter').val() != '')
	{
		$('#hover_suggestions_filter').val('');
		sugg_search_catalog();
	}

	$('#hover_suggestions_filter').focus();
}

function play_first_suggestion()
{
	$($('.suggestion_entry').get(0)).trigger('click');
}

function queue_first_suggestion()
{
	$($('.play_next_btn').get(0)).trigger('click');
}

var suggfilter_timer = (function() 
{
    var timer; 
    return function(msg, options) 
    {
        clearTimeout(timer);
        timer = setTimeout(function() 
        {
            sugg_search_catalog();
        }, 1000);
    };
})();

function sugg_search_catalog()
{
	var query = $('#hover_suggestions_filter').val().trim();

	if(nsfw)
	{
		var snsfw = 'yes'
	}
	else
	{
		var snsfw = 'no'
	}

	if(can_play_webm)
	{
		var cpw = 'yes';
	}
	else 
	{
		var cpw = 'no';
	}

	$.get('/sugg_search_entries/',
	{
		query:query,
		id: video_id,
		nsfw: snsfw,
		cpw: cpw
	},
	function(data) 
	{
		place_suggestions(data.suggested);
		$('#hover_suggestions_filter').val('');
	});
}

function camelCase(str) 
{
   var splitStr = str.split(' ');
   for (var i = 0; i < splitStr.length; i++) 
   {
       splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
   }
   return splitStr.join(' '); 
}

function detect_file_name()
{
	try
	{
		var file = $('#file_picker')[0].files[0];
		var name = camelCase(file.name.split('.').slice(0, -1).join('.').replace(/\_/g, ' ').replace(/\s+/g, " "));
		$('#input_video_title').val(name);
	}
	catch(err)
	{
		
	}
}

function activate_file_detection()
{
	$('#file_picker').bind('change', function() 
	{
		var file = this.files[0];
		
		if(!endsWith(file.name.toLowerCase(), '.webm') && !endsWith(file.name.toLowerCase(), '.mp4'))
		{
			$('#file_checkmark').css('display', 'none');
			clear_form();
			alert('Only mp4 and webm videos are supported.')
			return false;
		}

		if(file.size > 111111111)
		{
			$('#file_checkmark').css('display', 'none');
			clear_form();
			alert('File is too big!');
			return false;
		}

		if(this.files.length !== 1)
		{
			$('#file_checkmark').css('display', 'none');
			alert('You can only select 1 video.')
			clear_form();
			return false;
		}

		$('#file_checkmark').css('display', 'inline-block');

		if($('#input_video_title').val() == '')
		{
			detect_file_name();
		}

		$('#input_video_title').focus()
	});
}

function do_upload()
{

	if($.trim($('#input_video_title').val()) === '' || uploading_video || $('#file_picker').val() === '')
	{
		return false;
	}

	$('#btn_upload').html('uploading');

	$('#btn_upload').css('text-decoration', 'none');

	$('#btn_upload').addClass('blue_glower');

	document.form.submit();

	$('#input_video_title').attr('disabled', true);
	$('#file_picker').attr('disabled', true);
	$('#nsfw').attr('disabled', true);

	uploading_video = true;
}

function endsWith(str, suffix) 
{
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

function clear_form()
{
	$('#file_picker').wrap('<form>').closest('form').get(0).reset();
	$('#file_picker').unwrap();
}

function fix_layout()
{
	var height = $(window).height();
	var top_height = $('#top').outerHeight();
	var cheight = height - top_height;
	$('#video').height(cheight);
	var video_top = $('#video').offset().top;
	$('#hover_comments_container').height(cheight).css('top', video_top);
	$('#hover_suggestions_container').height(cheight).css('top', video_top);
	var hsc = $('#hover_suggestions_container').outerHeight();
	var sf = $('#hover_suggestions_filter').outerHeight();
	$('#hover_suggestions_inner').height(hsc - sf)
	var fch = $('#form_container').outerHeight();
	$('#hover_comments_inner').height(cheight - fch);
	$('#play_icon').css('top', video_top);
	if($(window).width() < 1326)
	{
		mobile_version = true;
		hide_play_icon();
	}
	else
	{
		mobile_version = false;
	}
}

function activate_resize()
{
	$(window).resize(function() 
	{
		hide_other_menu();
		fix_layout();
	});
}

function remove_duplicate_wv()
{
	var lwv = watched_videos[watched_videos.length - 1];

	for(var i = 0; i < watched_videos.length; i++)
	{
		if(watched_videos[i].id == lwv.id && watched_videos[i] != lwv) 
	    {
			watched_videos.splice(i,1);
			i--;
	    }
	}
}

function change_video()
{
	next_to_play = 0;
	remove_duplicate_wv();
	hide_columns();
	hide_other_menu();
	hide_context_menu();
	window.history.pushState({"pageTitle": "title", content: "etc"}, "", '/' + video_id + '/');
	document.title = title + ' - Handbeezy';
	player_counted = false;
	add_watched(video_id);
	video_time = 0;
	$('#info').html(escapeHTML(title));
	$('#video').attr('src', `${videos_root}/${video_id}.${video_extension}`);
	$('#posts').html('');
	comments_count = -1;
	fix_layout();
	$.data($('#info')[0], 'info_timer', setTimeout(function() {get_info('all');}, 2000));
	$('#hover_suggestions_filter').val('');
}

function previous_video()
{
	var wv = get_wv_by_id(video_id);
	var indx = watched_videos.indexOf(wv)
	var pwv = watched_videos[indx - 1];
	if(pwv !== undefined)
	{
		clearTimeout($('#info').data('info_timer'));
		watched_videos.splice(indx, watched_videos.length)
		video_id = pwv.id;
		title = pwv.title;
		video_extension = pwv.extension;
		change_video();
	}
}

function next_video()
{
	clearTimeout($('#info').data('info_timer'));

	// var wv = get_wv_by_id(video_id)
	// var nwv = watched_videos[watched_videos.indexOf(wv) + 1];
	// if(nwv !== undefined)
	// {
	// 	video_id = nwv.id;
	// 	title = nwv.title
	// 	video_extension = nwv.extension;
	// 	change_video();
	// }

	if(!next_enabled)
	{
		return false;
	}

	next_enabled = false;

	if(nsfw)
	{
		var snsfw = 'yes'
	}
	else
	{
		var snsfw = 'no'
	}

	if(next_to_play != 0)
	{
		var idop = next_to_play;
		var watchv = '0'
		next_to_play = 0;
	}

	else
	{
		if(play_likes == 'yes')
		{
			next_like = get_next_like();

			if(next_like == 'finished')
			{
				var idop = 0;
				var watchv = watched_videos_to_string();
			}
			else
			{
				var idop = next_like;
				var watchv = '0';
			}
		}
		else
		{
			var idop = 0;
			var watchv = watched_videos_to_string();
		}
	}

	if(can_play_webm)
	{
		var cpw = 'yes';
	}
	else 
	{
		var cpw = 'no';
	}

	$.get('/next_video/',
	{
		watched_videos: watchv,
		nsfw: snsfw,
		idop: idop,
		can_play_webm: cpw
	},
	function(data) 
	{
		next_enabled = true;
		if(data.video_id == 0)
		{
			if(idop != 0)
			{
				remove_like(idop);
				next_video();
				return false;
			}
		}
		else
		{
			video_id = data.video_id;
			video_extension = data.extension;
			var wv = new WatchedVideo();
			wv.id = video_id;
			wv.title = data.title;
			wv.extension = data.extension;
			watched_videos.push(wv);
			title = wv.title;
			change_video();
		}
	});
}

function go_to_video(id, extension, otitle)
{
	clearTimeout($('#info').data('info_timer'));
	if(last_wv)
	{
		if(last_wv.id == id)
		{
			return false;
		}
	}
	video_id = id;
	video_extension = extension;
	var wv = new WatchedVideo();
	wv.id = video_id;
	wv.title = otitle;
	wv.extension = extension;
	last_wv = wv;
	watched_videos.push(wv);
	title = wv.title;
	var indx = likes_to_play.indexOf(id);
	if(indx != -1)
	{
		likes_to_play.splice(indx, 1);
		if(play_likes_index >= likes_to_play.length)
		{
			$('#autonext_checkbox').prop('checked', false);
			$('#other_menu_enable_automatic').html('Enable Automatic');
			autonext = false;
		}
	}
	change_video();
}

function automatic_change()
{
	autonext = $('#autonext_checkbox').prop('checked');

	if(autonext)
	{
		$('#other_menu_enable_automatic').html('Disable Automatic');
	}
	else 
	{
		$('#other_menu_enable_automatic').html('Enable Automatic');
	}

	if(autonext && columns_on)
	{
		next_video();
	}
}

function automatic_change2()
{
	var checked = $('#autonext_checkbox').prop('checked');
	$('#autonext_checkbox').prop('checked', !checked);
	autonext = $('#autonext_checkbox').prop('checked');

	if(autonext)
	{
		$('#other_menu_enable_automatic').html('Disable Automatic');
	}
	else 
	{
		$('#other_menu_enable_automatic').html('Enable Automatic');
	}

	if(autonext && columns_on)
	{
		next_video();
	}
}

function nsfw_change()
{
	var ns = $('#nsfw_checkbox').prop('checked');
	if(ns)
	{
		var c = localStorage.getItem('isadult');
		if(c == null)
		{
			var r = confirm("This activates videos that are not suitable for minors. Are you 18+ years of age?");
			if(r)
			{
				localStorage.setItem('isadult', 'yes');
				nsfw = true;
			}
			else
			{
				$('#nsfw_checkbox').prop('checked', false);
				nsfw = false;
			}
		}
		else 
		{
			nsfw = true;
		}
	}
	else
	{
		nsfw = false;
	}

	if(nsfw)
	{
		$('#other_menu_enable_nsfw').html('Disable NSFW');
	}
	else 
	{
		$('#other_menu_enable_nsfw').html('Enable NSFW');
	}
}

function nsfw_change2()
{
	var checked = $('#nsfw_checkbox').prop('checked');

	if(!checked)
	{
		var c = localStorage.getItem('isadult');
		if(c == null)
		{
			var r = confirm("This activates videos that are not suitable for minors. Are you 18+ years of age?");
			if(r)
			{
				localStorage.setItem('isadult', 'yes');
				$('#nsfw_checkbox').prop('checked', true);
				nsfw = true;
			}
			else
			{
				$('#nsfw_checkbox').prop('checked', false);
				nsfw = false;
			}
		}
		else 
		{
			$('#nsfw_checkbox').prop('checked', true);
			nsfw = true;
		}
	}
	else 
	{
		$('#nsfw_checkbox').prop('checked', false);
		nsfw = false;
	}

	if(nsfw)
	{
		$('#other_menu_enable_nsfw').html('Disable NSFW');
	}
	else 
	{
		$('#other_menu_enable_nsfw').html('Enable NSFW');
	}
}

function nsfw_catalog_check()
{
	var c = localStorage.getItem('isadult');
	if(c == null)
	{
		var r = confirm("This section contains videos that are not suitable for minors. Are you 18+ years of age?");
		if(r)
		{
			localStorage.setItem('isadult', 'yes');
			$('#nsfw_overlay').css('display', 'none');
		}
		else
		{
			window.location = '/';
		}
	}
	else
	{
		$('#nsfw_overlay').css('display', 'none');
	}
}

function activate_autonext()
{
	var video = document.getElementById('video');

	video.addEventListener('canplay', function(e) 
	{
		video.play();
	});

	video.addEventListener('timeupdate', function(e) 
	{
		var p = (video.currentTime / video.duration);

		var per = Math.round(p * 100) + '%';

		$('#info_percentage').html(per)

		if(p >= 0.8) 
		{
		  if(!player_counted) 
		  {
		      player_counted = true;
		      $.post('/get_metadata/',
		      {
		      	id: video_id
		      	// csrfmiddlewaretoken: csrf_token
		      },
		      function(data)
		      {

		      });
		  }
		}
	}, false);

	video.addEventListener('ended', function(e) 
	{
		if(autonext)
		{
			next_video();
		}
		else
		{
			if(!mobile_version)
			{
				show_columns();
			}
			else
			{
				columns_on = true;
				hover_suggestions();
			}
		}
	});
}


//
//
//   board
//
//


function submit_comment_form()
{
	var text = $('#board_post_text').val();
	if(text.length === 0 || text.length > 10000)
	{
		return false;
	}

	$('#comment_submit').attr('disabled', 'disabled');
	$('#board_post_text').val('');

	post_comment_form(text);
}

function submit_popup_form()
{
	var text = $('#board_post_text_popup').val();
	if(text.length === 0 || text.length > 2000)
	{
		return false;
	}

	$('#reply_popup_submit').attr('disabled', 'disabled');
	$('#board_post_text_popup').val('');

	post_comment_form(text);
	goto_bottom();
}

function post_comment_form(text)
{
	last_comment_written = text;

	$.post('/post_post/',
	{
		// csrfmiddlewaretoken: csrf_token,
		text: text,
		video_id: video_id
	},
	function(data) 
	{
		$('#comment_submit').removeAttr('disabled'); 
		$('#reply_popup_submit').removeAttr('disabled');

		if(data.status === 'ok')
		{
			get_info('comments');
		}
		else if(data.status === 'error')
		{
			$('#board_post_text').focus();
			$('#board_post_text').val(last_comment_written);
			alert(data.error);
		}
	});
}

function disable_forms()
{
	$('#board_post_text').prop('disabled', true);
	$('#comment_submit').prop('disabled', true);
	$('#comment_submit').html('comment limit reached');
	$('#board_post_text_popup').prop('disabled', true);
	$('#reply_popup_submit').prop('disabled', true);
}

function enable_forms()
{
	$('#board_post_text').prop('disabled', false);
	$('#comment_submit').prop('disabled', false);
	$('#comment_submit').html('leave a comment');
	$('#board_post_text_popup').prop('disabled', false);
	$('#reply_popup_submit').prop('disabled', false);
}

function go_to_comments()
{
	$('html, body').animate({
	    scrollTop: $("#posts").offset().top - 20
	}, 600);
}

function place_comments(comments)
{
	var parent = $("#hover_comments_inner");

	parent.html(comments);

	if($('.reply').length < 1)
	{
		parent.append("<center><div class='bottom_comments_msg unselectable'> no comments yet </div></center>");
	}

	else
	{
		parent.append("<div class='v1'></div>");
	}

	$('#hover_comments_inner').scrollTop(0);

}

function place_suggestions(suggested)
{
	var parent = $('#hover_suggestions_inner');

	parent.html(suggested);

	$('#hover_suggestions_inner').scrollTop(0);
}

function get_info(mode)
{
	if(mode == 'all')
	{
		var watchv = watched_videos_to_string();
	}
	else
	{
		var watchv = '0';
	}

	if(can_play_webm)
	{
		var cpw = 'yes';
	}
	else 
	{
		var cpw = 'no';
	}

	$.get('/get_info/',
	{
		video_id: video_id,
		watched_videos: watchv,
		can_play_webm: cpw,
		mode: mode
	},
	function(data) 
	{
		if(data.status === 'ok')
		{
			place_comments(data.posts);
			activate_quote_hover();
			activate_header_quote_hover();
			// if(comments_count !== -1)
			// {
			// 	var diff_comments = $('.reply').length - comments_count;
			// 	if(diff_comments > 0)
			// 	{
			// 		if(!document.hasFocus())
			// 		{
			// 			document.title = '* ' + title + ' - Handbeezy';
			// 		}
			// 	}
			// }

			comments_count = $('.reply').length;

			if(mode == 'all')
			{
				var views = data.views;
				var date = data.date;
				var size = data.size;
				var extension = data.extension;
				var ad = data.ad;
				var uid = data.uid

				if(video_is_liked())
				{
					var heart = '<i onclick="toggle_like()" class="heart fa fa-heart"></i>';
				}
				else
				{
					var heart = '<i onclick="toggle_like()" class="heart fa fa-heart-o"></i>';
				}

				var htitle = '<span class="info_item">' + escapeHTML(title) + '</span>';

				var key = search_key(uid);

				if(key != '')
				{
					var edit = " &nbsp;&nbsp; - &nbsp;&nbsp; <a class='edit_link' href='edit/" + key + "'>edit</a>";
				}
				else 
				{
					var edit = '';
				}

				if(views == 1)
				{
					var s = heart + ' &nbsp;&nbsp; ' + htitle + edit + ' &nbsp;&nbsp; - &nbsp;&nbsp; <span id="info_views" class="info_item">' + views + ' view</span>';
				}
				else
				{
					var s = heart + ' &nbsp;&nbsp; ' + htitle + edit + ' &nbsp;&nbsp; - &nbsp;&nbsp; <span id="info_views" class="info_item">' + views + ' views</span>';
				}

				if(comments_count == 1)
				{
					var s2 = ' &nbsp;&nbsp; - &nbsp;&nbsp; <span id="info_comments" class="info_item cursorpointer" onclick="toggle_hover_comments()">' + comments_count + ' comment</span>';
				}
				else
				{
					var s2 = ' &nbsp;&nbsp; - &nbsp;&nbsp; <span id="info_comments" class="info_item cursorpointer" onclick="toggle_hover_comments()">' + comments_count + ' comments</span>';
				}

				var s3 = ' &nbsp;&nbsp; - &nbsp;&nbsp; <span class="info_item">uploaded on ' + date + '</span>'; 

				var s4 = ' &nbsp;&nbsp; - &nbsp;&nbsp; <span class="info_item">' + size + ' mb ' + extension + '</span>';

				var s5 = ' &nbsp;&nbsp; - &nbsp;&nbsp; <span id="info_percentage">0%</span>';

				var s6 = ' &nbsp;&nbsp; - &nbsp;&nbsp; ' + ad;

				$('#info').html(s + s2 + s3 + s4 + s5 + s6);

				if(comments_count >= 300)
				{
					disable_forms();
				}
				else
				{
					enable_forms();
				}

				place_suggestions(data.suggested)

			}

			else
			{
				var views = data.views;
				
				if(comments_count == 1)
				{
					var s = comments_count + ' comment';
				}
				else
				{
					var s = comments_count + ' comments';
				}

				$('#info_comments').html(s);

				if(views == 1)
				{
					var s = views + ' view';
				}
				else
				{
					var s = views + ' views';
				}

				$('#info_views').html(s);		
			}
				
			fix_layout();
		}
	});
}

function respond(id)
{
	$('#board_post_text').focus();
	var val = $('#board_post_text').val();
	$('#board_post_text').val(val + '>>' + id + '\n');
}

function close_popup_form()
{
	$('#popup_form').css('display', 'none');
	$('#board_post_text_popup').val('');
}

function activate_quote_hover()
{
	$('.quote').each(function(i) 
	{ 
		$(this).mouseover(function(e)
		{
			var id = $(this).html().replace('&gt;&gt;', '');
			id = id.replace('(OP)', '');
			id = $.trim(id);
			var post = $('#' + id).parent();
			$(post).addClass('highlight');
			show_popup_post($(this), id)
		});

		$(this).mouseout(function()
		{
			hide_popup_post();
		});
	});
}

function activate_header_quote_hover()
{
	$('.header_quote').each(function(i) 
	{ 
		$(this).mouseover(function(e)
		{
			var id = $(this).html().replace('&gt;&gt;', '');
			id = $.trim(id);
			var post = $('#' + id).parent();
			$(post).addClass('highlight');
			show_popup_post($(this), id)
		});
		$(this).mouseout(function()
		{
			hide_popup_post();
		});
	});
}

function show_popup_post(quote, id)
{
	if(mobile_version)
	{
		return;
	}
	var clone = $('#' + id).parent().clone();
	clone.find('.respond').remove();
	clone.find('img').css('max-width', 130);
	clone.find('img').css('max-height', 250);
	$('#popup_post').html(clone.html());
	$('#popup_post').css('display', 'inline-block');
}

function hide_popup_post()
{
	$('#popup_post').css('display', 'none')
	$('.highlight').each(function()
	{
		$(this).removeClass('highlight');
	})
}

function go_to_post(id)
{
	var c = $('#hover_comments_inner').scrollTop() + $('#' + id).parent().position().top - ($('#hover_comments_inner').offset().top - $('#hover_comments_container').offset().top)
	$('#hover_comments_inner').scrollTop(c);
	flash_post(id);
}

function clear_post_flashes()
{
	$('.reply').each(function()
	{
		$(this).removeClass('selected_reply');
	})
}

function flash_post(id)
{
	clear_post_flashes();
	$('#' + id).parent().addClass('selected_reply');
}

function delete_post(id)
{
	$('#' + id).parent().fadeOut();
	$.post('/delete_post/',
	{
		id: id
		// csrfmiddlewaretoken: csrf_token
	},
	function(data)
	{

	});
}

function goto_bottom()
{
	$('body').scrollTop($(document).height());
}

function activate_comments_autoupdate()
{
	setInterval(function()
	{
		get_info('comments');
	}, 60000)
}

function activate_window_focus()
{
	$(window).focus(function()
	{
		document.title = title + ' - Handbeezy';
	});
}


//
//
//  catalog
//
//

function get_latest_entries()
{
	$.get('/get_latest_entries/',
	{

	},
	function(data) 
	{
		$('#entries').html(data.entries)
	});
}

function get_latest_entries_nsfw()
{
	$.get('/get_latest_entries_nsfw/',
	{

	},
	function(data) 
	{
		$('#entries').html(data.entries)
	});
}

function search_catalog()
{
	var query = $('#input_catalog_search').val().trim();

	if(query.length < 1)
	{
		get_latest_entries();
		return;
	}

	$.get('/search_entries/',
	{
		query:query
	},
	function(data) 
	{
		$('#input_catalog_search').val('')
		$('#entries').html(data.entries)
	});
}

function search_catalog_nsfw()
{
	var query = $('#input_catalog_search_nsfw').val().trim();

	if(query.length < 1)
	{
		get_latest_entries_nsfw();
		return;
	}

	$.get('/search_entries_nsfw/',
	{
		query:query
	},
	function(data) 
	{
		$('#input_catalog_search_nsfw').val('')
		$('#entries').html(data.entries)
	});
}

function search_likes(start)
{
	if(start)
	{
		var query = '';
	}
	else
	{
		var query = $('#input_likes_search').val().trim();
	}

	if(query.length < 1)
	{
		var query = '';
		var slikes = likes_to_string(50);
	}
	else 
	{
		var slikes = likes_to_string(300);
	}


	$.get('/search_likes/',
	{
		query:query,
		likes: slikes
	},
	function(data) 
	{
		$('#input_likes_search').val('')
		$('#entries').html(data.entries)
	});
}

function search_watched(start)
{
	if(start)
	{
		var query = '';
	}
	else
	{
		var query = $('#input_watched_search').val().trim();
	}

	if(query.length < 1)
	{
		var query = '';
		var swatched = watched_to_string(50);
	}
	else 
	{
		var swatched = watched_to_string(300);
	}


	$.get('/search_watched/',
	{
		query:query,
		watched: swatched
	},
	function(data) 
	{
		$('#input_watched_search').val('')
		$('#entries').html(data.entries)
	});
}

function search_uploaded(start)
{
	if(start)
	{
		var query = '';
	}
	else
	{
		var query = $('#input_uploaded_search').val().trim();
	}

	if(query.length < 1)
	{
		var query = '';
		var suploaded = uploaded_to_string(50);
	}
	else 
	{
		var suploaded = uploaded_to_string(300);
	}

	$.get('/search_uploaded/',
	{
		query:query,
		uploaded: suploaded
	},
	function(data) 
	{
		$('#input_uploaded_search').val('')
		$('#entries').html(data.entries)
	});
}

function enable_jumper()
{
	$(window).scroll(function()
	{	
		var scroll = $(window).scrollTop();

		if(!jumper_on && scroll >= 100)
		{
			show_jumper();
			jumper_on = true;
		}
		else if(jumper_on && scroll < 100)
		{
			hide_jumper();
			jumper_on = false;
		}
	})
}

function show_jumper()
{
	$('#jumper').css('display', 'block');
}

function hide_jumper()
{
	$('#jumper').css('display', 'none');
}

function jump()
{
	$("html, body").animate({ scrollTop: 0 }, 600);
}

function cursor_hider() 
{
	document.onmousemove = function()
	{
		if($('#video:hover').length != 0)
		{
			$('#video')[0].setAttribute("controls", "controls");
			$('#video').css('cursor', '');
			clearTimeout(mouse_timeout);
			mouse_timeout = setTimeout(function()
			{
				$('#video')[0].removeAttribute("controls");
				$('#video').css('cursor', 'none');
			}, 1000);
		}
	}
}

function toggle_other_menu()
{
	if($('#other_menu').css('display') == 'block')
	{
		hide_other_menu();	
	}
	else
	{
		show_other_menu();
	}
}

function show_other_menu()
{
	var offs = $('#other_menu_arrow').offset();
	var atop = offs.top;
	var aleft = offs.left;
	$('#other_menu').css('top', atop + $('#other_menu_arrow').height());
	$('#other_menu').css('right', $(window).width() - (aleft + $('#other_menu_arrow').width()));
	$('#other_menu').css('display', 'block');
	setTimeout(function()
	{
		other_menu_on = true;
	}, 100);
}

function hide_other_menu()
{
	$('#other_menu').css('display', 'none');
	other_menu_on = false;
}

function report_video_category()
{
	var r = confirm('Are you sure?');
	if(r)
	{
		$.post('/report_video_category/',
		{
			video_id: video_id
			// csrfmiddlewaretoken: csrf_token
		},
		function(data)
		{

		});

		hide_other_menu();
		next_video();
	}
	else
	{
		hide_other_menu();
	}
}

function report_video_serious()
{
	var r = confirm('Are you sure?');
	if(r)
	{
		$.post('/report_video_serious/',
		{
			video_id: video_id
			// csrfmiddlewaretoken: csrf_token
		},
		function(data)
		{

		});

		hide_other_menu();
		next_video();
	}
	else
	{
		hide_other_menu();
	}
}

function other_menu_hider()
{
	$('body').click(function()
	{
		if(other_menu_on && $('#other_menu').css('display') != 'none')
		{
			hide_other_menu();
		}
	})
}

function replay()
{
	hide_columns();
	var video = document.getElementById('video');
	video.currentTime=0;
	video.play();
}

function copy_url(at_current_time)
{
	var url = 'http://handbeezy.com/' + video_id + '/';
	if(at_current_time)
	{
		var time = $('#video')[0].currentTime
		url += "?time=" + Math.floor(time);
	}
	var textareaEl = document.createElement('textarea');
	document.body.appendChild(textareaEl);
	textareaEl.value = url;
	textareaEl.select();
	document.execCommand('copy');
	document.body.removeChild(textareaEl);
}

(function($){
    $.fn.rand = function(k){
        var b = this,
            n = b.size(),
            k = k ? parseInt(k) : 1;

        // Special cases
        if (k > n) return b.pushStack(b);
        else if (k == 1) return b.filter(":eq(" + Math.floor(Math.random()*n) + ")");

        // Create a randomized copy of the set of elements,
        // using Fisher-Yates sorting
        r = b.get();
        for (var i = 0; i < n - 1; i++) {
            var swap = Math.floor(Math.random() * (n - i)) + i;
            r[swap] = r.splice(i, 1, r[swap])[0];
        }
        r = r.slice(0, k);

        // Finally, filter jQuery stack
        return b.filter(function(i){
            return $.inArray(b.get(i), r) > -1;
        });
    };
})(jQuery);

function hover_comments()
{
	if(mobile_version)
	{
		hide_hover_suggestions();
	}
	$('#hover_comments_container').css('visibility', 'visible');
	$('#hover_comments_icon').addClass('hover_icon_selected');
}

function hide_hover_comments()
{
	$('#hover_comments_icon').removeClass('hover_icon_selected');

	$('#hover_comments_container').fadeOut(300, function() 
	{
	      $(this).css('visibility','hidden');
	      $(this).css('display', 'block');
	});
}

function hover_suggestions()
{
	if(mobile_version)
	{
		hide_hover_comments();
	}
	$('#hover_suggestions_container').css('visibility', 'visible');
	$('#hover_suggestions_icon').addClass('hover_icon_selected');
}

function hide_hover_suggestions()
{
	$('#hover_suggestions_icon').removeClass('hover_icon_selected');

	$('#hover_suggestions_container').fadeOut(300, function() 
	{
	      $(this).css('visibility','hidden');
	      $(this).css('display', 'block');
	});
}

function toggle_columns()
{
	if($('#hover_comments_container').css('visibility') == 'visible' && $('#hover_suggestions_container').css('visibility') == 'visible')
	{
		hide_hover_comments();
		hide_hover_suggestions();
	}
	else
	{
		hover_comments();
		hover_suggestions();
	}
}

function show_columns()
{
	columns_on = true;
	if(!mobile_version)
	{
		hover_comments();
	}
	hover_suggestions();
}

function hide_columns()
{
	columns_on = false;
	hide_hover_comments();
	hide_hover_suggestions();
}

function create_video_context_menu()
{
	$.contextMenu({
	    // define which elements trigger this menu
	    selector: "#video, #play_icon",
	    animation: {duration: 250, hide: 'fadeOut'},
	    // define the elements of the menu
	    items: {
	        cmenu1: {
	        	name: "Replay", icon: "fa-refresh", callback: function(key, opt)
	        	{
	        		replay(); 
	        	}
	        },
	        cmenu2: {
	        	name: "Copy Url", icon: "fa-clipboard", callback: function(key, opt)
	        	{
	        		copy_url(); 
	        	}
	        },
	        cmenu3: {
	        	name: "Copy Url at Current Time", icon: "fa-clock-o", callback: function(key, opt)
	        	{
	        		copy_url(true); 
	        	}
	        },
	        cmenu7: {
	        	name: "Copy File Url", icon: "fa-file-o", callback: function(key, opt)
	        	{
	        		copy_file_url(); 
	        	}
	        },	        
	        cmenu5: {
	        	name: "This video doesn't play", icon: "fa-exclamation-circle", callback: function(key, opt)
	        	{
	        		report_video_serious(); 
	        	}
	        },
	        cmenu6: {
	        	name: "This is a porn video", icon: "fa-exclamation-circle", callback: function(key, opt)
	        	{
	        		report_video_serious(); 
	        	}
	        }
	    }
	    // there's more, have a look at the demos and docs...
	});
}

function time_changer()
{
	document.getElementById('video').addEventListener('loadedmetadata', function() 
	{
		this.currentTime = video_time;
	}, false);
}

function hide_context_menu()
{
	$('#context-menu-layer').trigger('mousedown');
}

function start_mouse_movement_detection()
{
	$("body").on("mousemove",function(event) 
	{
		if(event.pageY < $(window).height() / 2)
		{
		    if(event.pageX < 200) 
		    {
		    	hover_suggestions();
		    }
		    if(event.pageX > $(window).width() - 200)
		    {
		    	hover_comments();
		    }
		}
	});
}

function start_video_click()
{
	$('#video').click(function(e)
	{
		if($(this)[0].paused)
		{
			hide_columns();
			$(this)[0].play();
		}
		else
		{
			$(this)[0].pause();
		}

		e.preventDefault()
	});
}

function activate_play_icon()
{
	$('#video')[0].onplay = function() 
	{
	    hide_play_icon();
	};

	$('#video')[0].onpause = function() 
	{
	    show_play_icon();
	};
}

function show_play_icon()
{
	$('#play_icon').css('display', 'block');
}

function hide_play_icon()
{
	$('#play_icon').css('display', 'none');
}

function toggle_player()
{
	var video = $('#video')[0];
	if(video.paused)
	{
		hide_columns();
		video.play();
	}
	else
	{
		video.pause();
	}
}

function toggle_hover_comments()
{
	var c = $("#hover_comments_container");

	if(c.css('visibility') == 'hidden')
	{
		hover_comments();
	}
	else
	{
		hide_hover_comments();
	}
}

function toggle_hover_suggestions()
{
	var c = $("#hover_suggestions_container");

	if(c.css('visibility') == 'hidden')
	{
		hover_suggestions();
	}
	else
	{
		hide_hover_suggestions();
	}
}

function show_shortcuts()
{
	var msg = 'Keyboard Shortcuts:\n\n';
	msg += 'Space -> Play/Pause\n';
	msg += 'Ctrl + Space -> Replay\n';
	msg += 'Left -> Previous Video\n';
	msg += 'Right -> Next Video\n';
	msg += 'Up -> Like/Unlike Video\n';
	msg += 'Down -> Show/Hide Columns\n';
	msg += 'Enter -> Toggle Automatic\n';
	msg += 'Escape -> Search\n';
	msg += 'Enter While On Search -> Play First Suggestion\n';
	msg += 'Shift + Enter While On Search -> Play First Suggestion Next';
	hide_other_menu();
	alert(msg);
}

function change_theme()
{
	var theme = localStorage.getItem('theme')

	if(theme == 'light')
	{
		localStorage.setItem('theme', 'dark');
	}
	else
	{
		localStorage.setItem('theme', 'light');
	}

	window.location = window.location;
}

function get_likes()
{
	likes = localStorage.getItem('likes');

	if(likes == null)
	{
		likes = [];
		localStorage.setItem('likes', JSON.stringify(likes));
		return;
	}

	likes = JSON.parse(likes);
}

function get_watched()
{
	watched = localStorage.getItem('watched');

	if(watched == null)
	{
		watched = [];
		localStorage.setItem('watched', JSON.stringify(watched));
		return;
	}

	watched = JSON.parse(watched);
}

function get_uploaded()
{
	uploaded = localStorage.getItem('uploaded');

	if(uploaded == null)
	{
		uploaded = [];
		localStorage.setItem('uploaded', JSON.stringify(uploaded));
		return;
	}

	uploaded = JSON.parse(uploaded);
}

function add_uploaded(id)
{
	var i = uploaded.indexOf(id);

	if(i != -1)
	{
		uploaded.splice(i, 1);
	}

	uploaded.push(id);
	localStorage.setItem('uploaded', JSON.stringify(uploaded));
}

function search_key(id)
{
	for(var i=0; i<uploaded.length; i++)
	{
		if(uploaded[i].slice(0,9) == id)
		{
			return uploaded[i];
		}
	}

	return '';
}

function add_watched(id)
{
	var i = watched.indexOf(id);

	if(i != -1)
	{
		watched.splice(i, 1);
	}

	watched.push(id);
	watched.slice(-300);
	localStorage.setItem('watched', JSON.stringify(watched));
}

function reset_watched()
{
	localStorage.setItem('watched', JSON.stringify([]));
	window.location = '.';
}

function reset_likes()
{
	localStorage.setItem('likes', JSON.stringify([]));
	window.location = '.';
}

function remove_watched(id)
{
	var i = watched.indexOf(id);

	if(i != -1)
	{
		watched.splice(i, 1);
		localStorage.setItem('watched', JSON.stringify(watched));
	}
}

function remove_like(id)
{
	var i = likes.indexOf(id);

	if(i != -1)
	{
		likes.splice(i, 1);
		localStorage.setItem('likes', JSON.stringify(likes));
	}
}

function toggle_like()
{
	var i = likes.indexOf(video_id);

	if(i == -1)
	{
		likes.push(video_id);
		$('.heart').removeClass('fa-heart-o');
		$('.heart').addClass('fa-heart');
	}
	else
	{
		likes.splice(i, 1);
		$('.heart').removeClass('fa-heart');
		$('.heart').addClass('fa-heart-o');
	}

	localStorage.setItem('likes', JSON.stringify(likes));
}

function video_is_liked()
{
	var i = likes.indexOf(video_id);

	if(i < 0)
	{
		return false;
	}
	else
	{
		return true;
	}
}

function copy_file_url()
{
	var src = $('#video').attr('src');
	
	if(src.startsWith("/"))
	{
		var url = 'http://handbeezy.com' + $('#video').attr('src');
	}

	else
	{
		var url = src
	}

	var textareaEl = document.createElement('textarea');
	document.body.appendChild(textareaEl);
	textareaEl.value = url;
	textareaEl.select();
	document.execCommand('copy');
	document.body.removeChild(textareaEl);
}

function play_likes(random)
{
	if(random)
	{
		var random = Math.floor(Math.random() * $('.catalog_entry').length);
		var id = $($($('.catalog_entry').get(random)).find('.entry').get(0)).attr('href').replace('/','');
		window.location = '/' + id + '/?play_likes=yes&random=yes';
	}
	else 
	{
		var id = $($('.entry').get(0)).attr('href').replace('/','');
		window.location = '/' + id + '/?play_likes=yes';
	}
}

function clear_cookies(type)
{
	var r = confirm('Are you sure? This will erase all ' + type + ' cookies. But it can be useful if something is broken.');

	if(r)
	{
		if(type == 'likes')
		{
			reset_likes();
		}
		else if(type == 'watched')
		{
			reset_watched();
		}
	}
}

function check_formats()
{
	var v = document.getElementById('video');

	if(v.canPlayType && v.canPlayType('video/webm').replace(/no/, '')) 
	{
	    can_play_webm = true;
	}
	else 
	{
		can_play_webm = false;
	}
}

function show_suggestion_form()
{
	$('#suggestion_form').css('display', 'inline-block').focus();
	$('#suggestion_text').focus()
}

function hide_suggestion_form()
{
	$('#suggestion_form').css('display', 'none');
}

function send_suggestion()
{
	var suggestion = $('#suggestion_text').val().trim();

	if(suggestion.length < 1)
	{
		return false;
	}

	$.post('/send_suggestion/',
	{
		suggestion: suggestion
	},
	function(data)
	{

	});

	$('#suggestion_text').val('');

	alert('Suggestion sent');

	hide_suggestion_form();
}

function shuffle(array) 
{
  var m = array.length, t, i;

  // While there remain elements to shuffle…
  while (m) {

    // Pick a remaining element…
    i = Math.floor(Math.random() * m--);

    // And swap it with the current element.
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }

  return array;
}

function activate_volume_scroll()
{
	$('#volume_level').hide();

	document.getElementById('video').addEventListener("wheel", function(e)
	{
		var direction = e.deltaY > 0 ? 'down' : 'up';

		if(direction == 'up')
		{
			var audio = $('#video')[0];
			var nv = audio.volume + 0.05;
			if(nv > 1)
			{
				nv = 1;
			}
			audio.volume = nv;
			show_volume();
		}
		else if(direction == 'down')
		{
			var audio = $('#video')[0];
			var nv = audio.volume - 0.05;
			if(nv < 0)
			{
				nv = 0;
			}
			audio.volume = nv;
			show_volume();
		}
	});
}

function show_volume()
{
	var vl = $("#volume_level");
	clearTimeout(vl.stop().data('timer'));
	var vol = 'volume: ' + parseInt(Math.round(($('#video')[0].volume * 100))) + '%';
	vl.html(vol).show().css('opacity', 1);
	$.data(vl[0], 'timer', setTimeout(function() {vl.fadeOut();}, 2000));
}

function escapeHTML(s) 
{
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function play_next(e, id)
{
	if(e.html().indexOf('*') != -1)
	{
		e.html('play next');
		next_to_play = 0;
	}
	else 
	{
		$('.play_next_btn').each(function()
		{
			$(this).html('play next');
		});

		e.html('play next (*)');

		next_to_play = id;
		$('#autonext_checkbox').prop('checked', true);
		$('#other_menu_enable_automatic').html('Disable Automatic');
		autonext = true;

		if(columns_on)
		{
			next_video();
		}
		else
		{
			hide_columns();
		}
	}
}

function add_to_playlist(el, id)
{
	if($('.playlistimg').length >= 10)
	{
		return false;
	}

	if(playlist_ids.indexOf(id) != -1)
	{
		return false;
	}

	$(el).html('added to playlist');

	if($('#playlist_container').length)
	{
		var s = "<img onclick='remove_playlistimg(this)' class='playlistimg' data-id='" + id + "' src='" + thumbs_root + "/" + id + ".jpg'>";
		$('#playlist_img_container').append(s);
		playlist_ids.push(id);
	}
	else 
	{
		var c = "<div id='playlist_container'><span id='playlist_img_container'></span><span  class='playlist_menu' id='playlist_clear' onclick='clear_playlist()'>clear</span></div>"
		$($('.catalog_titulo').get(0)).after(c);
		$("#playlist_img_container").sortable();
		var s = "<img onclick='remove_playlistimg(this)' class='playlistimg' data-id='" + id + "' src='" + thumbs_root + "/"  + id + ".jpg'>";
		$('#playlist_img_container').append(s);
		playlist_ids.push(id);
	}

	if($('.playlistimg').length >= 2)
	{
		if(!$('#playlist_copy_url').length)
		{
			s = "<span id='playlist_copy_url' class='playlist_menu' onclick='copy_playlist_url()'>copy url</span><span id='play_playlist' class='playlist_menu' onclick='play_playlist()'>play</span>"
			$('#playlist_clear').after(s);
		}
	}
}

function clear_playlist()
{
	playlist_ids = [];
	$('#playlist_container').remove();
	$('.playlistlink').each(function()
	{
		$(this).html('add to playlist');
	});
}

function get_playlist_url()
{
	var url_base = 'http://handbeezy.com/' + $($('.playlistimg').get(0)).attr('data-id') + '?playlist=';

	var ids = '';

	$('.playlistimg').each(function()
	{
		ids += $(this).attr('data-id') + '_';
	});

	ids = ids.substring(0, ids.length - 1);
	split = ids.split('_');

	if(split.length > 1)
	{
		split.shift();
		ids = split.join('_');
	}

	return url_base + ids;
}

function play_playlist()
{
	window.location = get_playlist_url();
}

function copy_playlist_url()
{
	var textareaEl = document.createElement('textarea');
	document.body.appendChild(textareaEl);
	textareaEl.value = get_playlist_url();
	textareaEl.select();
	document.execCommand('copy');
	document.body.removeChild(textareaEl);

	$('#playlist_copy_url').html('copy again');
}

function remove_playlistimg(el)
{
	var id = $(el).attr('data-id');
	var index = playlist_ids.indexOf(id);
	playlist_ids.splice(index, 1);
	$(el).remove();
	$('.playlistlink').each(function()
	{
		if($(this).attr('data-id') == id)
		{
			$(this).html('add to playlist');
			return false;
		}
	})
	if(!$('.playlistimg').length)
	{
		clear_playlist();
	}
	else if($('.playlistimg').length == 1)
	{
		$('#playlist_copy_url').remove();
		$('#play_playlist').remove();
	}
}
