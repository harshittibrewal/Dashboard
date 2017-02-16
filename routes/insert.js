var express = require('express');
var router = express.Router();

router.get('/get', function(req, res, next) {
	var mysql = require("mysql");
	//var id = req.query.id;
	var con = mysql.createConnection({
		host : 'localhost',
		user : 'root',
		password : '',
		database : 'dawnstar'
	});
	console.log("hello");
	con.connect(function(err){
		if(err){
			console.log("error connecting to database");
			return;
		}
		console.log("connection Established");
	});


});