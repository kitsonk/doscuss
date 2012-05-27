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
		"dojo/dom", // dom.byId
		"dojo/dom-style", // style.set
		"dojo/parser", // parser.parse
		"dojo/ready", // ready
		"dojo/request", // request.get, request.post
		"dojo/when", // when
		"dijit/form/Button",
        "dijit/form/DropDownButton",
		"dijit/form/Form",
		"dijit/form/TextBox",
		"dijit/registry",
		"dijit/Dialog",
		"dijit/TooltipDialog",
		"dojox/encoding/crypto/RSAKey",
		"doscuss/utils",
        "dojo/domReady!"],
function(event, baseFx, dom, style, parser, ready, request, when, Button, DropDownButton, Form, TextBox, 
		registry, Dialog, TooltipDialog, RSAKey, utils){
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
		request.get("/client/login.json", {
			handleAs: "json"
		}).then(function(loginKey){
			var rsakey = new RSAKey(),
				loginInfo = registry.byId("formLogin").get("value");
			rsakey.setPublic(loginKey.n, loginKey.e);
			var credentials = {
				username: loginInfo.username,
				password: utils.hex2b64(rsakey.encrypt(loginInfo.password))
			}
			request.post("/users/" + escape(loginInfo.username) + "/login/", {
				data: credentials,
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
	
	ready(function(){
		when(parser.parse(), function(){
			baseFx.fadeOut({  //Get rid of the loader once parsing is done
				node: "preloader",
				onEnd: function() {
					style.set("preloader","display","none");
				}
			}).play();
		});
	});
});