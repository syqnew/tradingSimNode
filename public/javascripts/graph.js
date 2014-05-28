var priceGraphInterval, timeLeft, min, max;
var priceData = [];
var bid = [];
var ask = [];
var min;
var year1; 
var volumeData = [];

/*
 * Create the price and volume graphs
 */
function priceGraph(duration) {
	min = new Date().getTime();
	max = min + (duration * 60 * 1000);
	timeLeft = duration * 60 * 1000;
	// hacky way to fix the range of the volume graph
	volumeData.push( [ max, 0 ] )
	priceGraphInterval = setInterval(renderPriceGraph, 1000);
}

/*
 * Method to add sales data 
 */
function addSales(sales) {
	for ( var i = 0; i < sales.length; i++ ) {
		var currentSale = sales[i];
		var currentTime = new Date().getTime();
		priceData.push( [ currentTime, currentSale['price'] ] );
		volumeData.push( [ currentTime, currentSale['amount'] ] );
	}
}

/*
 * Method to update the bid and ask triangles in the graph
 */
function addAskBid(quote) {
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
	} else {
		priceData.push( [ time, 0 ] );
	}
	if ( ask.length > 0 ) {
		ask = [[ time - 100, ask[0][1] ]];
	}
	if ( bid.length > 0 ) {
		bid = [[ time - 100, bid[0][1] ]];
	}
	volumeData.push( [ time, 0 ] );

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
		}, 
		{
			data: [[max, 0]],
			points: {
				show: false
			}
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

	var volumePlot = $.plot('#volumechartdiv', [ volumeData ], {
		series : {
			bars : {
				show : true,
				barWidth : 0.5,
				align : "center"
			}
		},
		xaxis : {
			mode : "time",
			timeformat : "%H:%M:%S", 
			min : min
		},
		yaxis : {
			min: 0
		}
	});

	plot.draw();
	volumePlot.draw();

}
