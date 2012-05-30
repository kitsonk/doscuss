require([
	"dojo/node!util",
	"dojo/node!fs",
	"dojo/node!colors",
	"dojo/node!express",
	"dojo/node!imap",
	"dojo/node!doscussUtil",
	"dojo/node!forum"
],function(util, fs, colors, express, imap, dUtil, forum){

	var app = express.createServer(),
		appPort = process.env.PORT || 3001;

	forum.init('db/doscuss.sqlite');	

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
		forum.getPost(request.params.id, function(post, err){
			if (err) return next(err);
			if (post.id){
				response.json(post.data());
			}else{
				response.render('404', {status: 404, res: request.url});
			}
		});
	});

	app.get('/posts', function(request, response, next){
		forum.getPosts(null, null, function(posts, err){
			if (err) return next(err);
			response.json(posts);
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

	app.post('/users/:id/login', function(request, response, next){
		response.json({login: "success"});
	});

	/*
	 * Start listening
	 */
	app.listen(appPort);

	util.puts('docuss HTTP server '.blue + 'started '.green.bold + 'on port '.blue + appPort.toString().yellow);
})