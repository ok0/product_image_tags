// 3자리수 콤마 추가.
function commify(n) {
	var reg = /(^[+-]?\d+)(\d{3})/;
	n += "";
	
	while( reg.test(n) ) {
		n = n.replace(reg, "$1" + "," + "$2");
	}
	
	return n;
}