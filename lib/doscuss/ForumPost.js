define([
	"dojo/_base/declare",
	"dojo/text!./resources/ForumPost.html",
	"dojo/text!./resources/_ForumReply.html",
	"./_ForumTag",
	"dojo/_base/array", // array.forEach
	"dojo/_base/lang", // lang.delegate lang.hitch lang.isFunction lang.isObject lang.mixin
	"dojo/_base/Deferred", // Deferred.when
	"dojo/_base/kernel", // kernel._scopeName
	"dojo/_base/window", // win.doc
	"dojo/dom", // dom.byId
	"dojo/html", // html._ContentSetter
	"dijit/_Contained",
	"dijit/_Container",
	"dijit/_TemplatedMixin",
	"dijit/_Widget"
], function(declare, templatePost, templateReply, _ForumTag, array, lang, Deferred, kernel, win, dom, html, 
		_Contained, _Container, _TemplatedMixin, _Widget){
	
	var _ForumReply = declare([_Widget, _Container, _Contained, _TemplatedMixin], {
		baseClass: "doscussReply",
		templateString: templateReply,
		
		buildRendering: function(){
			this.timeHtml = "about 8 minutes ago";
			this.authorHtml = "<a href=\"#\">bill</a>";
			this.countHtml = "932 posts";
			this.avatarHtml = "<img src=\"http://www.gravatar.com/avatar/4145cb9cc056a332f9e8685ae57977e8?s=32&amp;d=identicon&amp;r=PG\" width=\"32\" height=\"32\" />";
			this.collapsedHtml = "<span class=\"doscussReplyAuthor\">bill</span> &mdash; <span class=\"doscussReplyTime\">about 8 minutes ago</span> &mdash; <span class=\"doscussReplyCollapsedSummary\">What you should consider doing is something something something other or else blah blah blah</span>";
			this.inherited(arguments);
		}
	});
	
	return declare([_Widget, _Container, _TemplatedMixin], {
		baseClass: "doscussPost",
		templateString: templatePost,
		
		stopParser: true,
		parserScope: kernel._scopeName,
		
		summary: "",
		body: "",
		author: "",
		created: "2000-01-01T00:00:00+00:00",
		tags: [],
		_tagWidgets: [],
		
		_createTag: function(tag){
			var tagWidget = new _ForumTag({
				label: tag
			}).placeAt(this.tagsNode);
			this._tagWidgets.push(tagWidget);
			return tagWidget;
		},
		
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
			this.authorHtml = "<a href=\"#\">kitsonk</a>";
			this.countHtml = "411 posts";
			this.avatarHtml = "<img src=\"http://www.gravatar.com/avatar/6a584beee5cf0830b60311e6cbb3a9d0?s=32&amp;d=identicon&amp;r=PG\" width=\"32\" height=\"32\" />";
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
		
		postCreate: function(){
			array.forEach(this.tags, function(tag){
				this._supportingWidgets.push(this._createTag(tag));
			}, this);
			this.inherited(arguments);
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
			});
			return this.addChild(new _ForumReply(replyParams));
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
});