var year = 1;
var socket = io.connect('http://localhost');


_timerTemplate = Handlebars.compile($('#timer-template').html());

socket.emit('admin', {});

socket.on('admin ready', function(obj) {

	$('#startPeriodButton').click(function() {
		$(this).prop('disabled', true);
		var duration = $('#duration').val();
		var timer = new AdminTimer();
		console.log("clicked the period button");
		socket.emit('open market', { year: year , duration: duration });
		timer.countdown(duration, '#timer', '#startPeriodButton', function() {
			socket.emit('close market', { year: year });
			year++; 
		});
	});

});