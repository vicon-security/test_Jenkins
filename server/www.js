#!/usr/bin/env node

/**
 * Module dependencies.
 */

var app = require('../app');
var debug = require('debug')('htmlplayer-server:server');
var http = require('http');
const WebSocket = require('ws')
/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '8000');
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);
//var io = require('socket.io')(server);

const Net = require('net');


server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

const wss = new WebSocket.Server({ port: 8001 })

//////const wsServer = new WebSocketServer({
//////    httpServer: server
//////});

//////wsServer.on('request', function (request) {
//////    const connection = request.accept(null, request.origin);
//////    connection.on('message', function (message) {
//////        console.log('Received Message:', message.utf8Data);
//////        connection.sendUTF('Hi this is WebSocket server!');
//////    });
//////    connection.on('close', function (reasonCode, description) {
//////        console.log('Client has disconnected.');
//////    });
//////});


//const WebSocketServer = require('ws').Server({ port: 8081 });

// list of users
var CLIENTS = [];
var id;

// web server is using 8081 port
//var webSocketServer = new WebSocketServer.Server({ port: 8081 });

wss.getUniqueID = function () {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4();
};
// check if connection is established
wss.on('connection', function (ws) {
    // console.log('connection is established : ');
    id = wss.getUniqueID();
    console.log('connection is established : ' + id);
    CLIENTS[id] = ws;
    CLIENTS.push(ws);

    ws.send(JSON.stringify({ 'clientId': id }));

    ws.on('message', function (message) {
        console.log('received: %s', message);

        //    // var received = JSON.parse(message);

        //     if(received.type == "login"){
        //         ws.send(message);  // send message to itself

        //         sendNotes(JSON.stringify({
        //             user: received.name,
        //             type: "notes"
        //         }), ws, id);

        //     }else if(received.type == "message"){
        //         sendAll(message); // broadcast messages to everyone including sender
        //     }
    });

    ws.on('close', function () {
        console.log('user ' + id + ' left chat');
        delete CLIENTS[id];
    });

});

function sendNotes(message, ws, id) {
    console.log('sendNotes : ', id);
    if (CLIENTS[id] !== ws) {
        console.log('IF : ', message);
        for (var i = 0; i < CLIENTS.length; i++) {
            CLIENTS[i].send(message);
        }
    } else {
        console.log('ELSE : ', message);
    }
}
function sendAll(message) {
    console.log('sendAll : ');
    for (var j = 0; j < CLIENTS.length; j++) {

        console.log('FOR : ', message);
        CLIENTS[j].send(message);
    }
}



/**
 * Listen on provided port, on all network interfaces.
 */




///const serverTCP = new Net.Server();


var serverTCP = Net.createServer(onClientConnected);
serverTCP.listen('8081', 'localhost');
//console.log('Server listening on ' + server.address().address +':'+ server.address().port);

function onClientConnected(sock) {
    var remoteAddress = sock.remoteAddress + ':' + sock.remotePort;
    console.log('new client connected: %s', remoteAddress);

    sock.on('data', function (data) {
         
        wss.clients
            .forEach(client => {
                //if (client != ws) {
                client.send(data.toString());
                // }
            });


        console.log('%s Says: %s', remoteAddress, data);
        sock.write('test data from server');
        //sock.write(' exit');
    });
    sock.on('close', function () {
        console.log('connection from %s closed', remoteAddress);
    });
    sock.on('error', function (err) {
        console.log('Connection %s error: %s', remoteAddress, err.message);
    });
};







/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    debug('Listening on ' + bind);
}
