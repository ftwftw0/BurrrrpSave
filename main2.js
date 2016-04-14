//
// Web server configuration
//
'use strict';
// Core for NodeJs server to run
var http = require('http');
var path = require('path');
var express = require('express');
var app = express();
// FS is used to read files like controllers, views, etc.
var fs = require('fs');
// Load middlewares
var favicon = require('serve-favicon');		// Loads your website icon
// Load Socket.IO
var serv = http.Server(app);
var cons = require('consolidate');

// view engine setup
app.engine('html', cons.swig)
// --- some environment variables ---
app.set('port', 8081);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.set('view options', { layout: false });
app.use(favicon(__dirname + '/assets/images/favicon.png'));
app.use(express.static(path.join(__dirname, './assets/')));

// --- dynamically include routes (Controllers) ---
fs.readdirSync('./controllers').forEach(function (file) {
    if (file.substr(-3) == '.js') {
	var route = require('./controllers/' + file);
	route.controller(app);
    }
});

// --- makes the server listen on port previously set with app.set('port', 8081)
serv.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});


