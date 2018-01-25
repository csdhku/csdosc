const http = require('http');
const fs = require('fs');
const url = require('url');
const io = require('socket.io');
const osc = require('node-osc');

var sendSocket;
var oscServer;
var oscClient;
var clients = {};

//create the server, handling the page-requests
var server = http.createServer(function (request, response) {
  var path = url.parse(request.url).pathname;
  console.log(path);
  if (path === '/') {
    path = '/index.html';
  }
  var mime = 'text/html';
  var extension = path.split(".")[path.split(".").length-1];
  if (extension == 'css') {
    mime = 'text/css';
  }
  fs.readFile(__dirname + path,function(error,data) {
    if (error) {
      response.writeHead(404);
      response.write("Deze pagina bestaat niet (meer), huilen ;-(");
      response.end();
    }
    else {
      response.writeHead(200,{'content-type':mime});
      response.write(data,'utf8');
      response.end();
    }
  });
});

//start the server listening on port 8001
server.listen(8001,function() {
  //the server is running, listening on port 8001
  console.log("De server is aan!");
});

var listener = io.listen(server);

listener.sockets.on('connection',function(socket) {
  clients[socket.id] = socket;
  
  //initialize socket
  socket.on('oscLib',function(data) {
    
    sendSocket = clients[data];
  });

  //on receiving start message for server
  socket.on('startServer',function(data) {
    oscServer = new osc.Server(data.port,'0.0.0.0');

    sendSocket.emit("serverRunning",{"port":data.port});
    
    oscServer.on("message",function(msg,rinfo) {
      var sendData = {"add":msg[0],"msg":msg[1]};
      sendSocket.emit('getMessage',sendData);
    });
  });

  //on receiving kill message for server
  socket.on('killServer',function() {
    oscServer.kill();
  });

  //on receiving start message for client
  socket.on('startClient',function(data) {
    oscClient = new osc.Client(data.ip, data.port);
    sendSocket.emit("clientRunning",{"ip":data.ip,"port":data.port,"active":1});
  });

  //on receiving kill message for client
  socket.on('killClient',function() {
    oscClient.kill();
  });

  //on receiving message to send
  socket.on('sendMessage',function(data) {
    if (oscClient) {
      oscClient.send(data.address, data.message, function () {
    });  
    }
  });
});






