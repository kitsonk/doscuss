define(function(){
	var b64map="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
		b64pad="=",
		BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";
	
	function int2char(n) { return BI_RM.charAt(n); }
	
	var utils = {
		hex2b64: function(h) {
			var i,
				c,
				ret = "";
				
			for (i = 0; i+3 <= h.length; i+=3){
				c = parseInt(h.substring(i,i+3),16);
				ret += b64map.charAt(c >> 6) + b64map.charAt(c & 63);
			}
			if(i+1 == h.length) {
				c = parseInt(h.substring(i,i+1),16);
				ret += b64map.charAt(c << 2);
			}else if(i+2 == h.length){
				c = parseInt(h.substring(i,i+2),16);
				ret += b64map.charAt(c >> 2) + b64map.charAt((c & 3) << 4);
			}
			while((ret.length & 3) > 0){
				ret += b64pad;
			}
			return ret;
		},
		
		b64tohex: function(s){
			var ret = "",
				i,
		  		k = 0, // b64 state, 0-3
		  		slop;
			
			for (i = 0; i < s.length; ++i){
				if(s.charAt(i) == b64pad) break;
				v = b64map.indexOf(s.charAt(i));
				if(v < 0) continue;
				if(k == 0){
					ret += int2char(v >> 2);
					slop = v & 3;
					k = 1;
				}else if(k == 1){
					ret += int2char((slop << 2) | (v >> 4));
					slop = v & 0xf;
					k = 2;
				}else if(k == 2){
					ret += int2char(slop);
					ret += int2char(v >> 2);
					slop = v & 3;
					k = 3;
				}else{
					ret += int2char((slop << 2) | (v >> 4));
					ret += int2char(v & 0xf);
					k = 0;
				}
			}
			if(k == 1){
				ret += int2char(slop << 2);
			}
			return ret;
		}
	};
	
	return utils;
});