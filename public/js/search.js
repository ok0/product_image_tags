/*
 * 
 * to 유지호
 * 
 * 상단 검색 조건 리스트 불러오기
 * REQUEST
 * METHOD : GET
 * URL : /es/search/aggrs
 * Content-Type : application/x-www-form-urlencoded
 * BODY :
 * {
 * 	"header" : "W", "M"	>> header만 보낼경우 category0의 리스트 return
 * , "category0" : ""	>> header && category0을 보낼경우 category1, brand return
 * , "category1" : ""	>> header && category0 && category1을 보낼경우 [length, sleevLength, material, print, detail, style] return
 * }
 * RESPONSE
 * application/json
 * 
 * 
 * 
 * 하단 검색 결과 리스트 불러오기
 * REQUEST
 * METHOD : GET
 * URL : /es/search/list
 * Content-Type : application/x-www-form-urlencoded
 * BODY :
 * {
 * 	"header" : 	"W", "M"	>> header만 보낼경우 category0의 리스트 return
 * , "category0" : []	>> (OR) header && category0을 보낼경우 category1, brand return
 * , "category1" : []	>> (OR) header && category0 && category1을 보낼경우 [length, sleevLength, material, print, detail, style] return
 * , "filters" : {		>> (OR) AND (OR) AND (OR)
 * 		"..." : []
 * 		, "..." : []
 * 		, "..." : []
 * 	}
 * }
 * RESPONSE
 * application/json
 * 
 * 
 * */

/********** 화면 처리 js **********/
var finalId = 0; //전체 속성리스트와 하단 선택 속성리스트 중 동일한 값을 매칭시키기 위한 id값 (삭제기능에 사용 됨)

//카테고리 및 속성 (텍스트) 선택 시 (선택, 취소 모두 포함)
function choice_detail(dThis, depth) {
	
	var	this_key = $(dThis).attr('data-key');
	var	this_value = $(dThis).attr('data-value');
	
	if(!$(dThis).hasClass("on")) {
		$(dThis).addClass("on");
		
		if ($(dThis).attr('data-key').indexOf('brand') == -1) {
			$(dThis).parent().siblings().find(".choice_detail").removeClass("on");
		}
		
		if($(dThis).hasClass('cate_class')) {
			if($(dThis).attr('data-key') == 'category1') {
				$(dThis).attr("data-id", finalId);
				
				$("#searchFinal").find(".cate_class").parent("li").remove();	
				final_list(dThis);	
			}
		} else {
			var target = $('#searchFinal').find('li');
			$(dThis).attr("data-id", finalId);
			for(var i=0; i<target.length; i++) {
				if(target.eq(i).find('span').attr('data-key') == this_key && target.eq(i).find('span').attr('data-key').indexOf('brand') == -1) {
					target.eq(i).remove();
				}
			}
			final_list(dThis);	
		}
		
		filter_process(dThis, depth);
	} else {
		final_list_remove($(dThis).attr("data-id"));
		$(dThis).removeClass("on");
		
		remove_filter(dThis, depth);
	}
	
	if(depth != 'overlap') {
		var target = $('#searchFinal').find('li');
		
		if(depth == 'dt') {
			for(var i=0; i<target.length; i++) {
				if(target.eq(i).find('span').attr('data-key') != 'category1' && target.eq(i).find('span').attr('data-key').indexOf('brand') == -1) {
					target.eq(i).remove();
				}
			}
		} else {
			$('#searchFinal').html('');
		}
	}
}

//색상 선택 시 (선택, 취소 모두 포함)
function choice_color(cThis, depth) {
	
	var color_keyword = $(cThis).attr('id');
		
	if(!$(cThis).hasClass("on")) {
		$(cThis).addClass("on");
		$(cThis).parent().siblings().find(".color_detail").removeClass("on");
		$(cThis).attr("data-id", finalId);
		var target = $('#searchFinal').find('li');
		for(var i=0; i<target.length; i++) {
			if(target.eq(i).find('span').hasClass("color_detail")) {
				target.eq(i).remove();
			}
		}
		final_list(cThis);
		
		filter_process(cThis, depth);
	} else {
		final_list_remove($(cThis).attr("data-id"));
		$(cThis).removeClass("on");
		
		remove_filter(cThis, depth);
	}
}

// 사용자가 선택 한 속성들을 나열 함.
function final_list(element) {
	var html = '';
	html += '<li>';
	html += element.outerHTML;
	html += '</li>';
	
	$("#searchFinal").append(html);
	finalId++;
}

// 사용자 선택 리스트에서 x를 눌렀을 때.
function final_list_remove(idNum) {
	//console.log(idNum);
	$(".choice_category").find('span[data-id='+idNum+']').removeClass("on");
	$('#searchFinal').find('span[data-id='+idNum+']').parent('li').remove();
	
}


