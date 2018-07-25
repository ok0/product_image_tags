var _request = require("request");
var _config = require("../../common/config");

module.exports = function() {
	
	function es() {
		
		var ES = {};
		var OPTIONS = {};
		
		function _initES() {
			ES = {
				"addr" : _config.es.baseUrl
				, "index" : _config.es.baseIndex
				, "document" : _config.es.baseDocument
			};
		}
		
		function _initOPTIONS() {
			OPTIONS = {
				"headers" : {
					"Content-Type": "application/json"
					, "Accept" : "application/json"
					, "Accept-Language" : "ko-kr"
					, "x-api-key" : _config.omnius.key
				}
				, "url" : ES["addr"] + "/" + ES["index"] + "/" + ES["document"]
				, "body" : null
			}
		}
		
		function errorHandler(statusCode, callback , data) {
			callback(data);
		}
		
		return {
			search : function (query, callback) {
				_initES();
				_initOPTIONS();
				
				OPTIONS["url"] += "/" + "_search";
				OPTIONS["body"] = JSON.stringify(query);
				_request.get(OPTIONS, function(err, res, result) {
					errorHandler(res.statusCode, callback, result);
				});
			}
			
			, getTotalCount : function(callback) {
				_initES();
				_initOPTIONS();
				OPTIONS["url"] += "/_count";
				OPTIONS["body"] = "";
				
				_request.get(OPTIONS, function(err, res, result) {
					errorHandler(res.statusCode, callback, result);
				});
			}
		}
	}
	
	var _INSTANCE;
	if( _INSTANCE === undefined ) {
		_INSTANCE = new es();
	}
	
	return _INSTANCE;
};