/*!
 * doscuss - A Dojo/Node.js Forum and Mailing List
 * Client Application Scripts
 * 
 * Author: Kitson P. Kelly <dojo@kitsonkelly.com>
 * Version: 0.9.0
 * 
 */

require([
		"dojo/_base/event", // event.stop
        "dojo/_base/fx", // baseFx.fadeOut
		"dojo/_base/xhr", // xhr.post, xhr.get
		"dojo/dom", // dom.byId
		"dojo/dom-style", // style.set
		"dojo/parser", // parser.parse
		"dojo/ready", // ready
		"dojo/store/JsonRest",
		"dojo/store/Memory",
		"dojo/store/Observable",
		"dojo/store/Cache",
		"dojo/when", // when
		"dijit/form/Button",
        "dijit/form/DropDownButton",
		"dijit/form/Form",
		"dijit/form/TextBox",
		"dijit/registry",
		"dijit/Dialog",
		"dijit/TooltipDialog",
		"dojox/encoding/crypto/RSAKey",
		"doscuss/Forum",
		"doscuss/utils",
        "dojo/domReady!"],
function(event, baseFx, xhr, dom, style, parser, ready, JsonRest, Memory, Observable, Cache, when, Button, DropDownButton, 
		Form, TextBox, registry, Dialog, TooltipDialog, RSAKey, Forum, utils){
	doscuss = {};
	doscuss.registry = registry;
	
	doscuss.alert = function(message){
		var dialogAlert = registry.byId("dialogAlert"),
			dialogAlertMessage = dom.byId("dialogAlertMessage");
		
		dialogAlert.hide();
		dialogAlertMessage.innerHTML = message;
		dialogAlert.show();
	};
	
	doscuss.login = function(e){
		event.stop(e);  // Keeps form from normal submit
		xhr.get({
			url: "/client/login.json",
			handleAs: "json"
		}).then(function(loginKey){
			var rsakey = new RSAKey(),
				loginInfo = registry.byId("formLogin").get("value");
			rsakey.setPublic(loginKey.n, loginKey.e);
			var credentials = {
				username: loginInfo.username,
				password: utils.hex2b64(rsakey.encrypt(loginInfo.password))
			}
			xhr.post({
				url: "/users/" + escape(loginInfo.username) + "/login/",
				content: credentials,
				handleAs: "json"
			}).then(function(results){
				if (results && results.login === "success"){
					doscuss.alert("Logged In!");
				}else{
					console.log("notlogged in");
				}
			}, function(error){
				console.log(error);
			});
		}, function(error){
			console.log(error);
		});
	};
	
	doscuss.initForum = function(node){
		if(!doscuss.forum){
			var jsonrest = new JsonRest({
				target: "/posts/"
			});
			var memory = new Memory();
			doscuss.posts = Observable(Cache(jsonrest, memory));
			doscuss.forum = new Forum({
				store: doscuss.posts
			}, node);
			doscuss.forum.startup();
		}
	};
	
	ready(function(){
		when(parser.parse(), function(){
			doscuss.initForum("forum");
			baseFx.fadeOut({  //Get rid of the loader once parsing is done
				node: "preloader",
				onEnd: function() {
					style.set("preloader","display","none");
				}
			}).play();
		});
	});
});