/********** data처리 js **********/

var exception = 'OFF'; // 예외적인 상황에서 ON으로 변경하여 사용한다. 사용이끝나면 OFF로 꼭 되돌린다.

var filter = new Object(); // 사용자가 선택한 전체 속성을 담는 곳
var filters = new Object(); // 상세속성 담는 곳
var brand_arr = new Array(); // 선택한 브랜드 담는 곳
var filter_arr = undefined; // 상세속성 각 항목 별로 배열을 선언해 값을 넣는다.

// 선택한 속성을 객체(filter)에 넣는다.
var colorCount = 0;
function filter_process(fThis, depth) {
	var f_key = $(fThis).attr('data-key');
	var f_value = $(fThis).attr('data-value');
	
	if(f_key == 'header' || f_key == 'category0' || f_key == 'category1') {
		filter[f_key] = f_value;
	} else if (f_key == 'color') {
		filter_arr = new Array();
		var findColor = color.pickColorM(f_value);
		
		for(var i=0; i<findColor.length; i++) {
			filter_arr.push(findColor[i]);
		}
		filters[f_key] = filter_arr;
		filter['filters'] = filters;
	} else if (f_key == 'brand') {
		brand_arr.push(f_value);
		filter[f_key] = brand_arr;
	} else {
		filter_arr = new Array();
		filter_arr.push(f_value);
		filters[f_key] = filter_arr;
		
		filter['filters'] = filters;
	}
	
	view_category(depth);	
}

// 취소를 선택한 속성을 객체(filter)에서 삭제한다.
function remove_filter(fThis, depth) {
	var f_key = $(fThis).attr('data-key');
	var f_value = $(fThis).attr('data-value');
	
	if(f_key == 'header' || f_key == 'category0' || f_key == 'category1') {
		delete filter[f_key];
		
	} else if (f_key == 'brand') {
		brand_arr.splice(brand_arr.indexOf(f_value), 1);
		filter[f_key] = brand_arr;
		if(brand_arr.length == 0) {
			delete filter[f_key];
		}
	} else {
		delete filters[f_key];
		if(Object.keys(filters).length > 0) {
			filter['filters'] = filters;	
		} else {
			delete filter['filters'];
		}
	}
	
	if (depth != 'overlap') {
		switch (depth) {
			case 'dt' : 
				depth = 'S';
				exception = 'ON';
				break;
			case 'S' : 
				depth = 'M';
				break;
			case 'M' :
				$("#poc_attr").hide();
				$("#category_M").hide();
				$("#category_S").hide();
				$("#brand").hide();
				$(".txt_total").find("strong").text("0");
				$(".no_result").show();
				$("#resultProduct").html('');
				return false;
		}
	}
	view_category(depth);
}

// 선택을 취소한 색상의 유무를 파악하여 결과를 return 한다.
function check_cancel_color(pColor, mColor) {
	var check_list = color.pickColorM(mColor);
	//console.log(mColor);
	for (var i=0; i<check_list.length; i++) {
		if(pColor == check_list[i]) {
			return true;
		}
	}
	return false;
}

