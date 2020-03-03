const express = require('express');
const app = express();
const path = require('path');
const server = require('http').Server(app);
const io = require('socket.io')(server);
const osc = require('node-osc');
const readline = require('readline');
const _ = require('lodash');

let sendSocket = [];
let oscServer = [];
let oscClient = [];
let clients = {};


/*--------------osc-----------------/
 *-----------functions--------------/
 *///-------------------------------/

//check if a server is already running on the desired port, if so: kill it first
function serverExist(port,id,callback) {
  let found = 0;
  for (let i in oscServer) {
    if (oscServer[i] && oscServer[i].port == port) {
      found = 1;
      oscServer[i].close();
      oscServer[i] = null;
      callback();  
    }
  }
  if (!found) {
    callback();  
  }
}

/*--------user-interaction----------/
 *----------exit-program------------/
 *///-------------------------------/

//handle ctrl+c 
process.on('SIGINT', function(){
  killOsc();
  process.exit (0);
});

//get user input from the terminal
const rl = readline.createInterface({
  input: process.stdin
});

//if input is any of these words, quit the program
rl.on('line', (input) => {
  if (input == "quit" || input == "stop" || input == "hou op!") {
    killOsc();
    process.exit(0);
  }
});

// close all ports etc.
function killOsc() {
  oscServer.forEach(s => {
    if (s)s.close();
  });
  oscClient.forEach(s => {
    if (s)s.close();
  });
}

/*-----------http-server------------/
 *----------------------------------/
 *///-------------------------------/

//start the server listening on port 8001
server.listen(8001,function() {
  console.log("De server staat aan! Je kunt deze via localhost:8001 bereiken.\nJe kunt dit programma afsluiten door stop+enter te typen");
});

//zorg dat de server alle paths kan bereiken. 
app.use(express.static(path.join(__dirname,'/')));

//genereer errormessage als de pagina niet bestaat
app.use(function(req,res,next) {
  let fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
  res.status(400).send("De pagina <b>"+fullUrl+"</b> bestaat niet, heb je het goede adres ingevuld?");
});

/*----------web-socket--------------/
 *----------------------------------/
 *///-------------------------------/

io.on('connection', function (socket) {
  clients[socket.id] = socket;  
  
  //initialize socket, make a connection with the webpage
  socket.on('oscLib',function(data) {
    sendSocket[data] = clients[data];
    let returnMessage = setTimeout(function() {
      sendSocket[data].emit("connected",data);
    },100);

    //what to do on disconnecting
    sendSocket[data].on('disconnect',function() {
      if (data && oscServer[data]) {
        oscServer[data].close();
        oscServer[data] = null;
      }
    });
  });

  //on receiving start message for server
  socket.on('startServer',function(data) {
    serverExist(data.port,data.id,function() {
      oscServer[data.id] = new osc.Server(data.port,'0.0.0.0');

      sendSocket[data.id].emit("serverRunning",{"port":data.port});
        
      oscServer[data.id].on("message",function([...msg],rinfo) {
        let address = msg.shift();
        let message = msg;
        let sendData = {"add":address,"msg":message};
        sendSocket[data.id].emit('getMessage',sendData);
      });
    });
  });

  //on receiving kill message for server
  socket.on('killServer',function() {
    oscServer.close();
  });

  //on receiving start message for client
  socket.on('startClient',function(data) {
    oscClient[data.id] = new osc.Client(data.ip, data.port);
    sendSocket[data.id].emit("clientRunning",{"ip":data.ip,"port":data.port,"active":1});
  });

  //on receiving kill message for client
  socket.on('killClient',function() {
    oscClient.close();
  });

  //on receiving message to send
  socket.on('sendMessage',function(data) {
    if (oscClient[data.id]) {
      oscClient[data.id].send(data.address, data.message, function () {
      });  
    }
  });
});