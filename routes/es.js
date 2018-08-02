var _express = require("express");
var _ES = require("./request/es")();
var _router = _express.Router();
var _searchProp = "search";
var _async = require("async");

function isset(val) {
	if( val == undefined || val == null ) {
		return false;
	} else {
		return true;
	}
}

var getSearchKey = function(search) {
	if( search == "header" ) {
		return "headerCategory";
	} else if( search == "category0" ) {
		return "categoryName";
	} else if( search == "category1" ) {
		return "product.name";
	} else if( search == "length" ) {
		return "shape.length.name";
	} else if( search == "sleeveLength" ) {
		return "shape.sleeveLength.name";
	} else if( search == "material" ) {
		return "material.name";
	} else if( search == "print" ) {
		return "print.name";
	} else if( search == "detail" ) {
		return "detail.name";
	} else if( search == "style" ) {
		return "look.style.name";
	} else if( search == "color" ) {
		return "color.name.keyword";
	} else {
		return search;
	}
}

var esCreateQuery = function(search, arr) {
	var rs = [];
	var searchKey = _searchProp+"."+getSearchKey(search);
	
	var pushArr = null;
	for( var cnt in arr ) {
		pushArr = {}; pushArr["match"] = {};
		pushArr["match"][searchKey] = arr[cnt];
		rs.push(pushArr);
	}
	
	return rs;
}

var esCreateHeaderArr = function( header ) {
	if( header == "M" ) {
		return ["M", "W,M"];
	} else if( header == "W" ) {
		return ["W", "W,M"];
	} else {
		return false;
	}
}

var getProductInformation = function(pNumber, callback) {
	var _mysql = require("../database/mysql");
	_mysql.getPorudctInformation(pNumber, function(err, result) {
		if( err ) {
			callback(err, null);
		} else {
			callback(null, result);
		}
	});
}

_router.get("/search/totalCount", function( req, res, next ) {
	_ES.getTotalCount(function (data){
		//res.status(200).send(data);
		res.status(200).json(data);
		//res.json(200, data);
	});
});

_router.get("/search/aggrs", function( req, res, next ) {
	var header = req.query.header;
	var category0 = req.query.category0;
	var category1 = req.query.category1;
	
	var esQuery = {
		"size" : 0
		, "aggs" : null
		, "query" : {
			"bool" : {
				"should" : []
				, "must" : []
			}
		}
	};
	
	var should = [];
	var shouldInMust = [];
	var must = [];
	if( isset(header) && isset(category0) && isset(category1) ) {
		var inner = esCreateQuery("header", esCreateHeaderArr(header)); shouldInMust.push(inner);
		var inner = esCreateQuery("category0", [category0]); shouldInMust.push(inner);
		var inner = esCreateQuery("category1", [category1]); shouldInMust.push(inner);
		
		esQuery["aggs"] = {
			"length" : {
				"terms" : {
					"field" : _searchProp+".shape.length.name"
					, "size" : 30
				}
			}
			, "sleeveLength" : {
				"terms" : {
					"field" : _searchProp+".shape.sleeveLength.name"
					, "size" : 30
				}
			}
			, "material" : {
				"terms" : {
					"field" : _searchProp+".material.name"
					, "size" : 50
				}
			}
			, "print" : {
				"terms" : {
					"field" : _searchProp+".print.name"
					, "size" : 60
				}
			}
			, "detail" : {
				"terms" : {
					"field" : _searchProp+".detail.name"
					, "size" : 90
				}
			}
			, "style" : {
				"terms" : {
					"field" : _searchProp+".look.style.name"
					, "size" : 50
				}
			}
			, "color":{
				"terms":{
					"field" : _searchProp+".color.name.keyword"
					, "size" : 3000
				}
			}
		};
	} else if( isset(header) && isset(category0) ) {
		var inner = esCreateQuery("header", esCreateHeaderArr(header)); shouldInMust.push(inner);
		var inner = esCreateQuery("category0", [category0]); shouldInMust.push(inner);
		
		esQuery["aggs"] = {
			"category1" : {
				"terms" : {
					"field" : _searchProp+"."+getSearchKey("category1")
					, "size" : 100
				}
			}
			, "brand" : {
				"terms" : {
					"field" : _searchProp+"."+getSearchKey("brand")
					, "size" : 2000
				}
			}
		};
		
	} else if( isset(header) ) {
		var inner = esCreateQuery("header", esCreateHeaderArr(header)); shouldInMust.push(inner);
		
		esQuery["aggs"] = {
			"category0" : {
				"terms" : {
					"field" : _searchProp+"."+getSearchKey("category0")
					, "size" : 20
				}
			}
			, "brand" : {
				"terms" : {
					"field" : _searchProp+"."+getSearchKey("brand")
					, "size" : 2000
				}
			}
		};
	}
	
	if( should.length == 0 ) {
		delete esQuery["query"]["bool"]["should"];
	} else {
		esQuery["query"]["bool"]["should"] = [];
		for( var idx in should ) {
			for( var idx2 in should[idx] ) {
				esQuery["query"]["bool"]["should"].push(should[idx]);
			}
		}
		//esQuery["query"]["bool"]["should"] = should;
	}
	
	if( must.length == 0 && shouldInMust.length == 0 ) {
		delete esQuery["query"]["bool"]["must"];
	} else {
		if( must.length > 0 ) {
			for( var idx in must ) {
				for( var idx2 in must[idx] ) {
					esQuery["query"]["bool"]["must"].push(must[idx][idx2]);
				}
			}
		}
		
		if( shouldInMust.length > 0 ) {
			for( var idx in shouldInMust ) {
				if( typeof shouldInMust[idx][0][0] === "undefined" ) {
					esQuery["query"]["bool"]["must"].push( {"bool" : { "should" : shouldInMust[idx]}} );
				} else {
					for( var idx2 in shouldInMust[idx] ) {
						esQuery["query"]["bool"]["must"].push( {"bool" : { "should" : shouldInMust[idx][idx2]}} );
					}
				}
			}
		}
	}
	
	//console.log( JSON.stringify(esQuery) );
	_ES.search(esQuery, function (data){
		//res.status(200).send(data);
		res.status(200).json(data);
		//res.json(200, data);
	});
});

