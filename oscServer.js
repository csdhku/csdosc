const express = require('express');
const app = express();
const path = require('path');
const server = require('http').Server(app);
const io = require('socket.io')(server);
const osc = require('node-osc');
const readline = require('readline');
const serial = require('serialport');

var sendSocket = [];
var oscServer = [];
var oscClient = [];
var clients = {};
var port = []//serial port

//serial port things:
//list available serial ports
serial.list(function(err,ports) {
  console.log("Serial Devices:")
  ports.forEach(function(sPort) {
    console.log("id:",sPort.serialNumber)
  });
});

function connectSerial(sn,id,baud) {
  serial.list(function(err,ports) {
    ports.forEach(function(sPort) {
      if (sPort.serialNumber == sn) {
        connectSerDev(sPort,id,baud);
      }
    })
  })
}

function connectSerDev(sPort,id,baud) {
  port[id] = new serial(sPort.comName, {
    baudRate: baud
  }, function() {
    console.log("Device connected");
    readPort(id);
  });
}

function readPort(id) {
  if (port[id]) {
    port[id].on('data',function(data) {
      console.log(data,data.length);
      if (data[0] == 255 && data[3] == 48) {
        var sendData = {"lsb":data[1],"hsb":data[2]};
        sendSocket[id].emit('getSerial',sendData);
      }
    });
  }
} 

function sendSerial(lsb,hsb,id) {
  if (port[id]) {
    var sermes = [lsb,hsb];
    port[id].write(sermes,function(error) {
      if (error) {
        console.log(error);
      }
    });
  }
}


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('line', (input) => {
  if (input == "quit" || input == "stop" || input == "hou op!") {
    killOsc();
    process.exit(0);
  }
});

process.on('SIGINT', () => {
  killOsc();
  process.exit(0);
});

//start the server listening on port 8001
server.listen(8001,function() {
  console.log("De server staat aan! Je kunt deze via localhost:8001 bereiken");
});

//zorg dat de server alle paths kan bereiken. 
app.use(express.static(path.join(__dirname,'/')));

//genereer errormessage als de pagina niet bestaat
app.use(function(req,res,next) {
  res.status(400).send("doet het niet");
});

io.on('connection', function (socket) {
  clients[socket.id] = socket;  
  //initialize socket
  socket.on('oscLib',function(data) {
    sendSocket[data] = clients[data];
    var returnMessage = setTimeout(function() {
      sendSocket[data].emit("connected",data);
    },100);

    sendSocket[data].on('disconnect',function() {
      if (data && oscServer[data]) {
        oscServer[data].kill();
        oscServer[data] = null;  
      }
    });
  });

  //on receiving start message for server
  socket.on('startServer',function(data) {
    serverExist(data.port,data.id,function() {
      oscServer[data.id] = new osc.Server(data.port,'0.0.0.0');

      sendSocket[data.id].emit("serverRunning",{"port":data.port});
        
      oscServer[data.id].on("message",function(msg,rinfo) {
        var sendData = {"add":msg[0],"msg":msg[1]};
        sendSocket[data.id].emit('getMessage',sendData);
      });
    });
  });

  //on receiving kill message for server
  socket.on('killServer',function() {
    oscServer.kill();
  });

  //on receiving start message for client
  socket.on('startClient',function(data) {
    oscClient[data.id] = new osc.Client(data.ip, data.port);
    sendSocket[data.id].emit("clientRunning",{"ip":data.ip,"port":data.port,"active":1});
  });

  //on receiving kill message for client
  socket.on('killClient',function() {
    oscClient.kill();
  });

  //on receiving message to send
  socket.on('sendMessage',function(data) {
    if (oscClient[data.id]) {
      oscClient[data.id].send(data.address, data.message, function () {
      });  
    }
  });


  //serial from library:
  socket.on('connectSerial',function(data) {
    connectSerial(data.serialId,data.id,data.baud);
  });

  socket.on('sendSerial',function(data) {
    sendSerial(data.lsb,data.hsb,data.id);
  });
});

function killOsc() {
  for (var i in oscServer) {
    if (oscServer[i]) {
      oscServer[i].kill();  
    }
  }
  for (var i in oscClient) {
    oscClient[i].kill();
  }
}

function serverExist(port,id,callback) {
  var found = 0;
  for (var i in oscServer) {
    if (oscServer[i] && oscServer[i].port == port) {
      found = 1;
      oscServer[i].kill();
      oscServer[i] = null;
      callback();  
    }
  }
  if (!found) {
    callback();  
  }
}



