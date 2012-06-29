require([
	"dojo/has",
	"dojo/node!util",
	"dojo/node!colors",
	"dojo/node!express",
	"dojo/node!imap",
	"doscuss/server/Forum",
	"doscuss/server/utils"
],function(has, util, colors, express, imap, Forum, doscussUtil){
	
	var app = express.createServer(),
		appPort = process.env.PORT || 3001;

	var forum = new Forum('db/doscuss.sqlite');

	/*
	 * Setting up app and linking in static content
	 */
	app.configure(function(){
		app.set('view options', {layout: false});
		app.set('view engine', 'jade');
		app.use(express.cookieParser());
		app.use(express.session({secret: 'yHCoyEPZ9WsNDORGb9SDDMNn0OOMcCgQiW5q8VFhDHJiztvvVVCPkZQWUAXl'}));
		app.use(app.router);
		app.use('/lib/dojo', express.static('../dojo'));
		app.use('/lib/dijit', express.static('../dijit'));
		app.use('/lib/dojox', express.static('../dojox'));
		app.use('/lib', express.static('./lib'));
		app.use('/client', express.static('./client'));
		app.use('/css', express.static('./css'));
		app.use('/images', express.static('./images'));
	});

	/*
	 * User functions
	 */	
	function loggedIn(request, response, next){
		if (request.session.user){
			next();
		}else{
			response.render('401', {status: 401});
		}
	};

	/*
	 * Create views
	 */
	app.get('/views/:view', function(request, response, next){
		response.render(request.params.view);
	});

	/*
	 * Generate RESTful services
	 */
	app.get('/posts/:id', function(request, response, next){
		forum.posts.byId(request.params.id).then(function(post){
			response.json(post);
		}, function(err){
			if (err.number == 404){
				response.render('404', { status: 404, res: request.url });
			}else{
				next(err);
			}
		});
	});

	app.get('/posts', function(request, response, next){
		var range = request.header("Range") ? doscussUtil.parseRange(request.header("Range")) : null;
		forum.posts.data(range, null).then(function(posts){
			if(range){
				forum.posts.count(null).then(function(count){
					response.header("Content-Range", doscussUtil.getContentRange(range.start, posts.length, count));
					response.json(posts);
				});
			}else{
				response.json(posts);
			}
		}, function(err){
			next(err);
		});
	});

	app.del('/posts/:id', function(request, response, next){
		forum.deletePost(request.params.id, function(success, err){
			if (err) return next(err);
			if (success){
				response.send();
			}else{
				response.render('404', {status: 404, res: request.url});
			}
		});
	});

	/*
	 * Login URI
	 */
	app.post('/users/:id/login', function(request, response, next){
		response.json({login: "success"});
	});

	/*
	 * Start listening
	 */
	app.listen(appPort);

	util.puts('docuss HTTP server '.blue + 'started '.green.bold + 'on port '.blue + appPort.toString().yellow);
});