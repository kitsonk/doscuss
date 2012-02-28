/*!
 * doscuss - A Dojo/Node.js/SQLite Based Forum and Mailing List
 * Server Module
 * 
 * Authors: Kitson P. Kelly <dojo@kitsonkelly.com>
 * Version: 0.9.0
 * 
 */

var util = require('util'),
	fs = require('fs'),
	colors = require('colors'),
	express = require('express'),
	imap = require('imap'),
	dUtil = require('doscussUtil'),
	forum = require('forum');
	
var app = express.createServer(),
	appPort = 3001;

forum.init('db/doscuss.sqlite');	

/*
 * Setting up app and linking in static content
 */
app.configure(function(){
	app.set('view options', {layout: false});
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
		response.render('401.jade', {status: 401});
	}
};
	 
/*
 * Generate RESTful services
 */
app.get('/posts/:id', function(request, response, next){
	forum.getPost(request.params.id, function(post, err){
		if (err) return next(err);
		if (post.id){
			response.json(post.data());
		}else{
			response.render('404.jade', {status: 404, res: request.url});
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
			response.render('404.jade', {status: 404, res: request.url});
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
