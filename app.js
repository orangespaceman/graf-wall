/*
 * Node graf
 *
 * $ node app.js
 *
 */
var express     = require('express'),
    server      = express.createServer(),
    io          = require("socket.io").listen(server,{"log level":0}),
    port        = process.env.PORT || process.env['app_port'] || 7004,
    connectCount= 0;

// serve static files, routes, etc
server.use(express.query());
server.use(express.static(__dirname + '/public'));
server.use(express.favicon(__dirname + '/public/_includes/img/fav.ico'));
server.listen(port);

// test over long-polling (disable websockets)
//io.set('transports', [ 'xhr-polling' ]);

// listen for socket.io connection
io.sockets.on('connection', function (socket) {

  connectCount++;
  socket.broadcast.emit('connectCount', connectCount);

  socket.on('disconnect', function() {
    connectCount--;
    socket.broadcast.emit('connectCount', connectCount);
  });

  socket.on('mouse', function (data) {
    socket.broadcast.emit('mouse', data);
  });
});