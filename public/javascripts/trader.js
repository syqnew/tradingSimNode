_traderInfoTemplate = Handlebars.compile($('#traderInfo-template').html());
_tradeTemplate = Handlebars.compile($('#trade-template').html());
_orderInputsVolumeTemplate = Handlebars.compile($('#orderInputsVolume-template').html());
_orderInputsBothTemplate = Handlebars.compile($('#orderInputsBoth-template').html());
_transactionsTemplate = Handlebars.compile($('#transactions-template').html());
_porfolioTemplate = Handlebars.compile($('#portfolio-template').html());
_cancelOrdersTemplate = Handlebars.compile($('#cancelOrders-template').html());
_timerTemplate = Handlebars.compile($('#timer-template').html());

$('#traderView').html(_traderInfoTemplate);
      
var currentOrders = [];
var socket = io.connect('http://localhost');
var year;
var email;

$('#submitBtn').click( function() {
	if ( $('#nameInput').val().length > 0 && $('#emailInput').val().length > 0 ) {
  		socket.emit('set nickname', {name: $('#nameInput').val() , email: $('#emailInput').val()});
    	socket.on('ready', function (data) {
    		email = data;
    		$('#traderView').html(_tradeTemplate);
    		$('.trading').prop('disabled', true);
	
			// socket listens to the server for updates
			socket.on('update', function(data) {
				console.log(data);
			});

			// when market opens
			socket.on('open market', function(yearObj) {
				console.log("market has opened");
				year = yearObj['year'];
				// start timer
				var timer = new AdminTimer();
				timer.countdown(yearObj['duration'],'#timer', null);

				// enable buttons
				enableTradingPanel();

			});

			// when market closes
			socket.on('close market', function(yearObj) {
				console.log("market has closed");
				// disable buttons and inputs
				$('.trading').prop('disabled', true);
			});
    	});
    }
});

function enableTradingPanel() {
	// Initialize the trading panel
	$('.trading').prop('disabled', false);
	$('#orderInputs').html(_orderInputsVolumeTemplate);
	$('#cancelOrders').html(_cancelOrdersTemplate({ orders: ['Buy 13 shares at $324', 'Buy 13 shares at $324', 'Sell 23 shares at $23'] }));
	generateChartData();
	makeChart();

	// Get fake transactions
	$('#transactions').html(_transactionsTemplate({ transactions: ["You sold 100 shares at $2332", "You bought 200 shares at $5", 
		"You sold 100 shares at $2332", "You bought 200 shares at $5", "You sold 100 shares at $2332", "You bought 200 shares at $5",
		"You sold 100 shares at $2332", "You bought 200 shares at $5", "You sold 100 shares at $2332", "You bought 200 shares at $5",
		"You sold 100 shares at $2332", "You bought 200 shares at $5", "You sold 100 shares at $2332", "You bought 200 shares at $5",
		"You sold 100 shares at $2332", "You bought 200 shares at $5", "You sold 100 shares at $2332", "You bought 200 shares at $5"] } ));

	// Set fake portfolio data
	var samplePortfolio = {}
	samplePortfolio['last']='34';
	samplePortfolio['low']='34';
	samplePortfolio['high']='34';
	samplePortfolio['bid']='34';
	samplePortfolio['bidSize']='34';
	samplePortfolio['ask']='34';
	samplePortfolio['askSize']='34';
	samplePortfolio['volume']='34';
	samplePortfolio['quantity']='34';
	samplePortfolio['crlTotal']='34';
	samplePortfolio['cashTotal']='34';
	samplePortfolio['total']='34';
	$('#portfolio').html(_porfolioTemplate(samplePortfolio));

	$('#orderType').on('change', function() {
		var option = $(this).val();
		if (option === 'marketBuy' || option === 'marketSell') $('#orderInputs').html(_orderInputsVolumeTemplate);
		else $('#orderInputs').html(_orderInputsBothTemplate);
	});

	$('.cancelOrderButton').click(function() {
		alert("Are you sure you want to Cancel your order");
	});

	$('#submitOrderBtn').click(function() {
		var time = new Date().getTime();

		//TODO: check if inputs were valid and non empty
		var orderObject = {};
		orderObject['time'] = time;

		orderObject['id'] = email;

		var volume = $('#volumeInput').val();
		orderObject['volume'] = volume;

		var option = $('#orderType').val();
		orderObject['type'] = option;
		currentOrders[time] = [option, volume];

		if (option === 'limitBuy' || option === 'limitSell') {
			orderObject['price'] = $('#priceInput').val();
			currentOrders[time].push($('#priceInput').val());
		}
				
		socket.emit('make order', orderObject);
		//socket.makeOrder(orderObject);
		$('input').val('');
                
	});

}