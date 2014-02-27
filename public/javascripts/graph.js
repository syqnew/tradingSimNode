var chartData = [];
var newPanel;



function generateChartData() {
	var firstDate = new Date(2012, 0, 1);
	firstDate.setDate(firstDate.getDate() - 500);
	firstDate.setHours(0, 0, 0, 0);

	for (var i = 0; i < 500; i++) {
		var newDate = new Date(firstDate);
		newDate.setDate(newDate.getDate() + i);

		var a = Math.round(Math.random() * (40 + i)) + 100 + i;
		var b = Math.round(Math.random() * 100000000);

		chartData.push({
			date: newDate,
			value: a,
			volume: b
		});
	}
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
		}],

		stockLegend: {
			valueTextRegular: " ",
			markerType: "none"
		}
	}],

	chartScrollbarSettings: {
		enabled: false
	}
});


}