define([
	"dojo/_base/declare", // declare
	"dojo/Deferred", // Deferred
	"./sql",  // sql.getSelect
	"./utils"  // String.prototype.toLowerCamelCase
], function(declare, Deferred, sql){
	
	var Post = declare(null, {
		// Data Structure
		id: "",
		createdUserId: "",
		createdTs: "",
		modifiedUserId: "",
		modifiedTs: "",
		subject: "",
		content: "",
		status: "",

		// Private Variables
		_table: "posts",
		_id: "id",
		
		// Helper Functions
		constructor: function(row){
			if (row){
				this.fromSql(row);
			}
		},
		
		fromSql: function(row){
			for (var key in row){
				var objKey = key.toLowerCamelCase();
				if (objKey in this && typeof this[key] !== "function" && key.charAt(0) !== '_'){
					this[objKey] = row[key];
				}
			}
		},
		
		data: function(){
			var result = {};
			for (var key in this){
				if (typeof this[key] !== "function" && key.charAt(0) !== '_'){
					result[key] = this[key];
				}
			}
			return result;
		}
	});
	
	return declare(null, {
		forum: null,
		_table: "posts",
		_posts: [],
		
		constructor: function(forum){
			this.forum = forum;
			this._posts = [];
		},
		
		_load: function(range, filter){
			this._loadDeferred = new Deferred();
			var self = this;
			this.forum.db.all(sql.getSelect(this, range, filter), function(err, rows){
				if(err) self._loadDeferred.reject(err);
				self.fromSql(rows);
				self._loadDeferred.resolve(rows);
			});
			return this._loadDeferred;
		},
		
		fields: function(){
			var fields = [],
				p = Post.prototype;
			for (var key in p){
				if (typeof p[key] !== "function" && key.charAt(0) !== '_'){
					fields.push(key.toUnderScore());
				}
			}
			return fields;
		},
		
		fromSql: function(rows){
			var self = this;
			rows.forEach(function(row){
				self._posts.push(new Post(row));
			});
		},
		
		data: function(){
			var results = [];
			this._posts.forEach(function(post){
				results.push(post.data());
			});
			return results;
		},
		
		toJson: function(){
			return JSON.stringify(this.data());
		},
		
		get: function(range, filter){
			var self = this;
			return this._load(range, filter).then(function(data){
				return self.data();
			});
		},
		
		getById: function(id){
			
		}
	});
});