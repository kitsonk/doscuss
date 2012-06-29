define([
	"./utils" // String.prototype.toUnderScore
], function(){
	
	function getFields(obj){
		var fields = [];
		if("fields" in obj && typeof obj["fields"] == "function"){
			fields = obj.fields();
		}else{
			for (var key in obj){
				if (typeof obj[key] !== "function" && key.charAt(0) !== '_'){
					fields.push(key.toUnderScore());
				}
			}
		}
		return fields;
	}
	
	return {
		getSelect: function(obj, range, filter, orderBy){
			filter = obj._filter ? obj._filter : filter;
			orderBy = orderBy || obj._orderBy || null;
			var sql = 'SELECT ' + getFields(obj).join() + ' FROM ' + obj._table;
			if(range){
				var limit = range.end - range.start + 1;
				sql += ' LIMIT ' + limit;
				if(parseInt(range.start)){
					sql += ' OFFSET ' + range.start;
				}
			}
			if(obj._orderBy){
				sql += ' ORDER BY ' + orderBy;
			}
			return sql + ';';
		},
		
		getSelectByIdStmt: function(obj){
			return 'SELECT ' + getFields(obj).join() + ' FROM ' + obj._table + ' WHERE ' + obj._id.toUnderScore() + ' = $' + obj._id + ';';
		},
		
		getDeleteStmt: function(obj){
			return 'SELECT FROM ' + obj._table + ' WHERE ' + obj._id.toUnderScore() + ' = $' + obj._id + ';';
		},
		
		getCount: function(obj, filter){
			return 'SELECT count(*) cnt FROM ' + obj._table + ';';
		}
	}
});