var express = require('express')
  , app = express()
  , http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server)
  , path = require('path');

app.listen(3000);

var routes = require('./routes');
var path = require('path');
var index = require('./routes/index');
// var admin = require('./routes/admin');
// var trader = require('./routes/trader');
// var start = require('./routes/start');

app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', routes.index);

// app.get('/', function(req, res) {
//   res.sendfile(__dirname + '/routes/index.html');
// });

// app.get('/admin', function(req, res) {
//     res.sendfile(__dirname + '/routes/admin.html');
// });

// app.get('/trader', function(req, res) {
//     res.sendfile(__dirname + '/routes/trader.html');
// });


io.sockets.on('connection', function (socket) {
    // make sure that a nickname is sent first before any requests can be taken 
    socket.on('set nickname', function (obj) {
        console.log(obj);
        socket.set('nickname', obj["name"], function () {
            // TODO: need to check that name hasn't been taken
            console.log(obj["name"]);
            socket.emit('ready', name);
            
            // send message with event name 'news'
            socket.emit('news', { hello: 'world' });
        });
    });
    
    

});
