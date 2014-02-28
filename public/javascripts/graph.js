var chartData = [];


function generateChartData() {
	var firstDate = new Date(2012, 0, 1);
	firstDate.setDate(firstDate.getDate() - 500);
	firstDate.setHours(0, 0, 0, 0);

	for (var i = 0; i < 500; i++) {
		var newDate = new Date(firstDate);

		newDate.setDate(newDate.getDate() + i);

		var a = Math.round(Math.random() * (40 + i)) + 100 + i;
		var b = Math.round(Math.random() * 100000);

		chartData.push({
			date: newDate,
			value: a,
			volume: b
		});
	}
	// For box plot that shows the spread, if I can get it to work...
	// chartData.push({
	// 	date: new Date(2012, 4, 1),
	// 	value: 432,
	// 	volume: 980,
	// 	low: 100, 
	// 	high: 600,
	// 	open: 222, 
	// 	close: 333
	// });
}

function makeChart() {
	AmCharts.makeChart("chartdiv", {
		type: "stock",
	    "theme": "dark",
	    pathToImages: "http://www.amcharts.com/lib/3/images/",
		dataSets: [{
			color: "#b0de09",
			fieldMappings: [{
				fromField: "value",
				toField: "value"
			}, {
				fromField: "volume",
				toField: "volume"
			}, {
				fromField: "open",
				toField: "open"
			}, {
				fromField: "close",
				toField: "close"
			}, {
				fromField: "high",
				toField: "high"
			}, {
				fromField: "low",
				toField: "low"
			}],
			dataProvider: chartData,
			categoryField: "date",
		}],
		panels: [{
			title: "Value",
			percentHeight: 70,

			stockGraphs: [{
				id: "g1",
				valueField: "value"
			},
			{
				type: "candlestick",
				id: "g2",
				openField: "open",
				closeField: "close",
				highField: "high",
				lowField: "low",
				valueField: "close",
				lineColor: "#7f8da9",
				fillColors: "#7f8da9",
				negativeLineColor: "#db4c3c",
				negativeFillColors: "#db4c3c",
				fillAlphas: 1,
				useDataSetColors: false,
				comparable: true,
				compareField: "value",
				showBalloon: false
			}],

			stockLegend: {
				valueTextRegular: " ",
				markerType: "none"
			}
		},
		{
			title: "Volume",
			percentHeight: 30,
			marginTop: 1,
			showCategoryAxis: true,
			valueAxes: [{

				dashLength: 5
			}],

			categoryAxis: {
				dashLength: 5
			},

			stockGraphs: [{
				valueField: "volume",
				type: "column",
				showBalloon: false,
				fillAlphas: 1
			}],

			stockLegend: {
				markerType: "none",
				markerSize: 0,
				labelText: "",
				periodValueTextRegular: "[[value.close]]"
			}
		} 
		],
		// disabled adjustable window at the bottom
		chartScrollbarSettings: {
			enabled: false
		}, 
		// disabled hoverover date
		chartCursorSettings: {
			enabled: false
		}
	});
}