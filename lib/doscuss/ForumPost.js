define([
	"dojo/_base/declare",
	"dojo/text!./resources/ForumPost.html",
	"dojo/text!./resources/_ForumReply.html",
	"./_ForumTag",
	"dojo/_base/array", // array.forEach
	"dojo/_base/lang", // lang.delegate lang.hitch lang.isFunction lang.isObject lang.mixin
	"dojo/_base/event", // event.stop
	"dojo/_base/kernel", // kernel._scopeName
	"dojo/_base/window", // win.doc
	"dojo/dom", // dom.byId dom.setSelectable
	"dojo/dom-class", // domClass.replace
	"dojo/dom-geometry", // domGeometry.setMarginBox domGeometry.getMarginBox
	"dojo/dom-style", // style.set
	"dojo/fx", // coreFx.wipeIn coreFx.wipeOut
	"dojo/html", // html._ContentSetter
	"dojo/i18n", // i18n.getLocalization
	"dojo/query",
	"dojo/string", // string.substitute
	"dojo/window", // winUtil.scrollIntoView
	"dojo/when", // when
	"dijit/_base/manager", // manager.defaultDuration
	"dijit/_Contained",
	"dijit/_Container",
	"dijit/_CssStateMixin",
	"dijit/_TemplatedMixin",
	"dijit/_Widget",
	"dijit/Editor",
	"dijit/_editor/plugins/AlwaysShowToolbar",
	"dijit/_editor/plugins/EnterKeyHandling",
	"dijit/_editor/plugins/FontChoice",
	"dijit/_editor/plugins/LinkDialog",
	"dijit/_editor/plugins/TextColor",
	"dijit/Menu",
	"dijit/MenuItem",
	"dijit/form/Button",
	"dijit/form/ComboButton",
	"dojo-controller/action/Action",
	"dojo/i18n!./nls/Forum"
], function(declare, templatePost, templateReply, _ForumTag, array, lang, event, kernel, win, dom, domClass, 
		domGeometry, style, coreFx, html, i18n, query, string, winUtil, when, manager, _Contained, _Container, 
		_CssStateMixin, _TemplatedMixin, _Widget, Editor, AlwaysShowToolbar, EnterKeyHandling, FontChoice, 
		LinkDialog, TextColor, Menu, MenuItem, Button, ComboButton, Action){
	
	var _ForumPostMixin = declare(null, {
		summary: "",
		author: {username: "", postCount: "", avatar: ""},
		body: "",
		created: "2000-01-01T00:00:00+00:00",

		stopParser: true,
		parseOnLoad: true,
		parserScope: kernel._scopeName,
		editorStyleSheets: "/lib/doscuss/resources/ForumPost.css",
		
		_createButtons: function(){
			this._actions = [];
			this._actionBinds = [];
			
			var replyComboActions = array.map(this._replyComboActions.slice(), function(item){ // Copy array
					item.scope = this; // Add local scope
					return item;
				}, this),
				rootComboActionParams = replyComboActions.shift(), // Pull off first
				replyMenu = new Menu({ style: "display: none;" });  // Create Drop Down Menu
			
			array.forEach(replyComboActions, function(actionParams){
				var action = new Action(actionParams),
					menuItem = new MenuItem();
				
				this._actionBinds.push(action.bind(menuItem));
				this._actions.push(action);
				replyMenu.addChild(menuItem);
			}, this);
			
			var action = new Action(rootComboActionParams);
			this._replyButton = new ComboButton({
				id: this.id + '_replyComboButton',
				dropDown: replyMenu
			}, this.controlNode);
			
			this._actionBinds.push(action.bind(this._replyButton));
			this._actions.push(action);
			this._supportingWidgets.push(this._replyButton);
		},
		
		postCreate: function(){
			this._createButtons();
			
			style.set(this.editorWrapNode, "display", "none");
			
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
			
			when(setter.set( (lang.isObject(data) && data.domNode) ? data.domNode : data, setterParams ), function(){
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
		
		_quoteText: function(node, username, timeStamp){
			if(typeof string === "string"){
				node = dom.byId("node");
			}
			
			var quoteClassHash = {
				doscussQ4: "doscussTemp",
				doscussQ3: "doscussQ4",
				doscussQ2: "doscussQ3",
				doscussQ1: "doscussQ2",
				doscussTemp: "doscussQ1"
			};
			
			var messageNode = lang.clone(node);
			for(var classString in quoteClassHash){
				query("." + classString, messageNode).removeClass(classString).addClass(quoteClassHash[classString]);
			}
			return '<br/><br/><div>16 minutes ago, kitsonk said:</div><blockquote class="doscussQ1">' + messageNode.innerHTML + "</blockquote><br/>";
		},
		
		_showEditor: function(quoteBody){
			if (!this._editor) {
				style.set(this.editorWrapNode, "display", "");
				var editor = this._editor = new Editor({
						id: this.id + "_editor",
						height: "",
						minHeight: "150px",
						styleSheets: this.editorStyleSheets,
						plugins: ["undo", "redo", "|", "cut", "copy", "paste", "|", 
							{name: "dijit/_editor/plugins/FontChoice", command: "fontName", custom:["Verdana", "Times New Roman", "Helvetica", "Comic Sans MS", "Consolas"]}, 
							"fontSize", "|", "bold", "italic", "underline", "strikethrough", "foreColor", "hiliteColor", "|", 
							"insertOrderedList", "insertUnorderedList", "indent", "outdent", "createLink", "unlink", "|",
							"justifyLeft", "justifyRight", "justifyCenter", "justifyFull", EnterKeyHandling, AlwaysShowToolbar]
					}, this.editorNode),
					postButton = new Button(),
					postAction = new Action({
						binds: [postButton],
						scope: this,
						label: "Send",
						title: "Send the message",
						run: function(){
							console.log(this._editor.get("value"));
						}
					}),
					cancelButton = new Button(),
					cancelAction = new Action({
						binds: [cancelButton],
						label: "Discard",
						title: "Cancel sending the message and discard",
						run: function(){
							console.log("cancel");
						}
					});
				
				postButton.placeAt(this.editorButtonNode, "last");
				cancelButton.placeAt(this.editorButtonNode, "last");
				this._supportingWidgets.push(postButton);
				this._supportingWidgets.push(cancelButton);
				this._actions.push(postAction);
				this._actions.push(cancelAction);
			}
			var self = this;
			when(this._editor.onLoadDeferred, function(){
				if(quoteBody){
					self._editor.set("value", self._quoteText(self.bodyNode));
				}
				self._editor.focus();
				winUtil.scrollIntoView(self.editorWrapNode);
			});
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
				run: function(evt){
					event.stop(evt);
					this._showEditor(true);
				}
			},{
				label: "Reply to Sender", 
				run: function(evt){ 
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
			dom.setSelectable(this.headerNode, false);
			
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
		
		_onHeaderClick: function(e){
			if (e.clientX && e.clientY){
				this.toggle();
			}
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
				title: "Reply to Post",
				run: function(evt){
					this._showEditor(true);
				}
			},{
				label: "Reply to Sender", 
				title: "Reply only to the sender",
				run: function(evt){ 
					console.log("reply_to_sender"); 
				}
			},{
				label: "Permalink",
				title: "Copy a a link direct to this post to your clipboard",
				run: function(evt){
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