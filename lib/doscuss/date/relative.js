define([
	"dojo/date/stamp",
	"dojo/i18n",
	"dojo/i18n!../nls/dateRelative"
], function(stamp, i18n, dateRelative){
	var relative = function(dateString){
	};
	
	relative.labels = i18n.getLocalization("doscuss", "dateRelative", this.lang);
	
	return relative;
});