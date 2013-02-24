/*
 * Node canvas bubbles controller
 *
 * $ node app.js
 *
 */
var express     = require('express'),
    server      = express.createServer(),
    io          = require("socket.io").listen(server),
    port        = process.env.PORT || process.env['app_port'] || 7004;

// serve static files, routes, etc
server.use(express.query());
server.use(express.static(__dirname + '/public'));
server.use(express.favicon(__dirname + '/public/_includes/img/fav.ico'));
server.listen(port);

// listen for socket.io connection
io.sockets.on('connection', function (socket) {
  socket.on('mouse', function (data) {
    socket.broadcast.emit('mouse', data);
  });
});