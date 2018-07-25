/**
 * @author jonghun Yoon(https://github.com/ok0/javascript-pagination)
 */
var Pagination = function() {
	var config = {
		"outerElement" : "div"
		, "outerElementClass" : "outerClass"
		
		, "parentElement" : "ul"
		, "parentElementClass" : "parentClass"
		
		, "buttonElement" : "li"
		, "buttonClass" : "buttonClass"
		
		, "prevButtonElement" : "li"
		, "prevButtonClass" : "prevButtonClass"
		, "prevButtonText" : "&lt;"
		
		, "nextButtonElement" : "li"
		, "nextButtonClass" : "nextButtonClass"
		, "nextButtonText" : "&gt;"
	
		, "firstButtonElement" : "li"
		, "firstButtonClass" : "firstButtonClass"
		, "firstButtonText" : "&lt;&lt;"
		
		, "lastButtonElement" : "li"
		, "lastButtonClass" : "lastButtonClass"
		, "lastButtonText" : "&gt;&gt;"
		
		, "currentButtonClass" : "currentButtonClass"
		
		, "perPage" : 40
		, "totalCount" : null
		, "currentCount" : 0
		, "pageBlockSize" : 10
	};
	
	var lastPageNumber = null;
	var currentPageNumber = null;
	var next = null;
	
	this.init = function(paramConfig, nextEvent) {
		Object.keys(paramConfig).map(function(key) {
			if( typeof config[key] !== undefined ) {
				config[key] = paramConfig[key];
			}
		});
		
		next = nextEvent;
		setPageNumber();
	}
	
	// this is function name that will be called.
	this.get = function(next) {
		var result = "";
		var front = "";
		var post = "";
		var middle = "";
		var startNumber = null;
		var endNumber = null;
		
		if( lastPageNumber > 1 ) {
			if( lastPageNumber > config["pageBlockSize"] ) {
				var dvBlockSize = Math.ceil(config["pageBlockSize"] / 2);
				//console.log("dvBlockSize : " + dvBlockSize);
				//console.log("currentPageNumber : " + currentPageNumber);
				//console.log("lastPageNumber : " + lastPageNumber);
				
				startNumber = currentPageNumber - dvBlockSize;
				endNumber = currentPageNumber + dvBlockSize;
				var extraNumber = -1;
				if( startNumber < 1 ) {
					extraNumber = (startNumber * -1);
					startNumber = 1;
				}
				
				var extraNumber2 = 0;
				if( endNumber > lastPageNumber ) {
					extraNumber2 = endNumber - lastPageNumber - 1;
					endNumber = lastPageNumber;
				} else {
					endNumber += extraNumber;
				}

				startNumber -= extraNumber2;

				//console.log("startNumber : " + startNumber);
				//console.log("endNumber : " + endNumber);
				if( startNumber != 1 ) {
					front = getSideButton("first")
						+ getSideButton("prev");
				}

				if( endNumber != lastPageNumber ) {
					post = getSideButton("next")
						+ getSideButton("last");
				}
				middle = getMiddleButton(startNumber, endNumber);
				result = front + middle + post;
			} else {
				result += getMiddleButton(1, lastPageNumber);
			}
		}
		
		var paginationText = "";
		paginationText = "<"+config["outerElement"];
		if( isset(config["outerElementClass"]) ) {
			paginationText += " class='"+config["outerElementClass"]+"'>";
		} else {
			paginationText += ">";
		}
		
		paginationText += "<"+config["parentElement"];
		if( isset(config["parentElementClass"]) ) {
			paginationText += " class='"+config["parentElementClass"]+"'>";
		} else {
			paginationText += ">";
		}
		
		paginationText += result;
			+ "</"+config["parentElement"]+">"
			+ "</"+config["outerElement"]+">";
		
		return paginationText;
	}
	
	var getSideButton = function(buttonKey) {
		var purposeCount = null;
		if( buttonKey == "next" ) {
			purposeCount = config["currentCount"] + (config["perPage"]*config["pageBlockSize"]);
			var ableLastCount = config["totalCount"] - config["perPage"];
			if( purposeCount > ableLastCount ) {
				purposeCount = ableLastCount;
			}
		} else if( buttonKey == "prev" ) {
			purposeCount = config["currentCount"] - (config["perPage"]*config["pageBlockSize"]);
			if( purposeCount < 0 ) {
				purposeCount = 0;
			}
		} else if( buttonKey == "first" ) {
			purposeCount = 0;
		} else if( buttonKey == "last" ) {
			purposeCount = (config["totalCount"] - config["perPage"])
		}
		
		return "<"+config[buttonKey+"ButtonElement"]
			+ getInnerClass(buttonKey)
			+ " onClick='"+next+"("+config["totalCount"]+", "+config["perPage"]+", "+purposeCount+")'"+">"
			+ config[buttonKey+"ButtonText"]
			+ "</"+config[buttonKey+"ButtonElement"]+">";
	}
	
	var isCurrent = function(target) {
		if( currentPageNumber === target ) {
			return true;
		} else {
			return false;
		}
	}
	
	var getMiddleButton = function(start, end) {
		var result = "";
		var middleButtonClass = getInnerClass("");
		for( ; start <= end ; start++ ) {
			
			result += "<"+config["buttonElement"];
			
			if( isCurrent(start) ) {
				result += getInnerClass("current");
			} else {
				result += middleButtonClass;
			}
			
			result += " onClick='"+next+"("+config["totalCount"]+", "+config["perPage"]+", "+((start-1) * config["perPage"])+")'"+">"
				+ start
				+ "</"+config["buttonElement"]+">";
		}
		
		return result;
	}
	
	var setPageNumber = function() {
		if( config["perpage"] == 0 ) {
			currentPageNumber = 1;
		} else {
			currentPageNumber = Math.ceil(config["currentCount"] / config["perPage"]) + 1;
		}
		
		lastPageNumber = Math.ceil(config["totalCount"] / config["perPage"]);
	}
	
	var getInnerClass = function(configKey) {
		if( configKey === "" ) {
			if( isset(config["buttonClass"]) && config["buttonClass"] != "" ) {
				return " class='"+config["buttonClass"]+"'";
			} else {
				return "";
			}
		} else if( isset(config[configKey+"ButtonClass"]) && config[configKey+"ButtonClass"] != "" ) {
			return " class='"+config[configKey+"ButtonClass"]+"'";
		} else {
			return "";
		}
	}
	
	this.getConfig = function() {
		return config;
	}
	
	var isset = function(chk) {
		if( typeof chk !== undefined && typeof chk !== null ) {
			return true;
		} else {
			return false;
		}
	}
}
