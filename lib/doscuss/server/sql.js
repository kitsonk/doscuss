define([
], function(){
	return {
		getSelect: function(obj, range, filter){
			filter = obj.filter ? obj.filter : filter;
			var fields;
			if("fields" in obj && typeof obj["fields"] == "function"){
				fields = obj.fields();
			}else{
				for (var key in obj){
					if (typeof obj[key] !== "function" && key.charAt(0) !== '_'){
						fields.push(key.toUnderScore());
					}
				}
			}
			return 'SELECT ' + fields.join() + ' FROM ' + obj._table + ';';
		},
		
		getCount: function(obj, filter){
			return 'SELECT count(*) FROM ' + obj._table + ';';
		}
	}
});