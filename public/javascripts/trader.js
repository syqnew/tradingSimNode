_traderInfoTemplate = Handlebars.compile($('#traderInfo-template').html());
_tradeTemplate = Handlebars.compile($('#trade-template').html());
_orderInputsVolumeTemplate = Handlebars.compile($('#orderInputsVolume-template').html());
_orderInputsBothTemplate = Handlebars.compile($('#orderInputsBoth-template').html());
_transactionsTemplate = Handlebars.compile($('#transactions-template').html());
_porfolioTemplate = Handlebars.compile($('#portfolio-template').html());

$('#traderView').html(_traderInfoTemplate);
      
var currentOrders = [];
var socket = io.connect('http://localhost');
//var socket = new Socket()

$('#submitBtn').click( function() {
	if ( $('#nameInput').val().length > 0 && $('#emailInput').val().length > 0 ) {
  		socket.emit('set nickname', {name: $('#nameInput').val() , email: $('#emailInput').val()});
    	socket.on('ready', function (data) {

    		// Initialize the trading panel
	    	$('#traderView').html(_tradeTemplate);
	    	$('#orderInputs').html(_orderInputsVolumeTemplate);

	    	// Get fake transactions
	    	$('#transactions').html(_transactionsTemplate({ transactions: ["You sold 100 shares at $2332", "You bought 200 shares at $5"] } ));

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

			$('#submitOrderBtn').click(function() {
				var time = new Date().getTime();

				//TODO: check if inputs were valid and non empty
				var orderObject = {};
				orderObject['time'] = time;

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

			// socket listens to the server for updates
			socket.on('update', function(data) {
				console.log(data);
			});
    	});
    }
});