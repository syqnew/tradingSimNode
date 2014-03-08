var timerId;

function AdminTimer() {
}

AdminTimer.prototype.countdown = function(duration, placeholder, button) {
    var timeLeft = duration * 60 * 1000;

    timerId = setInterval(function(){
    if (timeLeft > 0) { 
   	    timeLeft -= 1000;
   	} else {
        clearInterval(timerId);
        $(button).prop('disabled', true);
        year = 2;
    }
    var minutes = Math.floor(timeLeft / (60 * 1000));
    var seconds = Math.floor((timeLeft - (minutes * 60 * 1000)) / 1000);

	$(placeholder).html(_timerTemplate( { minutes: minutes, seconds: seconds } ));
    },1000);
}