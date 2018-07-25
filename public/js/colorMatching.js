var colorMatching = function() {
	var getColorList = function(cbM, cbP) {
		$.ajax ({
			type : "GET"
			, url : "/main/colorList"
			, dataType : "json"
			, async : false
			, success : function(rs) {
				colorList = rs;
			}
			, error : function(err) {
			}
		});
		
		cbM();
		cbP();
	}
	
	this.printColorList = function(type) {
		if( type == "M" ) {
			console.log( mustitList );
		} else if( type == "P" ) {
			console.log( pantoneList );
		} else {
			console.log( colorList );
		}
	}
	
	// mustit의 color를 입력하면, pantone의 color 리스트를 return 한다.
	this.pickColorM = function(color) {
		if( mustitList[color] === undefined ) {
			return [];
		} else {
			return mustitList[color];
		}
	}
	
	// pantone의 color 리스트를 입력하면, mustit의 color를 return 한다.
	this.pickColorP = function(color) {
		if( pantoneList[color] === undefined ) {
			return null;
		} else {
			return pantoneList[color];
		}
	}
	
	// "/es/search/aggrs" > aggregations.color.buckets을 입력하면, 색상 배열을 return 한다. 
	this.convert = function(hits) {
		var arr = {};
		for( var cnt = 0 ; cnt < hits.length ; cnt++ ) {
			var mc = this.pickColorP(hits[cnt]["key"]);
			if( arr[mc] === undefined ) {
				arr[mc] = colorMap[mc];
			}
		}
		
		return arr;
	}
	
	var processMustit = function() {
		for( var cnt = 0 ; cnt < colorList.length ; cnt++ ) {
			var cm = colorList[cnt]["color_mustit"];
			if( mustitList[cm] === undefined ) {
				mustitList[cm] = [];
			}
			
			mustitList[cm].push(colorList[cnt]["color_name"]);
		}
	}
	
	var processPantone = function() {
		for( var cnt = 0 ; cnt < colorList.length ; cnt++ ) {
			var cp = colorList[cnt]["color_name"];
			pantoneList[cp] = colorList[cnt]["color_mustit"];
		}
	}
	
	var init = function() {
		getColorList(processMustit, processPantone);
	}
	
	var colorList = [];
	var mustitList = {};
	var pantoneList = {};
	var colorMap = {
		"gold" : "ffd700"
		, "grey" : "808080"
		, "green" : "8000"
		, "navy": "0b1a72"
		, "nude" : "e5b292"
		, "red" : "ff0000"
		, "burgundy" : "8a243a"
		, "beige" : "ad9073"
		, "brown" : "5f3914"
		, "black" : "000000"
		, "blue" : "1432e8"
		, "silver" : "c0c0c0"
		, "ivory" : "f5f5dc"
		, "yellow" : "ffff00"
		, "orange" : "ffa500"
		, "purple" : "800080"
		, "pink" : "ffc0cb"
		, "white" : "ffffff"
	}
	
	init();
}

var color = new colorMatching();
// color.printColorList();
// color.printColorList("M");
// color.printColorList("P");
// console.log( color.pickColorM("black") );
// console.log( color.pickColorP("abbey-stone") );


// var hits = null;
// $.ajax ({
	// type : 'GET',
	// url : '/es/search/aggrs',
	// data : {
		// "header" : "M",
		// "category0" : "탑",
		// "category1" : "티셔츠"
	// },
	// dataType : 'json',
	// async : false,
	// success : function(data) {
		// var dd = JSON.parse(data);
		// //console.log(dd);
		// hits = dd.aggregations.color.buckets;
	// }
// });
// console.log(hits);
// console.log(color.convert(hits));