define([
	"dojo/_base/declare",
	"dojo/text!./resources/ForumPost.html",
	"dojo/text!./resources/_ForumReply.html",
	"./_ForumTag",
	"dojo/_base/array", // array.forEach
	"dojo/_base/lang", // lang.delegate lang.hitch lang.isFunction lang.isObject lang.mixin
	"dojo/_base/Deferred", // Deferred.when
	"dojo/_base/event", // event.stop
	"dojo/_base/kernel", // kernel._scopeName
	"dojo/_base/window", // win.doc
	"dojo/dom", // dom.byId
	"dojo/dom-class", // domClass.replace
	"dojo/dom-geometry", // domGeometry.setMarginBox domGeometry.getMarginBox
	"dojo/dom-style", // style.set
	"dojo/fx", // coreFx.wipeIn coreFx.wipeOut
	"dojo/html", // html._ContentSetter
	"dojo/i18n", // i18n.getLocalization
	"dojo/string", // string.substitute
	"dijit/_base/manager", // manager.defaultDuration
	"dijit/_Contained",
	"dijit/_Container",
	"dijit/_CssStateMixin",
	"dijit/_TemplatedMixin",
	"dijit/_Widget",
	"dijit/Editor",
	"dijit/_editor/plugins/AlwaysShowToolbar",
	"dijit/Menu",
	"dijit/MenuItem",
	"dijit/form/ComboButton",
	"dojo/i18n!./nls/Forum"
], function(declare, templatePost, templateReply, _ForumTag, array, lang, Deferred, event, kernel, win, dom, 
		domClass, domGeometry, style, coreFx, html, i18n, string, manager, _Contained, _Container, 
		_CssStateMixin, _TemplatedMixin, _Widget, Editor, AlwaysShowToolbar, Menu, MenuItem, ComboButton){
	
	var _ForumPostMixin = declare(null, {
		summary: "",
		author: {username: "", postCount: "", avatar: ""},
		body: "",
		created: "2000-01-01T00:00:00+00:00",

		stopParser: true,
		parseOnLoad: true,
		parserScope: kernel._scopeName,
		
		_createButtons: function(){
			var replyComboActions = this._replyComboActions.slice();
				rootComboAction = replyComboActions.shift(),
				replyMenu = new Menu({ style: "display: none;" });
			
			array.forEach(replyComboActions, function(action){
				var menuItem = new MenuItem({
					label: action.label,
					onClick: lang.hitch(this, action.action)
				});
				replyMenu.addChild(menuItem);
			}, this);
			
			this._replyButton = new ComboButton({
				id: this.id + '_replyComboButton',
				label: rootComboAction.label,
				onClick: lang.hitch(this, rootComboAction.action),
				dropDown: replyMenu
			}, this.controlNode);
			
			this._supportingWidgets.push(this._replyButton);
		},
		
		postCreate: function(){
			this._createButtons();
			
			this.inherited(arguments);
		},
		
		startup: function(){
			this.inherited(arguments);

			// And this catches stuff like dojo.dnd.Source
			if(this._contentSetter){
				array.forEach(this._contentSetter.parseResults, function(obj){
					if(!obj._started && !obj._destroyed && lang.isFunction(obj.startup)){
						obj.startup();
						obj._started = true;
					}
				}, this);
			}
		},
		
		_setBodyAttr: function(/*String|DomNode|Nodelist*/data, /*Boolean*/ isFakeContent){
			var setter = this._contentSetter;
			if(! (setter && setter instanceof html._ContentSetter)){
				setter = this._contentSetter = new html._ContentSetter({
					node: this.bodyNode,
					_onError: lang.hitch(this, this._onError),
					onContentError: lang.hitch(this, function(e){
						// fires if a domfault occurs when we are appending this.errorMessage
						// like for instance if domNode is a UL and we try append a DIV
						var errMess = this.onContentError(e);
						try{
							this.bodyNode.innerHTML = errMess;
						}catch(e){
							console.error('Fatal ' + this.id + ' could not change content due to ' + e.message, e);
						}
					})
				});
			}
			
			var setterParams = {
				cleanContent: this.cleanContent,
				extractContent: this.extractContent,
				parseContent: !data.domNode && this.parseOnLoad,
				parserScope: this.parserScope,
				startup: false,
				dir: this.dir,
				lang: this.lang,
				textDir: this.textDir
			};
			
			Deferred.when(setter.set( (lang.isObject(data) && data.domNode) ? data.domNode : data, setterParams ), function(){
				if(!isFakeContent){
					if(this._started){
						// Startup each top level child widget (and they will start their children, recursively)
						delete this._started;
						this.startup();
					}
				}
			});
		},
		_getBodyAttr: function(){
			return this.bodyNode.innerHtml;
		},
		
		addReply: function(replyParams){
			var replyParams = lang.mixin(replyParams, {
					id: this.id + "_reply" + this.getChildren().length
				}),
				reply = new _ForumReply(replyParams);
			
			this.addChild(reply);
			return reply;
		},
		
		_showEditor: function(){
			if (!this._editor) {
				var editor = this.editor = new Editor({
					id: this.id + "_editor",
					height: "",
					extraPlugins: [AlwaysShowToolbar]
				}, this.editorNode);
			}
		},
		
		onContentError: function(/*Error*/ /*===== error =====*/){
			// summary:
			//		Called on DOM faults, require faults etc. in content.
			//
			//		In order to display an error message in the pane, return
			//		the error message from this method, as an HTML string.
			//
			//		By default (if this method is not overriden), it returns
			//		nothing, so the error message is just printed to the console.
			// tags:
			//		extension
		}
	});
	
	var _ForumReply = declare([_Widget, _Container, _Contained, _CssStateMixin, _TemplatedMixin, _ForumPostMixin], {
		baseClass: "doscussReply",
		cssStateNodes: {
			"headerNode": "doscussReplyHeader"
		},
		templateString: templateReply,
		
		open: false,
		duration: manager.defaultDuration,
		
		_replyComboActions: [
			{
				label: "Reply",
				action: function(evt){
					event.stop(evt);
					console.log("reply");
					this._showEditor();
				}
			},{
				label: "Reply to Sender", 
				action: function(evt){ 
					event.stop(evt);
					console.log("reply_to_sender"); 
				}
			}],
		
		buildRendering: function(){
			var labels = i18n.getLocalization("doscuss", "Forum", this.lang);
			this.timeHtml = "about 8 minutes ago";
			this.authorHtml = "<a href=\"#\">" + this.author.username + "</a>";
			this.countHtml = this.author.postCount + " " + labels.posts;
			this.avatarHtml = this.author.avatar;
			this.summary = this.summary || this.body ? this.body.replace(/<[^>]*?>/gi, "").split("\n")[0] : "";
			
			this.inherited(arguments);
		},
		
		postCreate: function(){
			var hideNode = this.hideNode, 
				wipeNode = this.wipeNode;
			this._wipeIn = coreFx.wipeIn({
				node: wipeNode,
				duration: this.duration,
				beforeBegin: function(){
					style.set(hideNode, "display", "");
				}
			});
			this._wipeOut = coreFx.wipeOut({
				node: wipeNode,
				duration: this.duration,
				onEnd: function(){
					style.set(hideNode, "display", "none");
				}
			});
			style.set(this.hideNode, "display", this.open ? "" : "none");
			style.set(this.wipeNode, "display", this.open ? "" : "none");
			
			this.inherited(arguments);
		},
		
		_setCss: function(){
			var node = this.headerNode,
				oldCls = this._headerClass || this.baseClass + "HeaderClosed";
			this._headerClass = this.baseClass + "Header" + (this.open ? "Open" : "Closed");
			domClass.replace(node, this._headerClass, oldCls);
			
			this.arrowNodeInner.innerHTML = this.open ? "-" : "+";
		},
		
		_setBodyAttr: function(/*String|DomNode|Nodelist*/ content){
			
			if(!this.open || !this._wipeOut || this._wipeOut.status() == "playing"){
				// we are currently *closing* the pane (or the pane is closed), so just let that continue
				this.inherited(arguments);
			}else{
				if(this._wipeIn && this._wipeIn.status() == "playing"){
					this._wipeIn.stop();
				}

				// freeze container at current height so that adding new content doesn't make it jump
				domGeometry.setMarginBox(this.wipeNode, { h: domGeometry.getMarginBox(this.wipeNode).h });

				// add the new content (erasing the old content, if any)
				this.inherited(arguments);

				// call _wipeIn.play() to animate from current height to new height
				if(this._wipeIn){
					this._wipeIn.play();
				}else{
					style.set(this.hideNode, "display", "");
				}
			}
		},
		
		_setOpenAttr: function(/*Boolean*/ open, /*Boolean*/ animate){
			array.forEach([this._wipeIn, this._wipeOut], function(animation){
				if(animation && animation.status() == "playing"){
					animation.stop();
				}
			});
			
			if(animate){
				var anim = this[open ? "_wipeIn" : "_wipeOut"];
				anim.play();
			}else{
				style.set(this.hideNode, "display", open ? "" : "none");
				style.set(this.wipeNode, "display", open ? "" : "none");
			}
			
			this._set("open", open);
			this._setCss();
		},
		
		toggle: function(){
			this._setOpenAttr(!this.open, true);
		},
		
		_onHeaderClick: function(){
			this.toggle();
		}
	});
	
	return declare([_Widget, _Container, _TemplatedMixin, _ForumPostMixin], {
		baseClass: "doscussPost",
		templateString: templatePost,

		tags: [],
		_tagWidgets: [],
		
		_createTag: function(tag){
			var tagWidget = new _ForumTag({
				label: tag
			}).placeAt(this.tagsNode);
			this._tagWidgets.push(tagWidget);
			return tagWidget;
		},
		
		_replyComboActions: [
			{
				label: "Reply",
				action: function(evt){
					console.log("reply");
					this._showEditor();
				}
			},{
				label: "Reply to Sender", 
				action: function(evt){ 
					console.log("reply_to_sender"); 
				}
			},{
				label: "Permalink",
				action: function(evt){
					console.log("permalink");
				}
			}],
		
		create: function(params, srcNodeRef){
			// Convert a srcNodeRef argument into a content parameter, so that the original contents are
			// processed in the same way as contents set via set("body", ...), calling the parser etc.
			// Avoid modifying original params object since that breaks NodeList instantiation.
			if((!params || !params.template) && srcNodeRef && !("body" in params)){
				var df = win.doc.createDocumentFragment();
				srcNodeRef = dom.byId(srcNodeRef);
				while(srcNodeRef.firstChild){
					df.appendChild(srcNodeRef.firstChild);
				}
				params = lang.delegate(params, {body: df});
			}
			this.inherited(arguments, [params, srcNodeRef]);
		},
		
		postMixinProperties: function(){
			this.inherited(arguments);
		},
		
		buildRendering: function(){
			this.timeHtml = "about 16 minutes ago";
			this.authorHtml = "<a href=\"#\">" + this.author.username + "</a>";
			this.countHtml = this.author.postCount + " posts";
			this.avatarHtml = this.author.avatar;
			this.inherited(arguments);
		},
		
		postCreate: function(){
			array.forEach(this.tags, function(tag){
				this._supportingWidgets.push(this._createTag(tag));
			}, this);
			
			this.inherited(arguments);
		},
		
		_onError: function(type, err, consoleText){
			// shows user the string that is returned by on[type]Error
			// override on[type]Error and return your own string to customize
			var errText = this['on' + type + 'Error'].call(this, err);
			if(consoleText){
				console.error(consoleText, err);
			}else if(errText){// a empty string won't change current content
				this._setContent(errText, true);
			}
		}
	});
});