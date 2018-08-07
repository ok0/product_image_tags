//1.201.143.38

/* require */
var _express = require("express");
var _path = require("path");
var _bodyParser = require("body-parser");


/* router */
var _taggerClothing = require("./routes/clothing");
var _es = require("./routes/es");
var _demoMain = require("./routes/main");

/* other.. */
var _app = _express();
var _app2 = _express();

/* view engine */
_app.set('view engine', 'ejs');
_app.set('views', './views');

/*정적 파일경로*/
_app.use("/public", _express.static('public'));
_app.use("/modules", _express.static('node_modules'));

_app.use(_bodyParser.json());
_app.use(_bodyParser.urlencoded({extended: false}));
_app2.use(_bodyParser.json());
_app2.use(_bodyParser.urlencoded({extended: false}));

/* routes */
_app2.use("/clothing", _taggerClothing);
_app.use("/es", _es);
_app.use("/main", _demoMain);
_app.use("/", _demoMain);


/* LISTEN */
_app.listen(3000, function() {});
_app2.listen(3001, function() {});


module.exports = _app;
