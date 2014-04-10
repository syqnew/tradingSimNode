var year = 1;
var socket = io.connect('http://localhost');
var stage0 = [];
var stage1 = [];
var stage2 = [];
var state = [];


_timerTemplate = Handlebars.compile($('#timer-template').html());

socket.emit('admin', {});

socket.on('admin ready', function(obj) {

	$('#startPeriodButton').click(function() {
		$('#duration').prop('disabled', true);
		$('#year1').prop('disabled', true);
		$('#year2').prop('disabled', true);
		$(this).prop('disabled', true);

		createNews($('#year1').val(), $('#year2').val(), function() {

			var duration = $('#duration').val();
			var timer = new AdminTimer();
			if ( year === 1 ){
				socket.emit('open market', { year: year , duration: duration, news: stage0 });
			} else {
				socket.emit('open market', { year: year , duration: duration, news: [] });
			}

			// Send close market message and dividends
			timer.countdown(duration, '#timer', '#startPeriodButton', function() {
				if ( year === 1 ) {
					socket.emit('close market', { year: year, news: stage1});
					year++; 
				} else {
					socket.emit('close market', { year: year, news: stage2 });	
				}	
			});
		});
	});
});

function createNews(event1, event2, callback) {
	// var stage0 = [];
	// var stage1 = [];
	// var stage2 = [];
	// var state = [];
	if (event1.substring(0, 1) == "X")
		state.push(0);
	if (event1.substring(0, 1) == "Y")
		state.push(1);
	if (event1.substring(0, 1) == "Z")
		state.push(2);
	if (event2.substring(0, 1) == "X")
		state.push(0);
	if (event2.substring(0, 1) == "Y")
		state.push(1);
	if (event2.substring(0, 1) == "Z")
		state.push(2);
	var stateStr1 = [ "X", "Y", "Z" ];
	var stateStr2 = [ "X", "Y", "Z" ];

	for ( var s1 = 0; s1 < 3; s1++) {
		for ( var s2 = 0; s2 < 3; s2++) {
			if (s1 == state[0])
				continue;
			if (s2 == state[1])
				continue;
			// var temp1 = {};
			var temp1 = "NOT " + stateStr1[s1] + " in Year 1 and NOT " + stateStr2[s2] + " in Year 2";
			stage0.push(temp1);
			// var temp2 = {};
			var temp2 = stateStr1[state[0]] + " in Year 1 and NOT " + stateStr2[s2] + " in Year 2";
			stage1.push(temp2);
			// var temp3 = {};
			var temp3 = stateStr1[state[0]] + " in Year 1 and " + stateStr2[state[1]] + " in Year 2";
			stage2.push(temp3);
		}
	}
	callback();
}