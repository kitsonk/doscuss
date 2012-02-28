var profile = (function(){
	var testResourceRe = /^doscuss\/tests\//,

		copyOnly = function(filename, mid){
			var list = {
				"doscuss/doscuss.profile":1,
				"doscuss/package.json":1
			};
			return (mid in list) || (/^doscuss\/resources\//.test(mid) && !/\.css$/.test(filename)) || /(png|jpg|jpeg|gif|tiff)$/.test(filename);
		};

	return {
		resourceTags:{
			test: function(filename, mid){
				return testResourceRe.test(mid);
			},

			copyOnly: function(filename, mid){
				return copyOnly(filename, mid);
			},

			amd: function(filename, mid){
				return !testResourceRe.test(mid) && !copyOnly(filename, mid) && /\.js$/.test(filename);
			}
		},

		trees:[
			[".", ".", /(\/\.)|(~$)/]
		]
	};
})();