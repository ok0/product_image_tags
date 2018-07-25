var _express = require('express');
var _router = _express.Router();

var data = '';

_router.get('/', function(req, res) {
	var qs = req.query;
	console.log(qs);
	
	var first_number;
	if(qs != '') {
		first_number = 0;
	} else {
		first_number = 1;
	}
	
	// 옴니어스poc 속성
	var omnious_arr = {
		'length' : '길이',
		'sleevLength' : '소매길이',
		'material' : '소재',
		'print' : '프린트',
		'detail' : '디테일',
		'style' : '스타일',
		'color' : '색상'
	}
	
	// 색상 리스트
	var color_arr = {
		'gold' : 'ffd700', 
		'gray' : '808080',
		'green' : '8000',
		'navy': '0b1a72', 
		'nude' : 'e5b292', 
		'red' : 'ff0000', 
		'burgundy' : '8a243a', 
		'beige' : 'ad9073', 
		'brown' : '5f3914', 
		'black' : '000000', 
		'blue' : '1432e8', 
		'silver' : 'c0c0c0', 
		'ivory' : 'f5f5dc', 
		'yellow' : 'ffff00',
		'orange' : 'ffa500',
		'purple' : '800080',
		'pink' : 'ffc0cb',
		'white' : 'ffffff'
	}
	
	data = {
		attr : omnious_arr,
		userdata : qs,
		first_num : first_number
	}
	
	res.render('main_v', data);
});

_router.get("/colorList", function( req, res ) {
	var _mysql = require('../database/mysql');
	_mysql.getColorList( function(err, result){
		if( err ) {
			res.status(500).send(err);
		} else {
			res.status(200).send(result);
		}
	});
});

_router.get("/brandList", function( req, res) {
	var _mysql = require("../database/mysql");
	_mysql.getBrandList( function(err, result) {
		if( err ) {
			res.status(500).send(err);
		} else {
			res.status(200).json(result);
		}
	});
});

module.exports = _router;