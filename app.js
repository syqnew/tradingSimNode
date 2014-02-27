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
            // TODO: need to check that name hasn't been take
            // maybe assign the client an id?
            socket.emit('ready', obj["name"]);

            // client passed an order object 
            // put in order book
            socket.on('make order', function(obj) {
                // try to fulfill order from order book
                
                // transaction object
                var transObject = {};
                transObject['buyer'] = 'dummy';
                transObject['seller'] = 'dummy';
                transObject['buyerTrans'] = 'You bought';
                transObject['sellerTrans'] = 'You sold';
                transObject['buyerCurOrder'] = ['timestamp', 'the values for the updated order'];
                transObject['sellerCurOrder'] = ['timestamp', 'the values for the updated order'];
                transObject['last']='99';
                transObject['low']='99';
                transObject['high']='99';
                transObject['bid']='99';
                transObject['bidSize']='99';
                transObject['ask']='99';
                transObject['askSize']='99';
                transObject['volume']='99';
                // must calculate this on the client side
                transObject['quantity']='99';
                transObject['crlTotal']='99';
                transObject['cashTotal']='99';
                transObject['total']='99';
                console.log(obj);

                // send them to all except socket that initiated
                io.sockets.emit('update', transObject);
                
            });



            // send message with event name 'news'
            // socket.emit('news', { hello: 'world' });
        });
    });
});







