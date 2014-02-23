var express = require('express')
  , app = express()
  , http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server)
  , path = require('path');

server.listen(3000);

var routes = require('./routes');
var path = require('path');
var index = require('./routes/index');
// var admin = require('./routes/admin');
var trader = require('./routes/trader');
// var start = require('./routes/start');

app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.static(path.join(__dirname, 'templates')));

app.get('/', routes.index);
app.get('/trader', trader.trade);

io.sockets.on('connection', function (socket) {
    // make sure that a nickname is sent first before any requests can be taken 
    socket.on('set nickname', function (obj) {
        socket.set('nickname', obj["name"], function () {
            // TODO: need to check that name hasn't been taken
            socket.emit('ready', obj["name"]);
            
            // send message with event name 'news'
            // socket.emit('news', { hello: 'world' });
        });
    });
    
    

});
