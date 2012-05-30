define([
	"dojo/_base/declare",
	"dojo/text!./resources/Forum.html",
	"dojo/text!./resources/_ForumTopic.html",
	"./_ForumTag",
	"./date/relative",
	"dojo/_base/array", // array.forEach
	"dojo/_base/fx", // baseFx.fadeIn
	"dojo/_base/lang", // lang.mixin
	"dojo/dom-construct", // domConstruct.empty
	"dojo/dom-style", // style.set 
	"dojo/fx", // coreFx.combine coreFx.wipeIn
	"dojo/i18n", // i18n.getLocalization
	"dojo/string", // string.substitute
	"dojo/when", // when
	"dojox/css3/transit", // transit
	"dijit/_Contained",
	"dijit/_Container",
	"dijit/_CssStateMixin",
	"dijit/_TemplatedMixin",
	"dijit/_Widget",
	"dijit/layout/_LayoutWidget",
	"controller/action/Action",
	"dojo/i18n!./nls/Forum"
], function(declare, templateForum, templateTopic, _ForumTag, dateRelative, array, baseFx, lang, domConstruct, 
		style, coreFx, i18n, string, when, transit, _Contained, _Container, _CssStateMixin, _TemplatedMixin, 
		_Widget, _LayoutWidget, Action){
	
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
				style.set(this.domNode, "opacity", "0");
				style.set(this.domNode, "height", "0px");
				coreFx.combine([coreFx.wipeIn({node: this.domNode, duration: 750}),baseFx.fadeIn({node: this.domNode, duration: 1000})]).play();
			}else{
				style.set(this.domNode, "opacity", "0");
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
		
		store: null,
		query: null,
		queryOptions: null,
		start: 0,
		_currentStart: 0,
		count: 10,
		totalCount: 0,
		sort: null,
		
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
		
		startup: function(){
			this.inherited(arguments);
			this._queryStore();
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
		},
		
		_setStartAttr: function(value){
			this.start = this._currentStart = value;
		},
		
		_queryStore: function(){
			if(this.store){
				var options = {};
				if (this._currentStart) options.start = this._currentStart;
				if (this.count) options.count = this.count;
				if (this.sort) options.sort = this.sort;
				if (this.queryOptions) options.queryOptions = this.queryOptions;
				var self = this;
				var results = this.store.query(this.query, options);
				when(results.total, function(totalCount){
					console.log(totalCount);
					self.totalCount = totalCount;
					when(results, function(results){
						console.log(results);
					});
				});
			}
		}
	});
});