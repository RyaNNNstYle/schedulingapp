var http = require('http');
var router = require('./router');

var server = http.createServer(router.handleRequest);

server.listen(8000);