var brand = function() {
	
	var init = function() {
		getBrandList(mapping);
	}
	
	var getBrandList = function(next) {
		$.ajax ({
			type : "GET"
			, url : "/main/brandList"
			, dataType : "json"
			, async : false
			, success : function(rs) {
				brandList = rs;
			}
			, error : function(err) {
			}
		});
		
		next();
	}
	
	var mapping = function() {
		for( var cnt in brandList ) {
			var brandcd = brandList[cnt]["brandcd"];
			brandCodeMap[brandcd] = {
				"eng" : brandList[cnt]["brandnm"]
				, "kor" : brandList[cnt]["brandnmh"]
			};
		}
	}
	
	// brand code를 넣으면, 브랜드의 이름을 영문-한글로 리턴한다.
	// {end : blar.., kor : blar..}
	this.pickBrand = function(code) {
		if( brandCodeMap[code] === undefined ) {
			return null;
		} else {
			return brandCodeMap[code];
		}
	}
	
	this.getBrandMap = function() {
		return brandCodeMap();
	}
	
	var brandList = [];
	var brandCodeMap = {};
	init();
}

var getBrand = new brand();
//console.log( getBrand.pickBrand(100) );
