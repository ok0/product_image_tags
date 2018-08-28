var _express = require('express');
var _router = _express.Router();

var data = new Object();

// 옴니어스poc 속성
var omnious_arr = {
	'length' : '길이',
	'sleeveLength' : '소매길이',
	'material' : '소재',
	'print' : '프린트',
	'detail' : '디테일',
	'style' : '스타일',
	'color' : '색상'
};

_router.get('/', function(req, res) {
	data['attr'] = omnious_arr;
	res.render('main_v', data);
});

_router.get('/v2', function(req, res) {
	data['attr'] = omnious_arr;
	res.render('main_v2_v', data);
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