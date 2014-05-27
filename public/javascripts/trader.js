_traderInfoTemplate = Handlebars.compile($('#traderInfo-template').html());
_tradeTemplate = Handlebars.compile($('#trade-template').html());
_orderInputsVolumeTemplate = Handlebars.compile($('#orderInputsVolume-template').html());
_orderInputsBothTemplate = Handlebars.compile($('#orderInputsBoth-template').html());
_transactionsTemplate = Handlebars.compile($('#transactions-template').html());
_porfolioTemplate = Handlebars.compile($('#portfolio-template').html());
_cancelOrdersTemplate = Handlebars.compile($('#cancelOrders-template').html());
_timerTemplate = Handlebars.compile($('#timer-template').html());
_newsTemplate = Handlebars.compile($('#news-template').html());

$('#traderView').html(_traderInfoTemplate);
  
// current orders is an array of arrays of size 2-3
// [type, volume, price]    
var currentOrders = {};
var currentOrderText = {};
var socket = io.connect('http://localhost');
var year;
var email;
var transactions = [];
var newsId; 
var news = {};
news['news'] = [];

// this variable name is misleading because it is both the quote and porfolio information
// but changing it at this point might cause unnecessary bugs/debugging effort (aka Stephanie is lazy)
var portfolio = {};
portfolio['last'] = '-';
portfolio['low'] = '-';
portfolio['high'] = '-';
portfolio['bid'] = '-';
portfolio['bidSize'] = '-';
portfolio['ask'] = '-';
portfolio['askSize'] = '-';
portfolio['volume'] = 0;
portfolio['quantity'] = 400;
portfolio['crlTotal'] = '-';
portfolio['cashTotal'] = 10000;
portfolio['total'] = '-';


$('#submitBtn').click( function() {
	if ( $('#nameInput').val().length > 0 && $('#emailInput').val().length > 0 ) {
  		socket.emit('set nickname', {name: $('#nameInput').val() , email: $('#emailInput').val()});
    	socket.on('ready', function (data) {
    		email = data;
    		$('#traderView').html(_tradeTemplate);
    		$('.trading').prop('disabled', true);
    		
    		// Client is assigned a newsId, which chooses which set of news he receives
			newsId = Math.floor(Math.random()*3);
	
			// socket listens to the server for updates
			socket.on('update', function(updateObj) {
				// update model
				updatePorfolio( updateObj['quote'], updateObj['update']['sales'], createCurrentOrdersText );
				// update view
				$('#portfolio').html(_porfolioTemplate(portfolio));
				$('#transactions').html(_transactionsTemplate({transactions: transactions}));
			});

			// limit orders put in but not matched
			socket.on('updateNoSale', function(updateObj) {
				// update model
				updatePorfolio( updateObj['quote'], null, createCurrentOrdersText );
				// update view
				$('#portfolio').html(_porfolioTemplate(portfolio));
			});

			// cancel order was successful
			socket.on('cancel successful', function(obj) {
				cancelOrder(obj['time']);
				createCurrentOrdersText();
			});

			// when market opens
			socket.on('open market', function(yearObj) {
				var duration = parseInt(yearObj['duration']);
				year = yearObj['year'];
				// start timer
				var timer = new AdminTimer();
				timer.countdown(yearObj['duration'],'#timer', null, function() {});
				priceGraph(duration);

				// update news
				if ( yearObj['news'].length > 0 ) {
					news['news'].push( yearObj['news'][newsId] );
					$('#newsBox').html(_newsTemplate(news));
				}

				// enable buttons
				enableTradingPanel();
			});

			// when market closes
			socket.on('close market', function(yearObj) {
				// disable buttons and inputs
				$('.trading').prop('disabled', true);

				// update news
				if ( yearObj['news'].length > 0 ) {
					news['news'].push( yearObj['news'][newsId] );
					$('#newsBox').html(_newsTemplate(news));
				}
			});
    	});
    }
});

