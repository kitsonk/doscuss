define([
], function(){

	// Extend String prototype
	String.prototype.toLowerCamelCase = function(){
	    return this.replace(/([_-][a-z])/g, function($1){ return $1.toUpperCase().replace(/[_-]/,''); });
	};

	String.prototype.toUnderScore = function(){
	    return this.replace(/([A-Z])/g, function($1){ return "_" + $1.toLowerCase(); });
	};

	return {
		getUUID: function(){
			// Returns a compliant UUID
			return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
				var r = Math.random()*16|0, v = c == "x" ? r : (r&0x3|0x8);
				return v.toString(16);
			});
		},
		
		parseRange: function(range){
			var r = range.match(/^items=(\d+)-(\d+)$/i);
			return {
				start: r[1],
				end: r[2]
			};
		},
		
		getContentRange: function(start, count, total){
			return count ? "items " + start + "-" + (parseInt(start) + parseInt(count) - 1) + "/" + total : "/" + total;
		}

	}
});