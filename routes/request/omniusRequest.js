var _request = require("request");
var _config = require("../../common/config");

module.exports = function( /* taggerType */ ) {
	function omniusRequest() {
		var OPTIONS = {
			"headers" : {
				"Content-Type": "application/json"
				, "Accept" : "application/json"
				, "Accept-Language" : "ko-kr"
				, "x-api-key" : _config.omnius.key
			}
			, "url" : _config.omnius.url
			, "body" : null
		};
			
		return {
			getTag : function( _imgURL, _contexts, _options, callback ) {
				var bodyArray = {};
				
				if( _imgURL !== undefined ) {
					bodyArray["image"] = {};
					bodyArray["image"]["type"] = "url";
					bodyArray["image"]["content"] = _imgURL;
					
					if( _contexts !== undefined ) {
						if( _contexts["gender"] == "women" || _contexts["gender"] == "men" ) {
							bodyArray["gender"] = _contexts["gender"];
						}
					}
					
					if( _options !== undefined ) {
						bodyArray["option"] = {};
						if( _options["maxColorSize"] !== undefined && _options["maxColorSize"] !== null ) {
							bodyArray["option"]["maxColorSize"] = _options["maxColorSize"];
						}
						if( _options["maxDetailSize"] !== undefined && _options["maxDetailSize"] !== null ) {
							bodyArray["option"]["maxDetailSize"] = _options["maxDetailSize"];
						}
						if( _options["maxLookSize"] !== undefined && _options["maxLookSize"] !== null ) {
							bodyArray["option"]["maxLookSize"] = _options["maxLookSize"];
						}
						if( _options["maxPrintSize"] !== undefined && _options["maxPrintSize"] !== null ) {
							bodyArray["option"]["maxPrintSize"] = _options["maxPrintSize"];
						}
						if( _options["maxMeterialSize"] !== undefined && _options["maxMeterialSize"] !== null ) {
							bodyArray["option"]["maxMeterialSize"] = _options["maxMeterialSize"];
						}
					}
					
					OPTIONS.body = JSON.stringify(bodyArray);
					_request.post(OPTIONS, function (err, res, result) {
						errorHandler(res.statusCode, callback, result);
					});
				} else {
					errorHandler(null, callback, null);
				}
			},
			
			/*
			 * 
			 * origin
			 * 
			 * categoryId	카테고리 고유 ID	Integer
			 * categoryName	카테고리 이름	String
			 * position	상품의 중심좌표 정보	Object
			 * product	상품의 세부 정보	Object
			 * shape	상품의 구조적 외형 정보	Object
			 * color	상품의 색상값	Array [Object]
			 * detail	상품의 디자인 세부사항	Array [Object]
			 * print	상품의 텍스쳐, 프린트패턴 정보	Array [Object]
			 * material	상품의 원단, 재료, 소재 정보	Array [Object]
			 * look	상품의 style, occasion 정보	Object
			 */
			setArray : function( product_info, arr, callback ) {
				if( arr["categoryId"] !== undefined ) {
					var resultArray = {
						"search" : {
							"headerCategory" : product_info["headerCategory"]
							, "brand" : product_info["brand"]
							, "categoryId" : arr["categoryId"]
							, "categoryName" : arr["categoryName"]
							, "position" : arr["position"]
							, "product" : arr["product"]
							, "shape" : arr["shape"]
							, "color" : null
							, "detail" : null
							, "print" : null
							, "material" : null
							, "look" : {
								"style" : null
								, "occasion" : null
							}
						}
						, "extra" : {
							"imgURL" : product_info["imgURL"]
							, "color" : null
							, "detail" : null
							, "print" : null
							, "material" : null
							, "look" : {
								"style" : null
								, "occasion" : null
							}
						}
					};
					
					
					var keyArr = ["color", "detail", "print", "material"];
					var key = null;
					for( var keyCnt = 0 ; keyCnt < keyArr.length ; keyCnt++ ) {
						key = keyArr[keyCnt];
						if( arr[key] !== undefined ) {
							for( var elementCnt = 0 ; elementCnt < arr[key].length ; elementCnt++ ) {
								if( elementCnt == 0 ) {
									resultArray["search"][key] = arr[key][elementCnt];
								} else {
									if( resultArray["extra"][key] == null ) {
										resultArray["extra"][key] = [];
									}
									resultArray["extra"][key].push(arr[key][elementCnt]);
								}
							}
						}
						
						if( resultArray["search"][key] == null ) {
							delete resultArray["search"][key];
						}
						
						if( resultArray["extra"][key] == null ) {
							delete resultArray["extra"][key];
						}
					}
					
					if( arr["look"] !== undefined ) {
						var keyArr = ["style", "occasion"];
						var key = null;
						for( var keyCnt = 0 ; keyCnt < keyArr.length ; keyCnt++ ) {
							key = keyArr[keyCnt];
							if( arr["look"][key] !== undefined ) {
								for( var elementCnt = 0 ; elementCnt < arr["look"][key].length ; elementCnt++ ) {
									if( elementCnt == 0 ) {
										resultArray["search"]["look"][key] = arr["look"][key][elementCnt];
									} else {
										if( resultArray["extra"]["look"][key] == null ) {
											resultArray["extra"]["look"][key] = [];
										}
										resultArray["extra"]["look"][key].push(arr["look"][key][elementCnt]);
									}
								}
							}
							
							if( resultArray["search"]["look"][key] == null ) {
								delete resultArray["search"]["look"][key];
							}
							
							if( resultArray["extra"]["look"][key] == null ) {
								delete resultArray["extra"]["look"][key];
							}
						}
					}
					
					callback(resultArray);
				} else {
					callback(false);
				}
			},
			
			putToElasticSearch : function (productInfo, tags, callback) {
				var OPTIONS = {
					headers: {
						"Content-Type": "application/json"
					}
					, url: _config.es.url+productInfo["number"]
					, body: JSON.stringify(tags)
				};
				
				//console.log(OPTIONS);
				_request.post(OPTIONS, function (err, res, result) {
					errorHandler(res.statusCode, callback, result);
				});
			}
		};
	}
	
	function errorHandler(statusCode, callback , data) {
		if( statusCode === 200 || statusCode == 201 || statusCode == 202 || statusCode == 204 || statusCode == 205 ) {
			callback(null, statusCode, JSON.parse(data));
		} else {
			callback("POST ERROR!", statusCode, JSON.parse(data));
		}
	}
	
	var _INSTANCE;
	if( _INSTANCE === undefined ) {
		_INSTANCE = new omniusRequest();
	}
	
	return _INSTANCE;
};