function enableTradingPanel() {
	// Initialize the trading panel
	$('.trading').prop('disabled', false);
	$('#orderInputs').html(_orderInputsVolumeTemplate);
	$('#cancelOrders').html(_cancelOrdersTemplate({ orders: currentOrderText}));

	$('#transactions').html(_transactionsTemplate({ transactions: transactions }));

	$('#portfolio').html(_porfolioTemplate(portfolio));

	$('#orderType').on('change', function() {
		var option = $(this).val();
		if (option === 'marketBuy' || option === 'marketSell') $('#orderInputs').html(_orderInputsVolumeTemplate);
		else $('#orderInputs').html(_orderInputsBothTemplate);
	});

	$('#cancelOrderButton').click(function() {
		var time = $('#cancelOrdersSelect').val();
		if ( time ) {
			socket.emit('cancel order', {time: time, order: currentOrders[time]});
		}
 	});

	$('#submitOrderBtn').click(function() {
		var time = new Date().getTime();

		var volume = $('#volumeInput').val();
		var reg = /^\d+$/;
		// check if inputs were valid and non empty 
		if ( ! reg.test(volume) ) {
			$('input').val(''); 
			return;
		};

		var orderObject = {};
		orderObject['time'] = time;
		orderObject['id'] = email;		
		orderObject['unfulfilled'] = parseInt(volume, 10);

		var option = $('#orderType').val();
		orderObject['type'] = option;
		currentOrders[time] = [option, parseInt(volume, 10)];

		if (option === 'limitBuy' || option === 'limitSell') {
			var price = $('#priceInput').val();
			if ( ! reg.test(price) ) {
				$('input').val(''); 
				return;
			};
			orderObject['price'] = parseInt(price, 10);
			currentOrders[time].push(parseInt(price, 10));
		}

		createCurrentOrdersText();
						
		socket.emit('make order', orderObject);
		$('input').val('');         
	});
}

function updatePorfolio(quote, sales, callback) {

	// updating quote info
	if ( quote['ask'] === -1 ) {
		portfolio['ask'] = '-';
		portfolio['askSize'] = '-';
	} else {
		portfolio['ask'] = quote['ask'];
		portfolio['askSize'] = quote['askSize'];
	}

	if ( quote['bid'] === -1 ) {
		portfolio['bid'] = '-';
		portfolio['bidSize'] = '-';
	} else {
		portfolio['bid'] = quote['bid'];
		portfolio['bidSize'] = quote['bidSize'];
	}

	addAskBid(quote);

	if ( quote.hasOwnProperty('price') ) {
		portfolio['last'] = quote['price'];
		portfolio['volume'] = quote['volume'];

		if ( portfolio['high'] === '-' ) {
			portfolio['high'] = quote['price'];
		} else {
			portfolio['high'] = Math.max(quote['price'], portfolio['high']);
		}
		if ( portfolio['low'] === '-' ) {
			portfolio['low'] = quote['price'];
		} else {
			portfolio['low'] = Math.min(quote['price'], portfolio['low']);
		}
	}

	if (sales) {

		addSales(sales);
		// updating personal portfolio info
		// when a current order is altered, either partially or completely fulfilled, 
		// it will be recorded in sales which will have buyer and seller ids
		for ( var i = 0; i < sales.length; i++ ) {
			var currentSale = sales[i];
			// client bought shares
			if ( currentSale['buyerId'] === email ) {
				portfolio['cashTotal'] -= currentSale['price'] * currentSale['amount'];
				portfolio['quantity'] += currentSale['amount'];
				addToTransaction(currentSale, 'buy');
			} 
			// client sold shares
			if ( currentSale['sellerId'] === email ) {
				portfolio['cashTotal'] += currentSale['price'] * currentSale['amount'];
				portfolio['quantity'] -= currentSale['amount'];
				addToTransaction(currentSale, 'sell');
			}
		}

		// update the value of client's stocks
		portfolio['crlTotal'] = portfolio['last'] * portfolio['quantity'];

		// update the value of client's entire portfolio
		portfolio['total'] = portfolio['crlTotal'] + portfolio['cashTotal'];

		callback();
	}
}

/**
 * Type is either 'buy' or 'sell' 
 * Worst typing ever: Does javascript have enums?
 */
function addToTransaction(sale, type) {
	var time;
	// go through sales and see if any of the sales are yours
	if ( type === 'buy' ) {
		transactions.push('You bought ' + sale['amount'] + ' shares at $' + sale['price']);
		time = sale['buyerStockId'];
	} else {
		transactions.push('You sold ' + sale['amount'] + ' shares at $' + sale['price']);
		time = sale['sellerStockId'];
	}

	var order = currentOrders[time];
	// update cancel orders
	if (sale['amount'] ===  order[1] ) {
		delete currentOrders[time];
	} else {
		// only the volume can change
		order[1] -= sale['amount'];
	}
}

function createCurrentOrdersText() {
	// reset the cancel orders. Don't know if this is the most efficient approach
	currentOrderText = {};

	for ( var key in currentOrders) {
		var order = currentOrders[key];
		var type = order[0];
		var text;
		if ( type === 'marketBuy' ) {
			text = 'Buy ' + order[1] + ' shares at Market Price';
		} else if ( type === 'marketSell' ) {
			text = 'Sell ' + order[1] + ' shares at Market Price';
		} else if ( type === 'limitBuy' ) {
			text = 'Buy ' + order[1] + ' shares at $' + order[2];
		} else if ( type === 'limitSell' ) {
			text = 'Sell ' + order[1] + ' shares at $' + order[2];
		}
		currentOrderText[key] = text;
	}
	$('#cancelOrders').html(_cancelOrdersTemplate({ orders: currentOrderText}));
}

function cancelOrder(time) {
	delete currentOrders[time];
}