// 선택된 속성들을 정리하여 데이터를 요청한다(하위 카테고리 또는 상세속성)
function view_category(depth) {
	var re_data = new Object();

	if (depth == 'M') {
		$("#poc_attr").hide();
		$("#category_S").hide();
		$("#brand").hide();
		$(".txt_total").find("strong").text("0");
		$(".no_result").show();
		$("#resultProduct").html('');
		
		for (var i=0; i<Object.keys(filter).length; i++) {
			if (Object.keys(filter)[i].indexOf('header') != -1) {
				var obj_key = Object.keys(filter)[i];
				re_data[obj_key] = filter[obj_key];
			}
		}
		filter = re_data;
	} else if (depth == 'S') {
		$("#poc_attr").hide();
		
		for (var i=0; i<Object.keys(filter).length; i++) {
			if (Object.keys(filter)[i].indexOf('header') != -1 || Object.keys(filter)[i].indexOf('category0') != -1 || Object.keys(filter)[i].indexOf('brand') != -1) {
				if (exception != "ON" && Object.keys(filter)[i].indexOf('brand') != -1) {
					continue;
				}
				var obj_key = Object.keys(filter)[i];
				re_data[obj_key] = filter[obj_key];
			}
		}
		filter = re_data;
		view_detail_attr(filter, 'on', '');	
	} else if (depth == 'dt') {
		for (var i=0; i<Object.keys(filter).length; i++) {
			if (Object.keys(filter)[i].indexOf('header') != -1 || Object.keys(filter)[i].indexOf('category0') != -1 || Object.keys(filter)[i].indexOf('category1') != -1 || Object.keys(filter)[i].indexOf('brand') != -1) {
				var obj_key = Object.keys(filter)[i];
				re_data[obj_key] = filter[obj_key];
			}
		}
		filter = re_data;
		view_detail_attr(filter,'on' , '');
		$(".color_detail").removeClass('on');
	} else {
		view_detail_attr(filter, 'on' , '');
		return false;
	}

	console.log(filter);
	$.ajax ({
		type : 'GET',
		url : '/es/search/aggrs',
		dataType : 'json',
		data : filter,
		beforeSend : function() {
			$("#category_" + depth).find('.productCategory').html('');
			if(depth == 'S' && exception != 'ON') {
				$('#mainBrand').html('');
				$('#productBrand').find('.choice_list').html('');
			}
		},
		success : function(rs_data) {
			var result = JSON.parse(rs_data);
			//console.log(result);
			if(depth == 'M') {
				result = result.aggregations.category0.buckets;	
			} else if (depth == 'S') {
				var brand_list = result.aggregations.brand.buckets;
				result = result.aggregations.category1.buckets;
				
				if (exception != 'ON') {
					var brand_html = '';
					var max_main_brand = 8;
					
					if (brand_list.length > max_main_brand) {
						for (var b_key=max_main_brand; b_key<brand_list.length; b_key++) {
							brand_html += '<li>';
							brand_html += '<span class="choice_detail" data-key="brand" data-value="'+brand_list[b_key].key+'" onclick="choice_detail(this, \'overlap\');">'+getBrand.pickBrand(brand_list[b_key].key).eng+'</span>';
							brand_html += '</li>';
						}
						$('#productBrand').find('.choice_list').append(brand_html);
						$('#moreBrand').show();
					} else {
						max_main_brand = brand_list.length;
						$('#productBrand').hide();
						$('#moreBrand').hide();
					}
					
					brand_html = '';
					for (var b_key=0; b_key<max_main_brand; b_key++) {
						brand_html += '<li>';
						brand_html += '<span class="choice_detail" data-key="brand" data-value="'+brand_list[b_key].key+'" onclick="choice_detail(this, \'overlap\');">'+getBrand.pickBrand(brand_list[b_key].key).eng+'</span>';
						brand_html += '</li>';
					}
					$("#brand").show().find('#mainBrand').append(brand_html);
					
					if($('#productBrand').css("display") == "block") {
						$('#moreBrand').click();
					}
				}
				if(exception == 'ON') {
					exception = 'OFF';
				}	
			} else if (depth == 'dt') {
				result = result.aggregations;
			}
			
			
 			var html = '';
 			
			if(depth != 'dt') {
				for(var cate_key=0; cate_key<result.length; cate_key++) {
					html += '<li>';
					var next = null;
					var cate_num = null;
					if(depth == 'M') {
						next = 'S';
						cate_num = 0;
					} else if (depth == 'S') {
						next = 'dt';
						cate_num = 1;
					}
					html += '<span class="choice_detail cate_class" data-key="category'+cate_num+'" data-value="'+result[cate_key].key+'" onclick="choice_detail(this, \'' + next + '\');">'+result[cate_key].key+'</span>'
					html += '</li>';
				}
				$("#category_" + depth).show().find('.productCategory').append(html);	
			} else {
				next = 'overlap';
				for (var name in result) { 
					//console.log(name);
					$("#"+name).show().find("td .choice_list").empty();
					if ( name != 'color') {
						for (var i=0; i<result[name].buckets.length; i++) {
							html += '<li>';
							html += '<span class="choice_detail" data-key="'+name+'" data-value="'+result[name].buckets[i].key+'" onclick="choice_detail(this, \'' + next + '\');">'+result[name].buckets[i].key+'</span>'
							html += '</li>';
						}
					} else {
						//console.log(result[name].buckets);
						var colorList = color.convert(result[name].buckets);
						for (var i=0; i<Object.keys(colorList).length; i++) {
							//console.log(Object.keys(colorList)[i]);
							html += '<li>';
							html += '<span id="'+Object.keys(colorList)[i]+'" title="'+Object.keys(colorList)[i]+'" class="color_detail" data-key="color" data-value="'+Object.keys(colorList)[i]+'" onclick="choice_color(this, \'' + next + '\');"></span>';
							html += '</li>';
						}
					}
					if(result[name].buckets.length == 0) {
						$("#"+name).hide();
					}
					$("#"+name).find("td .choice_list").append(html);
					html = '';
				}
				$("#poc_attr").show();
			}
		}, 
		error : function(err) {
			console.log(err);
		}
	});
}

