/*
 * Dojo Node Bootstrapper
 */

var initModule = "doscuss/server";

dojoConfig = {
	async: true,
	baseUrl: ".",
	packages: [{
		name: "dojo",
		location: "lib/dojo"
	},{
		name: "dijit",
		location: "lib/dijit"
	},{
		name: "dojox",
		location: "lib/dojox"
	},{
		name: "controller",
		location: "lib/controller"
	},{
		name: "doscuss",
		location: "lib/doscuss"
	}],
	deps: [initModule]
}

require("./lib/dojo/dojo.js");
