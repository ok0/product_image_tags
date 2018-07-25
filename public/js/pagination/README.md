###### https://github.com/ok0/javascript-pagination
# javascript simple pagaination.

<pre>
<code>
<script type="text/javascript">
function blar(totalCount, perPage, currentCount) {
	var pConfig = {
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
		
		, "perPage" : perPage // object count per page.
		, "totalCount" : totalCount
		, "currentCount" : currentCount // ( pgae 1 = 0, page 2 = perPage * 1, page 3 = perPage * 2)
		, "pageBlockSize" : 10 // button length. ( 5 = 1 2 3 4 5, 10 = 1 2 3 4 5 ... 10 )
	};
	var p = new Pagination();
	
	// param 2 : this is function name that will be called.
	p.init(pConfig, "blar");
	
	document.getElementById("pArea").innerHTML = p.get();
}

blar(3000, 30, 2910);
</script>
</code>
</pre>
