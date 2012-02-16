/*!
 * doscuss - A Dojo/Node.js/SQLite Based Forum and Mailing List
 * Server Module
 * 
 * Authors: Kitson P. Kelly <dojo@kitsonkelly.com>
 * Version: 0.9.0
 * 
 */

var util = require('util'),
	colors = require('colors'),
	express = require('express'),
	sqlite3 = require('sqlite3'),
	imap = require('imap'),
	dUtil = require('doscussUtil');
	
var app = express.createServer(),
	appPort = 3001;

app.use(app.router);
app.use('/lib', express.static('./lib'));
app.use('/client', express.static('./client'));
app.use('/css', express.static('./css'));
app.use('/images', express.static('./images'));

app.listen(appPort);

util.puts('docuss server '.blue + 'started '.green.bold + 'on port '.blue + appPort);