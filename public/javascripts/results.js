/**
 * @author Stephanie New
 */

var socket = io.connect('http://localhost');

socket.on( 'finish', function(data) {
	console.log(data);

});