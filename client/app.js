/*!
 * doscuss - A Dojo/Node.js Forum and Mailing List
 * Client Application Scripts
 * 
 * Author: Kitson P. Kelly <dojo@kitsonkelly.com>
 * Version: 0.9.0
 * 
 */

require([
		"dojo/_base/Deferred",
        "dojo/_base/fx",
		"dojo/_base/lang",
		"dojo/_base/xhr",
		"dojo/dom",
		"dojo/dom-style",
		"dojo/parser",
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
function(Deferred, baseFx, dlang, xhr, dom, domStyle, parser, Button, DropDownButton, Form, TextBox, 
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
		dojo.stopEvent(e);  // Keeps form from normal submit
		dojo.xhrGet({
			url: "./login.json",
			handleAs: "json"
		}).then(function(loginKey){
			var rsakey = new dojox.encoding.crypto.RSAKey(),
				loginInfo = registry.byId("formLogin").get("value");
			rsakey.setPublic(loginKey.n, loginKey.e);
			var credentials = {
				username: loginInfo.username,
				password: utils.hex2b64(rsakey.encrypt(loginInfo.password))
			}
			dojo.xhrPost({
				content: credentials,
				url: "/users/" + escape(loginInfo.username) + "/login/",
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
	
	Deferred.when(parser.parse(), function(){
		baseFx.fadeOut({  //Get rid of the loader once parsing is done
			node: "preloader",
			onEnd: function() {
				domStyle.set("preloader","display","none");
			}
		}).play();
	});
});