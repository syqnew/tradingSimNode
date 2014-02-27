_traderInfoTemplate = Handlebars.compile($('#traderInfo-template').html());
_tradeTemplate = Handlebars.compile($('#trade-template').html());
_orderInputsVolumeTemplate = Handlebars.compile($('#orderInputsVolume-template').html());
_orderInputsBothTemplate = Handlebars.compile($('#orderInputsBoth-template').html());
_transactionsTemplate = Handlebars.compile($('#transactions-template').html());
_porfolioTemplate = Handlebars.compile($('#portfolio-template').html());

$('#traderView').html(_traderInfoTemplate);
      
var socket = io.connect('http://localhost');
//var socket = new Socket()

$('#submitBtn').click( function() {
	if ( $('#nameInput').val().length > 0 && $('#emailInput').val().length > 0 ) {
  		socket.emit('set nickname', {name: $('#nameInput').val() , email: $('#emailInput').val()});
    	socket.on('ready', function (data) {

	    	$('#traderView').html(_tradeTemplate);
	    	$('#orderInputs').html(_orderInputsVolumeTemplate);
	    	$('#transactions').html(_transactionsTemplate({ transactions: ["You sold 100 shares at $2332", "You bought 200 shares at $5"] } ));
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
				if (option === 'option1' || option === 'option2') $('#orderInputs').html(_orderInputsVolumeTemplate);
				else $('#orderInputs').html(_orderInputsBothTemplate);
    		});

			$('#submitOrderBtn').click(function() {
				//TODO: check if inputs were valid and non empty
				var orderObject = {};
				orderObject['volume'] = $('#volumeInput').val();
				var option = $('#orderType').val();
				console.log(option);
				if (option === 'option1') orderObject['type'] = 'marketBuy';
				else if (option === 'option2') orderObject['type'] = 'marketSell';
				else if (option === 'option3') {
					orderObject['type'] = 'limitBuy';
					orderObject['price'] = $('#priceInput').val();
				}
				else if (option === 'option4') {
					orderObject['type'] = 'limitSell';
					orderObject['price'] = $('#priceInput').val();
				}
				socket.emit('make order', orderObject);
				//socket.makeOrder(orderObject);
				$('input').val('');
                
			});
    	});
    }
});