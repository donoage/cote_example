const port = process.env.PORT || 5001;
const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const cote = require('cote');

require('pretty-error').start();

app.get('/', function (req, res) {
    console.log(`${req.ip} requested end-user interface`);
    res.sendFile(__dirname + '/index.html');
});


server.on('error', function (e) {
    if (e.code === 'EADDRINUSE') {
        console.log('The address is already in use.');
        console.log(e);
        process.exit(1);
    }
});

server.listen(port);

new cote.Sockend(io, {
    name: 'frontend sockend server'
});
