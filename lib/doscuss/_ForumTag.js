define([
	"dojo/_base/declare",
	"dojo/text!./resources/_ForumTag.html",
	"dijit/_Contained",
	"dijit/_CssStateMixin",
	"dijit/_TemplatedMixin",
	"dijit/_Widget",
	"dijit/form/_ButtonMixin"
], function(declare, template, _Contained, _CssStateMixin, _TemplatedMixin, _Widget, _ButtonMixin){
	
	return declare([_Widget, _TemplatedMixin, _CssStateMixin, _ButtonMixin], {
		baseClass: "doscussTag",
		label: "",
		cssStateNodes: {
			"focusNode": "doscussTag"
		},
		templateString: template
	});
	
});