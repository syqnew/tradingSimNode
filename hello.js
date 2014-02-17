var app = require('http').createServer(handler)
    , io = require('socket.io').listen(app)
    , fs = require('fs')

app.listen(3000);

function handler (req, res) {
    fs.readFile(__dirname + '/index.html',
    function (err, data) {
        if (err) {
        res.writeHead(500);
        return res.end('Error loading index.html');
        }

        res.writeHead(200);
        res.end(data);
    });
}

io.sockets.on('connection', function (socket) {
    // make sure that a nickname is sent first before any requests can be taken 
    socket.on('set nickname', function (name) {
        socket.set('nickname', name, function () {
            // TODO: need to check that name hasn't been taken
            console.log(name);
            socket.emit('ready', name);
            
            // send message with event name 'news'
            socket.emit('news', { hello: 'world' });
        });
    });
    
    

});
