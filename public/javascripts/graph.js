var priceGraphInterval, timeLeft, min;
var priceData = [];
var bid = [];
var ask = [];
var min;
var year1; 

// Decided to use flot, seems easier
function priceGraph(duration) {
	min = new Date().getTime();
	timeLeft = duration * 60 * 1000;
	priceGraphInterval = setInterval(renderPriceGraph, 1000);
}

function addSales(sales) {
	for ( var i = 0; i < sales.length; i++ ) {
		var currentSale = sales[i];
		priceData.push( [ new Date().getTime(), currentSale['price'] ] );
	}
}

function addAskBid(quote) {
	console.log(quote);
	var currentTime = new Date().getTime();
	var currentBid = quote['bid'];
	var currentAsk = quote['ask'];

	bid = [];
	ask = [];
	if ( parseInt(currentBid) > 0 ) {
		bid.push( [ currentTime, currentBid ] )
	} else {
		bid.push( [] );
	}
	if ( parseInt(currentAsk) > 0 ) {
		ask.push( [ currentTime, currentAsk ] )
	} else {
		ask.push( [] );
	}
}

/* 
 * Render the stock price graph in the ui. Contains a triangle for the 'best' bid order, and 
 * one for the 'best' ask order. 
 */
function renderPriceGraph() {	
	if ( timeLeft > 0 ) {
		timeLeft -= 1000;
	}
	else {
		clearInterval(priceGraphInterval);
	}

	var time = new Date().getTime();
	if ( priceData.length > 0 ) {
		priceData.push( [ time, priceData[priceData.length-1 ][1]] );
	}
	if ( ask.length > 0 ) {
		ask = [[ time - 2500, ask[0][1] ]];
	}
	if ( bid.length > 0 ) {
		bid = [[ time - 2500, bid[0][1] ]];
	}
	console.log(ask);
	console.log(bid);

	var plot = $.plot('#chartdiv', 
		[{
			data : priceData,
			lines : {
				show : true,
				fill : false,
				fillColor : null
			},
			grid : {
				hoverable : true
			}
		}, 
		{
			data : bid,
			points : {
				show : true,
				radius : 3,
				symbol : "triangle"
			},
			color : "#FF0000"
		}, 
		{
			data : ask,
			points : {
				show : true,
				radius : 3,
				symbol : "upsideDownTriangle"
			},
				color : "#FF0000"
		}
		],
		{
			series: {
				shadowSize: 0,	// Drawing is faster without shadows
				lines: { show: true }
			}, 
			xaxis : {
				mode : "time",
				timeformat : "%H:%M:%S",
				min : min
			}
		});

	plot.draw();
}
