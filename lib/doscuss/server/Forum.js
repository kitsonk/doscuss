define([
	"dojo/_base/declare",
	"dojo/Evented",
	"dojo/Stateful",
	"dojo/node!sqlite3",
	"doscuss/server/Posts"
], function(declare, Evented, Stateful, sqlite3, Posts){
	return declare([Stateful, Evented], {
		posts: null,
		db: null,
		statements: {
			select: {},
			del: {}
		},
		
		constructor: function(forumDb){
			this.posts = new Posts(this);
			this.db = new sqlite3.Database(forumDb);
		},
		
		close: function(){
			if(this.db){
				this.db.close();
				this.db = null;
			}
		}
	});
});
