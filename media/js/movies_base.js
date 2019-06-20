var which;
var movie_to_add_torrent;

function init()
{
	compile_templates();
	activate_key_detection();
	activate_nicescroll();
	which = 'overall'
	get_movies_rank('overall');
}

function show_add_movie_form()
{
	$('#add_movie_info').html('paste an IMDB url');
	$('#add_movie_input').val('');
	$('#overlay').fadeIn(500);
	$('#add_movie_form').fadeIn(500);
	$('#add_movie_input').focus();
}

function hide_add_movie_form()
{
	$('#overlay').fadeOut(500, function()
	{
		$('#overlay').css('display', 'none');
	});
	$('#add_movie_form').fadeOut(500, function()
	{
		$('#add_movie_form').css('display', 'none');
	});
}

function show_add_torrent_form(id)
{
	movie_to_add_torrent = id;
	$('#add_torrent_input').val('');
	$('#overlay2').fadeIn(500);
	$('#add_torrent_form').fadeIn(500);
	$('#add_torrent_input').focus();
}

function hide_add_torrent_form()
{
	$('#overlay2').fadeOut(500, function()
	{
		$('#overlay2').css('display', 'none');
	});
	$('#add_torrent_form').fadeOut(500, function()
	{
		$('#add_torrent_form').css('display', 'none');
	});
}

function activate_key_detection()
{
	 $(document).keydown(function(e)
	 {
	 	code = (e.keyCode ? e.keyCode : e.which);

	 	if(code === 13)
	 	{
	 		if($('#add_movie_input').is(':focus'))
	 		{
	 			add_movie();
	 		}

	 		if($('#add_torrent_input').is(':focus'))
	 		{
	 			add_torrent();
	 		}
	 	}

	 });
}

function add_movie()
{
	var imdb_url = $('#add_movie_input').val();
	var re = /(tt\d+)/g; 
	var id = imdb_url.match(re);
	var url = "http://www.omdbapi.com/?i=" + id + "&plot=short&r=json";
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open("GET", url, false);
	xmlHttp.send(null);
	var json = JSON.parse(xmlHttp.responseText);

	if(json.Response === 'False')
	{
		$('#add_movie_info').html('paste an IMDB url. try again');
		$('#add_movie_input').val('');
	}
	else
	{
		$('#add_movie_input').val('');
		$.post('/add_movie/',
		{
			csrfmiddlewaretoken: csrf_token,
	    	title: json.Title,
	    	genre: json.Genre,
	    	plot: json.Plot,
	    	poster: json.Poster,
	    	url: 'http://www.imdb.com/title/' + json.imdbID + '/'
		},
		function(data) 
		{
			hide_add_movie_form();
			get_movies_rank(which);
		});
	}
}

function play_stallone_audio()
{
	new Audio('/media/audio/life.wav').play();
}

function play_wiseau_audio()
{
	new Audio('/media/audio/so_beautiful.ogg').play();
}

function get_movies_rank(wh)
{
	which = wh;
	$('.userlink').each(function()
	{
		$(this).removeClass('selected');
	})
	$('.userlink').each(function()
	{
		if($(this).html() === wh)
		{
			$(this).addClass('selected');
		}
	})
	$.get('/get_movies_rank/',
	{
		which:wh
	},
	function(data) 
	{
		if(data.status === 'ok')
		{
			var t = template_movies({movies:data.movies});
			$('#right').html(t);
			if(wh === username)
			{
				$( "#movies" ).sortable({stop: function(event, ui)
				{
					update_movies_rank();
				}});
				$( "#movies" ).disableSelection();
			}
			$('img').on('error', function() 
			{
				$(this).attr('src', '/media/img/not_available.jpg');
			})
		}
		else
		{
			$('#right').html('');
		}
	});
}

function compile_templates()
{
	template_movies = Handlebars.compile($('#template_movies').html());
}

Handlebars.registerHelper('ifCond', function (v1, operator, v2, options) 
{
    if(operator === '==')
    {
    	return (v1 == v2) ? options.fn(this) : options.inverse(this);
    }
});

function activate_nicescroll()
{
	$('#left').niceScroll({autohidemode:'scroll'});
}

function get_movies_ids()
{
	var s = ''

	$('.movie_id').each(function()
	{
		s += $(this).attr('id') + ',';
	})

	return s.substring(0, s.length-1);
}

function update_movies_rank()
{
	var ids = get_movies_ids();

	$.post('/update_movies_rank/',
	{
		csrfmiddlewaretoken: csrf_token,
    	movies: ids
	},
	function(data) 
	{
		
	});
}

function attempt_remove_movie(id)
{
	$btn = $('#remove_' + id);
	if($btn.html() === 'remove')
	{
		$btn.html('click again to remove');
	}
	else if($btn.html() === 'click again to remove')
	{
		remove_movie(id);
	}
}

function remove_movie(id)
{
	$.post('/remove_movie/',
	{
		csrfmiddlewaretoken: csrf_token,
    	id: id
	},
	function(data) 
	{
		$('#movie_' + id).fadeOut(500, function()
		{
			$(this).remove()
		});
	});
}

function attempt_remove_user(user)
{
	$btn = $('#remove_user_' + user);
	if($btn.html() === 'remove')
	{
		$btn.html('click again to remove');
	}
	else if($btn.html() === 'click again to remove')
	{
		remove_user(user);
	}
}

function remove_user(user)
{
	$.post('/remove_user/',
	{
		csrfmiddlewaretoken: csrf_token,
    	username: user
	},
	function(data) 
	{
		$('#user_' + user).fadeOut(500, function()
		{
			$(this).remove()
		});
	});
}

function logout()
{
	window.location = '/movies_login'
}

function add_torrent()
{
	var torrent = $('#add_torrent_input').val();
	$('#add_torrent_input').val('');
	$.post('/add_torrent/',
	{
		csrfmiddlewaretoken: csrf_token,
    	torrent: torrent,
    	id: movie_to_add_torrent
	},
	function(data) 
	{
		hide_add_torrent_form();
		get_movies_rank(which);
	});
}