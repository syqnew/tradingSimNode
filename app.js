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

/**
 * Assumed that the time (in milliseconds) is granular enough to use as an id
 */
var marketBuyOrders = [];
var marketSellOrders = [];
// bid is limit buys
var limitBuyOrders = [];
// ask is limit asks
var limitSellOrders = [];
// Queue to stick the orders when they are first coming in, don't know if actually needed. 
var pendingOrders = [];

var sales = [];

io.sockets.on('connection', function (socket) {
    // trader
    // make sure that a nickname is sent first before any requests can be taken 
    socket.on('set nickname', function (obj) {
        socket.set('nickname', obj["email"], function () {
            // TODO: need to check that email hasn't been take
            // maybe assign the client an id?
            socket.emit('ready', obj["email"]);

            // client passed an order object 
            // put in order book
            socket.on('make order', function(obj) {
                // try to fulfill order from order book
                console.log(obj);

                // object looks like { time: 1394909156392, volume: '999', type: 'marketBuy', id: 'asdf'}

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
                    // sort 
                    limitBuyOrders.sort(bidSort);
                    handleLimitOrder(obj['type']);
                } else if ( obj['type'] === 'limitSell' ) {
                    limitSellOrders.push(obj);
                    // sort
                    limitSellOrders.sort(askSort);
                    handleLimitOrder(obj['type']);
                } 
                
                // transaction object
                // var transObject = {};

                // transObject['buyer'] = 'dummy';
                // transObject['seller'] = 'dummy';

                // transObject['last']='99';
                // transObject['low']='99';
                // transObject['high']='99';
                // transObject['bid']='99';
                // transObject['bidSize']='99';
                // transObject['ask']='99';
                // transObject['askSize']='99';
                // transObject['volume']='99';

                // don't really know how to handle the updating of current orders yet
                // transObject['buyerCurOrder'] = ['timestamp', 'the values for the updated order'];
                // transObject['sellerCurOrder'] = ['timestamp', 'the values for the updated order'];


                // // must calculate this on the client side
                // transObject['quantity']='99';
                // transObject['crlTotal']='99';
                // transObject['cashTotal']='99';
                // transObject['total']='99';

                // send to all sockets
                // io.sockets.emit('update', {marketbuys: marketBuyOrders, marketsells: marketSellOrders, limitbuys: limitBuyOrders, limitsells: limitSellOrders, sale: sales});
                
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
        matchMarketOrders(limitSellOrders, marketBuyOrders, false, sendToClients);

    } else if ( marketType === 'marketSell') {
        // match with limit buys
        matchMarketOrders(limitBuyOrders, marketSellOrders, true, sendToClients);
    }
}

function handleLimitOrder(limitType) {
    // check if this limit order matches any other limit order
    if ( limitType === 'limitBuy' ) {
        // match with MarketSells
        matchMarketOrders(marketSellOrders, limitBuyOrders, true, sendToClients);
        // match limitSells
        matchLimitOrders(limitBuyOrders, limitSellOrders, false, sendToClients);
    } else if ( limitType === 'limitSell') {
        // match with MarketBuys
        matchMarketOrders(marketBuyOrders, limitSellOrders, false, sendToClients);
        // match with limitBuys
        matchLimitOrders(limitBuyOrders, limitSellOrders, true, sendToClients);
    }

}

//
// I might want to do an object wrapper around the orders... 
//

/**
 * Market Orders are by ascending time and limit orders by price
 */
function matchMarketOrders(marketOrdersList, limitOrdersList, sellAtMarketPrice, callback) {
    // cannot match if either one of the lists are empty
    if ( marketOrdersList.length === 0 || limitOrdersList.length === 0) return;

    // first get the order to be matched
    var firstAtMarket = marketOrdersList[0];
    

    while ( firstAtMarket['unfulfilled'] != 0 && limitOrdersList.length > 0 ) { 
        var bestAtPrice = limitOrdersList[0];

        var price = bestAtPrice['price'];
        var amountAtMarket = firstAtMarket['unfulfilled'];
        var amountAtPrice = bestAtPrice['unfulfilled'];
        var amount;
        if ( amountAtMarket > amountAtPrice ) {
            amount = amountAtPrice;
            // if ( limitOrdersList.length > 1 ) {
            //     // have to handle case where the market order is not fulfilled by the first limit order in list
            //     var nextOrder = limitOrdersList[1];
            // }
        } else {
            amount = amountAtMarket;
        }

        var currentTime = firstAtMarket['time'];

        // fulfill the orders (altered in the original list also)
        bestAtPrice['unfulfilled'] -= amount;
        firstAtMarket['unfulfilled'] -= amount;
        console.log("FIRST AT MARKET")
        console.log(firstAtMarket);

        // Careful with this, might accidently remove order before sale. 
        // If order is empty, remove it
        if ( bestAtPrice['unfulfilled'] === 0 ) {
            limitOrdersList.shift();
        }
        if ( firstAtMarket['unfulfilled'] === 0) {
            marketOrdersList.shift();
        }

        // record the sale 
        var sale = {};
        sale['time'] = firstAtMarket['time'];
        if ( sellAtMarketPrice ) {
            sale['buyerId'] = bestAtPrice['id'];
            sale['sellerId'] = firstAtMarket['id'];
        } else {
            sale['buyerId'] = firstAtMarket['id'];
            sale['sellerId'] = bestAtPrice['id'];
        }
        sale['amount'] = amount;
        sale['price'] = price;
        sales.push(sale);

        // update object sent to all clients
        var updateObject = {};
        updateObject['time'] = firstAtMarket['time'];
        updateObject['volume'] = amount;
        updateObject['last'] = price;

        // create a quote/transaction 
        // update metadata

        firstAtMarket = marketOrdersList[0];

        

    }
    callback();
}

function sendToClients() {
    io.sockets.emit('update', {marketbuys: marketBuyOrders, marketsells: marketSellOrders, limitbuys: limitBuyOrders, limitsells: limitSellOrders, sale: sales});
}

/**
 * Match dem limit orders
 */
function matchLimitOrders(bidOrders, askOrders, sellInitiated, callback) {
    // make sure that lists are both nonempty
    if ( bidOrders.length === 0 || askOrders.length === 0 ) return;
        
    var bestBid = bidOrders[0];
    console.log("BID ORDERS: " + bidOrders.length);
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

    if ( bestBid['unfulfilled'] === 0 ) {
        bidOrders.shift();
    }
    if ( bestAsk['unfulfilled'] === 0 ) {
        askOrders.shift();
    }

    // record sale
    var sale = {};
    sale['time'] = time;
    sale['buyerId'] = bestBid['id'];
    sale['sellerId'] = bestAsk['id'];
    sale['amount'] = amount;
    sale['type'] = "limit matching";
    sale['price'] = price;
    sales.push(sale);

    // update metadata/transaction object
    // create quote

    callback();

}

// sort by descending price
function bidSort(obj1, obj2) {
    return obj2['price'] - obj1['price'];
}

// sort by ascending price
function askSort(obj1, obj2) {
    return obj1['price'] - obj2['price'];
}

// sort by ascending time
function marketOrderSort(obj1, obj2) {
    return obj1['time'] - obj2['time'];
}





