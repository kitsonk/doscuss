define([
	"dojo/_base/declare",
	"dojo/text!./resources/Forum.html",
	"dojo/text!./resources/_ForumTopic.html",
	"./_ForumTag",
	"./date/relative",
	"dojo/_base/array",
	"dojo/_base/fx",
	"dojo/_base/lang", // lang.mixin
	"dojo/dom-construct",
	"dojo/dom-style",
	"dojo/fx",
	"dojo/i18n",
	"dojo/string",
	"dijit/_Contained",
	"dijit/_Container",
	"dijit/_CssStateMixin",
	"dijit/_TemplatedMixin",
	"dijit/_Widget",
	"dijit/layout/_LayoutWidget",
	"dojo/i18n!./nls/Forum"
], function(declare, templateForum, templateTopic, _ForumTag, dateRelative, array, baseFx, lang, domConstruct, domStyle, 
		coreFx, i18n, string, _Contained, _Container, _CssStateMixin, _TemplatedMixin, _Widget, _LayoutWidget){
	
	var _ForumTopic = declare([_Widget, _Contained, _TemplatedMixin, _CssStateMixin], {
		baseClass: "doscussTopic",
		cssStateNodes: {
			"focusNode": "doscussTopic"
		},
		templateString: templateTopic,
		infoTemplateString: "<span class=\"${c}Time\">${t}</span> ${b} <a class=\"${c}User\" href=\"#\">${a}</a>",
		
		views: "0",
		replies: "0",
		summary: "",
		author: "",
		insert: true,
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
		
		buildRendering: function(){
			this.infoHtml = string.substitute(this.infoTemplateString, {
				c: this.baseClass,
				t: "about 15 seconds ago",
				b: "by",
				a: this.author
			});
			this.inherited(arguments);
		},
		
		postCreate: function(){
			array.forEach(this.tags, function(tag){
				this._supportingWidgets.push(this._createTag(tag));
			}, this);
			this.inherited(arguments);
		},
		
		startup: function(){
			this.inherited(arguments);
			if (this.insert){
				domStyle.set(this.domNode, "opacity", "0");
				domStyle.set(this.domNode, "height", "0px");
				coreFx.combine([coreFx.wipeIn({node: this.domNode, duration: 750}),baseFx.fadeIn({node: this.domNode, duration: 1000})]).play();
			}else{
				domStyle.set(this.domNode, "opacity", "0");
				baseFx.fadeIn({node: this.domNode, duration: 1000}).play();
			}
		}
		
	});
	
	return declare([_LayoutWidget, _TemplatedMixin, _CssStateMixin], {
		baseClass: "doscussForum",
		cssStateNodes: {
			"headerNode": "doscussForumHeader"
		},
		templateString: templateForum,
		viewsHeaderLabel: "Views",
		repliesHeaderLabel: "Replies",
		topicsHeaderLabel: "Topics",
		emptyMessage: "No Topics...",
		
		_emptyContainer: true,
		
		postMixInProperties: function(){
			this.inherited(arguments);
			var labels = i18n.getLocalization("doscuss", "Forum", this.lang);
			for (var label in labels){
				if (label === "emptyMessage"){
					this.emptyMessage = labels[label];
				}else if (!this[label + "HeaderLabel"]){
					this[label + "HeaderLabel"] = labels[label];
				}
			}
		},
		
		addChild: function(/*dijit._WidgetBase*/ widget, /*int?*/ insertIndex){
			if (this._emptyContainer){
				this.destroyDescendants();
				domConstruct.empty(this.containerNode);
				this._emptyContainer = false;
			}
			this.inherited(arguments);
		},
		
		addTopic: function(topicInfo){
			var topicSettings = lang.mixin(topicInfo, {
				id: this.id + "_topic" + this.getChildren().length
			});
			this.addChild(new _ForumTopic(topicSettings), 0);
		},
		
		appendTopic: function(topicInfo){
			var topicSettings = lang.mixin(topicInfo, {
				id: this.id + "_topic" + this.getChildren().length,
				insert: false
			});
			this.addChild(new _ForumTopic(topicSettings));
		}
	});
});