_router.get("/search/list", function( req, res, next ) {
	var header = req.query.header;
	var category0 = req.query.category0;
	var category1 = req.query.category1;
	var brand = req.query.brand;
	var filters = req.query.filters;
	
	var size = req.query.size;
	var from = req.query.from;
	
	if( isset(size) === false ) {
		size = 100;
	}
	
	if( isset(from) === false ) {
		from = 0;
	}
	
	var esQuery = {
		"_source" : [_searchProp+".*", "extra.imgURL"]
		, "sort" : [{"_id" : {"order" : "desc"}}]
		, "from" : from
		, "size" : size
		, "query" : {
			"bool" : {
				"should" : []
				, "must" : []
			}
		}
	};
	var should = [];
	var shouldInMust = [];
	var must = [];
	if( isset(header) ) {
		var inner = esCreateQuery("header", esCreateHeaderArr(header));
		shouldInMust.push(inner);
		//should.push(inner);
	}
	
	if( isset(category0) ) {
		var inner = esCreateQuery("category0", category0);
		shouldInMust.push(inner);
		//must.push(inner);
	}
	
	if( isset(category1) ) {
		var inner = esCreateQuery("category1", category1);
		shouldInMust.push(inner);
		//must.push(inner);
	}
	
	if( isset(brand) ) {
		var inner = esCreateQuery("brand", brand);
		shouldInMust.push(inner);
		//must.push(inner);
	}
	
	if( isset(filters) ) {
		var inner = [];
		for( var key in filters ) {
			inner.push( esCreateQuery(key, filters[key]) );
		}
		
		shouldInMust.push(inner);
	}
	
	if( should.length == 0 ) {
		delete esQuery["query"]["bool"]["should"];
	} else {
		esQuery["query"]["bool"]["should"] = [];
		for( var idx in should ) {
			for( var idx2 in should[idx] ) {
				esQuery["query"]["bool"]["should"].push(should[idx]);
			}
		}
		//esQuery["query"]["bool"]["should"] = should;
	}
	
	if( must.length == 0 && shouldInMust.length == 0 ) {
		delete esQuery["query"]["bool"]["must"];
	} else {
		if( must.length > 0 ) {
			for( var idx in must ) {
				for( var idx2 in must[idx] ) {
					esQuery["query"]["bool"]["must"].push(must[idx][idx2]);
				}
			}
		}
		
		if( shouldInMust.length > 0 ) {
			for( var idx in shouldInMust ) {
				if( typeof shouldInMust[idx][0][0] === "undefined" ) {
					esQuery["query"]["bool"]["must"].push( {"bool" : { "should" : shouldInMust[idx]}} );
				} else {
					for( var idx2 in shouldInMust[idx] ) {
						esQuery["query"]["bool"]["must"].push( {"bool" : { "should" : shouldInMust[idx][idx2]}} );
					}
				}
			}
		}
	}
	
	//console.log( JSON.stringify(esQuery) );
	_ES.search(esQuery, function (data) {
		var parseData = JSON.parse(data);
		if( parseData.status != "500" ) {
			_async.eachOf(parseData.hits.hits
				,function(hit, idx, doneCallback) {
					getProductInformation(hit._id, function(err, inform) {
						if( !err && inform !== null ) {
							parseData["hits"]["hits"][idx]["_source"]["mustit"] = {
								name : inform.name
								, headerCategory : inform.headerCategory
								, category0 : inform.category0
								, category1 : inform.category1
								, category2 : inform.category2
								, error : inform.error
								, errorMsg : inform.errorMsg
							};
						} else {
							parseData.hits.hits[idx]._source.mustit = null;
						}
						
						doneCallback(null);
					});
				}
				, function(err) {
					if( err ) {
						res.status(500).send(JSON.stringify({}));
					} else {
						res.status(200).json(JSON.stringify(parseData));
					}
				}
			);
		} else {
			res.status(500).send(JSON.stringify({}));
		}
		
		//res.status(200).send(data);
		//res.status(200).json(data);
		//res.json(200, data);
	});
});

module.exports = _router;