// 선택된 속성들을 정리하여 데이터를 요청한다(상품리스트)
function view_detail_attr(data, pag_switch, config) {
	var new_data = $.extend({}, data);
	
	for (var i=0; i<2; i++) {
		if (new_data['category'+i] == undefined) {
			continue;
		}	
		filter_arr = new Array();
		filter_arr.push(data['category'+i]);
		new_data['category'+i] = filter_arr;
	}
		
	var curCount = null;
	var perPage = null;
	var mColor = null;
	var pColor = null;
	
	if(config == '') {
		curCount = 0;
		perPage = 40;
	} else {
		curCount = config['currentCount'];
		perPage = config['perPage'];
	}
	
	new_data['size'] = perPage;
	new_data['from'] = curCount;

	console.log(new_data);
	$.ajax ({
		type : 'GET',
		url : '/es/search/list',
		dataType : 'json',
		data : new_data,
		beforeSend : function() {
			$("#resultProduct").html('');
		},
		success : function(data) {
			var result = JSON.parse(data);
			//console.log(result);
			var pd_total = result.hits.total;
			result = result.hits.hits;
			
			$(".txt_total").find("strong").text(pd_total);
			
			if (result.length == 0) {
				$(".no_result").show();
			} else {
				var product_html = '';
				for (var product_key=0; product_key<result.length; product_key++) {
					pColor = result[product_key]._source.search.color.name;
					mColor = color.pickColorP(pColor);
					
					product_html += '<li>';
					product_html += '<div class="box_product">';
					product_html += '<span class="product_image d_b" data-color-mustit="'+mColor+'" data-color-pantone="'+pColor+'">';
					product_html += '<img src="http://cdn.mustit.co.kr/lib/upload/product/'+result[product_key]._source.extra.imgURL+'/_dims_/resize/500x500/extent/500x500" alt="상품이미지" />';
					product_html += '<span class="product_mask" onClick=window.open(\'http://mustit.co.kr/product/product_detail/'+result[product_key]._id+'\');>';
					product_html += '<span class="d_b">상품번호 : '+result[product_key]._id+'</span>';
					product_html += '<span class="d_b">브랜드 : '+getBrand.pickBrand(result[product_key]._source.search.brand).eng+'</span>';
					//product_html += '<span class="d_b">카테고리 : '+result[product_key]._source.search.headerCategory+'</span>';
					product_html += '<span class="d_b">카테고리 : '+result[product_key]._source.search.headerCategory+' / '+result[product_key]._source.search.categoryName+' / '+result[product_key]._source.search.product.name+'</span>';
					product_html += '<span class="d_b">색상 : '+mColor+' ('+pColor+')</span>';
					product_html += '<span class="d_b">속성 : ';
					if( result[product_key]._source.search.shape.length ) {
						product_html += result[product_key]._source.search.shape.length.name + '/';
					}
					if( result[product_key]._source.search.shape.sleeveLength ) {
						product_html += result[product_key]._source.search.shape.sleeveLength.name + '/';
					}
					product_html += 	result[product_key]._source.search.material.name + '/';
					product_html += 	result[product_key]._source.search.print.name + '/';
					product_html += 	result[product_key]._source.search.detail.name + '/';
					product_html += 	result[product_key]._source.search.look.style.name;
					product_html += '</span>';
					product_html += '</span>';
					product_html += '</span>';
					product_html += '</div>';
					product_html += '</li>';
					//console.log(result[product_key]);
				}
				$(".no_result").hide();
				$("#resultProduct").append(product_html);
			}	
			
			//pagination >> on
			if(pag_switch == 'on') {
				$("#pArea").attr("data-switch", "1");
				setPage(pd_total, perPage, curCount);
			}
		},
		error : function(err) {
			console.log(err);
		}
	});
}

// 컬러리스트 출력
function view_color_list(data) {
	var colorList = color.convert(data);
	//console.log(colorList);
	var html = '';
	for (var i=0; i<colorList.length; i++) {
		html += '<li>';
		html += '<span class="color_detail" data-key="filters\[color\]\['+i+'\]" data-value="'+Object.keys(colorList)[i]+'" onclick="choice_color(this, \'overlap\');"></span>';
		html += '</li>';
	}
	$("#color").find("td .choice_list").append(html);
}

// function import_hidden(data) {
	// var user_attr = '';
	// for (var key in data) {
		// user_attr += '<input type="hidden" name="'+key+'" value="'+data[key]+'" />';
	// }
	// $("#userAttr").html('');
	// $("#userAttr").append(user_attr).submit();
// 	
	// //window.location.hash = $("#userAttr").serialize();
// }
