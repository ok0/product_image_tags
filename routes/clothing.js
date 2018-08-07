require("date-utils");
var _express = require("express");
var _router = _express.Router();
var _async = require("async");

var _omniusCall = require("./request/omniusRequest")();
var _imageBasePath = "http://cdn.mustit.co.kr/lib/upload/product/";

_router.post("/url", function( req, res, next ) {
	var productInfo = req.body.productInfo;
	var options = {
		"maxColorSize" : 5
		, "maxDetailSize" : 5
		, "maxLookSize" : 5
		, "maxPrintSize" : 5
		, "maxMeterialSize" : 5
	};
	var contexts = { "gender" : null };
	
	if( productInfo !== undefined && productInfo != null && productInfo["number"] !== undefined && productInfo["number"] != null ) {
		if( productInfo["headerCategory"] == "W" ) {
			contexts["gender"] = "women";
		} else {
			contexts["gender"] = "men";
		}
		
		_omniusCall.getTag(_imageBasePath + productInfo["imgURL"], contexts, options, function(err, statusCode, tags) {
			if( err ) {
				console.log("erro - getTag" + statusCode + " " + err);
			} else {
				_omniusCall.setArray(productInfo, tags.data[0], function(refinedTags) {
					_omniusCall.putToElasticSearch(productInfo, refinedTags, function(err, statusCode, data) {
						if( err ) {
							console.log(err + data);
						}
					});
				});
			}
		});
		
		res.status(200).send("");
	} else {
		console.log("Put product number!" + err);
		res.status(500).send("Put product number!");
	}
});

_router.post("/condition", function( req, res, next ) {
	var _mysql = require('../database/mysql');
	
	var condition = {
		"id" : req.body.query.id
		, "year" : req.body.query.year
		, "month" : req.body.query.month
		, "day" : req.body.query.day
		, "status" : req.body.query.status
		, "limit" : req.body.query.limit
		, "headerCategory" : req.body.query.headerCategory
		, "category" : req.body.query.category
		, "order" : req.body.query.order
	};
	_mysql.selectProduct(condition, function(err, result) {
		if( err ) {
			res.status(500).send("mysql error!");
			console.log("1 : ERROR !" + err);
		} else {
			var lastIdx = 0;
			_async.eachOfSeries( result,
				function(p, idx, doneCallback) {
					lastIdx = idx;
					console.log( new Date().toFormat("HH24:MI:SS") + " : " + result.length + " >> " + lastIdx);
					//setTimeout(function() {
						var productInfo = {
							"number" : p["number"]
							, "imgURL" : p["img1"]
							, "headerCategory" : p["header_category"]
							, "brand" : p["brand"]
						};
						var options = {
							"maxColorSize" : 5
							, "maxDetailSize" : 5
							, "maxLookSize" : 5
							, "maxPrintSize" : 5
							, "maxMeterialSize" : 5
						};
						var contexts = { "gender" : null };
						if( productInfo["headerCategory"] == "W" ) {
							contexts["gender"] = "women";
						} else {
							contexts["gender"] = "men";
						}
						
						_omniusCall.getTag(_imageBasePath + productInfo["imgURL"], contexts, options, function(err, statusCode, tags) {
							if( !err ) {
								_omniusCall.setArray(productInfo, tags.data[0], function(refinedTags){
									_omniusCall.putToElasticSearch(productInfo, refinedTags, function(err, statusCode, data) {
										if( err ) {
											doneCallback("3 : " + err + data);
										} else {
											_mysql.putTaggingLog(p["number"], "", function(logErr, logRes) {
												if( logErr ) {
													doneCallback(logErr);
												} else {
													doneCallback(null);
												}
											});
										}
									});
								});
							} else {
								_mysql.putTaggingLog(p["number"], tags.code, function(logErr, logRes) {
									if( tags.code == "INTERNAL_ERROR"
										|| tags.code == "UNKNOWN_ERROR"
										|| tags.code == "INVALID_API_KEY"
										|| tags.code == "THROTTLED"
										|| tags.code == "QUOTA_EXCEEDED"
									) {
										doneCallback(tags.code);
									} else {
										doneCallback(null);
									}
									
									/*
									if( logErr ) {
										doneCallback(logErr);
									} else {
										doneCallback(null);
									}
									*/
								});
							}
						});
					//}, 0);
				}
				, function (err) {
					if( err ) {
						/*
						res.status(500).json({
							"lastIdx" : lastIdx
							, "msg" : err
						});
						*/
						console.log("_async : " + err);
					} else {
						/*
						res.status(200).json({
							"lastIdx" : lastIdx
							, "msg" : null
						});
						*/
						console.log("_async : success");
					}
				}
			);
			
			// 일단 response 보내자.
			res.status(200).send();
		}
	});
});

module.exports = _router;
