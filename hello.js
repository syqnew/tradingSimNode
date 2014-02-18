var express = require('express');
var app = express();
var io = require('socket.io').listen(app);

app.listen(3000);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

app.get('/admin', function(req, res) {
    res.sendfile(__dirname + '/admin.html');
});

app.get('/trader', function(req, res) {
    res.sendfile(__dirname + '/trader.html');
});

io.sockets.on('connection', function (socket) {
    // make sure that a nickname is sent first before any requests can be taken 
    socket.on('set nickname', function (name) {
        socket.set('nickname', name, function () {
            // TODO: need to check that name hasn't been taken
            console.log(name);
            socket.emit('ready', name);
            
            // send message with event name 'news'
            socket.emit('news', { hello: 'world' });
        });
    });
    
    

});
