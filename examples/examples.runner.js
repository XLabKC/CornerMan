var async = require('async');
var coffee = require('coffee-script');
var express = require('express');
var fs = require('fs');
var http = require('http');
var Mincer = require('mincer');
var path = require('path');
var url = require('url');

var environment = new Mincer.Environment();
environment.appendPath(path.join(__dirname, '../src'));
environment.appendPath(__dirname);

var app = express();
app.use(Mincer.createServer(environment));


// app.get('*', function (req, res, next) {
//    var pathName = url.parse(req.url).pathname;
//    res.setHeader('Content-Type', 'application/javascript');
//    try {
//       var asset = environment.findAsset(pathName.substring(1));   
//       res.send(asset.toString());
//    } catch (e) {
//       res.send(e.toString());
//    }
// });

var port = 8081;
http.createServer(app).listen(port, function () {
   console.log('Started example server on port ' + port);
});
