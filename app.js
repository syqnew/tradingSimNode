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
var admin = require('./routes/admin');
var trader = require('./routes/trader');
// var start = require('./routes/start');

app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.static(path.join(__dirname, 'templates')));

app.get('/', routes.index);
app.get('/trader', trader.trade);
app.get('/admin', admin.admin);

var marketBuyOrders = [];
var marketSellOrders = [];
var limitBuyOrders = [];
var limitSellOrders = [];
// Queue to stick the orders when they are first coming in, don't know if actually needed. 
var pendingOrders = [];

io.sockets.on('connection', function (socket) {
    // trader
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
                console.log(obj);

                // object looks like { time: 1394909156392, volume: '999', type: 'marketBuy' }

                // Handle Market Orders
                if ( obj['type'] === 'marketBuy' ) {
                    marketBuyOrders.push(obj);
                    handleMarketOrder(obj['type']);
                } else if ( obj['type'] === 'marketSell' ) {
                    marketSellOrders.push(obj);
                    handleMarketOrder(obj['type']);
                } 
                // Handle Limit Orders
                else if ( obj['type'] === 'limitBuy' ) {
                    limitBuyOrders.push(obj);
                    handleLimitOrder(obj['type']);
                } else if ( obj['type'] === 'limitSell' ) {
                    limitSellOrders.push(obj);
                    handleLimitOrder(obj['type']);
                } 
                
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

                // send to all sockets
                io.sockets.emit('update', transObject);
                
            });
        });
    });


    // admin
    socket.on('admin', function(obj) {

        socket.emit('admin ready', {ready: true});

        socket.on('open market', function(obj) {
            socket.broadcast.emit('open market', obj);
        });

        socket.on('close market', function(obj) {
            socket.broadcast.emit('close market', obj);
        });
    });
});

function handleMarketOrder(marketType) {
    // check if this limit order matches any other market order
    if ( marketType === 'marketBuy' ) {
        // match with limit sells

    } else if ( marketType === 'marketSell') {
        // match with limit buys
    }
}

function handleLimitOrder(limitType) {
    // check if this limit order matches any other limit order
    if ( limitType === 'limitBuy' ) {
        // match with limitSells

    } else if ( limitType === 'limitSell') {
        // match with limitBuys

    }

}

//
// I might want to do an object wrapper around the orders... 
//

/**
 * Market Orders are by ascending time and limit orders by price
 */
function matchMarketOrders(marketOrdersList, limitOrdersList, sellAtMarketPrice) {
    // cannot match if either one of the lists are empty
    if ( marketOrdersList.length === 0 || limitOrdersList.length === 0) return;

    // first get the order to be matched
    var firstAtMarket = marketOrdersList[0];
    var bestAtPrice = limitOrdersList[0];

    var price = bestAtPrice['price'];
    var amount = firstAtMarket['unfulfilled'];
    var amountAtPrice = bestAtPrice['unfulfilled'];
    if ( amount > amountAtPrice ) {
        amount = amountAtPrice;
        if ( limitOrdersList.length > 1 ) {
            var nextOrder = limitOrdersList[1];
        }
    }

    var currentTime = firstAtMarket['time'];

    // fulfill the orders (altered in the original list also)
    bestAtPrice['unfulfilled'] -= amount;
    firstAtMarket['unfulfilled'] -= amount;

    // record the sale
    // create a quote
    // update metadata
}

/**
 * 
 */
function matchLimitOrders(bidOrders, askOrders, sellInitiated) {
    // make sure that lists are both nonempty
    if ( bidOrders.length === 0 || askOrders.length === 0 ) return;
        
    var bestBid = bidOrders[0];
    var bestAsk = askOrders[0];

    var bidPrice = bidOrders['price'];
    var askPrice = askOrders['price'];

    if ( bidPrice != askPrice ) return;

    var price;
    var time;
    if (sellInitiated) {
        price = bidPrice;
        time = bestBid['time'];
    } else {
        price = askPrice;
        time = bestAsk['time'];
    }

    var amount = bestBid['unfulfilled'];
    var amountAsk = bestAsk['unfulfilled'];
    if ( amount > amountAsk ) {
        amount = amountAsk;
        if ( askOrders.length > 1 ) {
            var nextAsk = askOrders[1];
        }
    } else {
        if ( amount < amountAsk) {
            if (bidOrders.length > 1) {
                var nextBid = bidOrders[1];
            }
        } else {
            if (bidOrders.length > 1) {
                var nextBid = bidOrders[1];
            }
            if ( askOrders.length > 1 ) {
                var nextAsk = askOrders[1];
            }
        }
    }
    
    // fulfill the orders
    bestBid['unfulfilled'] -= amount;
    bestAsk['unfulfilled'] -= amount;

    // record sale
    // update metadata
    // create quote

}






