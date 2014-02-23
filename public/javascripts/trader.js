function Socket() {
	this.socket = io.connect('http://localhost');
}

Socket.prototype.connectToServer = function(name, email, callback) {
    this.socket.emit('set nickname', {name: name, email: email}); 
    
    this.socket.on('ready', function (data) {
    	callback();
    });
};

Socket.prototype.makeOrder = function(orderObject) {
	this.socket.emit('make order', orderObject);
};