/*!
 * doscuss - A Dojo/Node.js/SQLite Based Forum and Mailing List
 * Server Bootstrap Module
 * 
 * Authors: Kitson P. Kelly <dojo@kitsonkelly.com>
 * Version: 0.9.1
 * 
 */

// Initial Module to Load
var initModule = "doscuss/server";

// Dojo Configuration
dojoConfig = {
	async: true,
	baseUrl: "lib/",
	packages: [{
		name: "dojo",
		location: "dojo"
	},{
		name: "dijit",
		location: "dijit"
	},{
		name: "dojox",
		location: "dojox"
	},{
		name: "controller",
		location: "controller"
	},{
		name: "doscuss",
		location: "doscuss"
	}],
	deps: [initModule]
}

// Load dojo/dojo
require("./lib/dojo/dojo.js");
