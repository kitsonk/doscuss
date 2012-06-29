define([
	"dojo/_base/declare", // declare
	"dojo/Deferred", // Deferred
	"dojo/Stateful", // Stateful
	"./sql",  // sql.getSelect
	"./utils"  // String.prototype.toLowerCamelCase
], function(declare, Deferred, Stateful, sql){
	
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
		_orderBy: "id ASC",
		
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
	
	return declare([Stateful], {
		forum: null,
		isDirty: false,
		_table: "posts",
		_posts: [],
		
		constructor: function(forum){
			this.forum = forum;
			this._posts = [];
		},
		
		_load: function(range, filter){
			this.flush();
			this._loadDeferred = new Deferred();
			var self = this;
			this.forum.db.all(sql.getSelect(this, range, filter), function(err, rows){
				if(err) self._loadDeferred.reject(err);
				self.fromSql(rows);
				self._loadDeferred.resolve(self._posts);
			});
			return this._loadDeferred;
		},
		
		_loadId: function(id){
			this.flush();
			this._loadDeferred = new Deferred();

			var post = Post.prototype,
				sqlId = {},
				stmt = this.forum.statements.select[post._table] || 
					(this.forum.statements.select[post._table] = this.forum.db.prepare(sql.getSelectByIdStmt(post)));

			sqlId["$" + post._id] = id;

			var self = this;
			stmt.all(sqlId, function(err, rows){
				if(err) self._loadDeferred.reject(err);
				if(rows.length){
					self.fromSql(rows);
					self._loadDeferred.resolve(self._posts[0]);
				}else{
					var err = new Error("Resource not fund");
					err.number = 404;
					self._loadDeferred.reject(err);
				}
			});
			return this._loadDeferred;
		},
		
		_save: function(){
			this._posts.forEach(function(post){
				// TODO complete
			});
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
		
		flush: function(){
			if(this._posts.length){
				if(this.get("isDirty")){
					this._save();
				}
				this._posts = [];
			}
			this.isDirty = false;
		},
		
		fromSql: function(rows){
			var self = this;
			rows.forEach(function(row){
				self._posts.push(new Post(row));
			});
		},
		
		toJson: function(){
			return JSON.stringify(this.data());
		},
		
		data: function(range, filter){
			var self = this;
			return this._load(range, filter).then(function(posts){
				var results = [];
				posts.forEach(function(post){
					results.push(post.data());
				});
				return results;
			});
		},
		
		count: function(filter){
			var d = new Deferred(),
				post = Post.prototype;
			
			this.forum.db.all(sql.getCount(post, filter), function(err, rows){
				if(err) d.reject(err);
				if(rows[0] && rows[0].cnt){
					d.resolve(rows[0].cnt);
				}else{
					d.resolve(0);
				}
			});
			return d;
		},
		
		byId: function(id){
			return this._loadId(id).then(function(post){
				return post.data();
			});
		},
		
		del: function(id){
			var self = this;
			return this._loadId(id).then(function(post){
				self._deleteDeferred = new Deferred();
				var	post = Post.prototype,
					sqlId = {},
					stmt = self.forum.statements.del[post._table] || 
						(self.forum.statements.del[post._table] = self.forum.db.prepare(sql.getDelete(post)));
				
				sqlId["$" + post._id] = id;
				stmt.run(sqlId, function(err, lastId, changes){
					if(err) self._deleteDeferred.reject(err);
					console.log(lastId, changes);
					self._deleteDeferred.resolve(true);
				});
				return self._deleteDeferred;
			});
		},
		
		add: function(id){
			
		},
		
		update: function(content){
			
		}
	});
});