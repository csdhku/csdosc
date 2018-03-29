const express = require('express');
const app = express();
const path = require('path');
const server = require('http').Server(app);
const io = require('socket.io')(server);
const osc = require('node-osc');
const readline = require('readline');
const serial = require('serialport');
const _ = require('lodash');
const noble = require('noble');

var sendSocket = [];
var oscServer = [];
var oscClient = [];
var clients = {};
var port = []//serial port
var matches = [];
var name = false;
// var nobleId;
/*----serial-communication----------/
 *---------functions----------------/
 *///-------------------------------/

//show a list of available serial devices
serial.list(function(err,ports) {
  console.log("Serial Devices:")
  if (process.argv[2] && process.argv[2] == "name") {
    ports.forEach(function(sPort) {
      console.log("deviceName:",sPort.comName);
    });
    name = true;
  }
  else {
    ports.forEach(function(sPort) {
      console.log("id:",sPort.serialNumber);
    });  
  }
});

//check if the given device is online, if so send it's information to connect function
//sn = serial number, id = page socket id, baud = baud rate
function connectSerial(sn,id,baud) {
  serial.list(function(err,ports) {
    ports.forEach(function(sPort) {
      if (name) {
        if (sPort.comName == sn) {
          connectSerDev(sPort,id,baud);  
        }
      }
      else {
        if (sPort.serialNumber == sn) {
          connectSerDev(sPort,id,baud);
        }  
      }
    });
  });
}

//connect to the serial device
function connectSerDev(sPort,id,baud) {
  port[id] = new serial(sPort.comName, {
    baudRate: baud
  }, function() {
    console.log("Device connected");
    readPort(id);
  });
}

//read data from the serial port. 
function readPort(id) {
  if (port[id]) {
    port[id].on('data',function(data) {
      handleSerial(data);
    });
  }
} 

//send the serial data to match-objects to check if the pattern is matching
function handleSerial(data) {
  for (var i=0;i<data.length;i++) {
    for (var j in matches) {
      matches[j].findNewMatch(data[i]);
    }
  }
}

//match 'class': send a pattern and check if the pattern matches.
//if it does, send it back to the oscLib.js
function Match(pattern,index,id) {
  var match = pattern;
  var result = [];
  var sendId = index;
  var pageId = id;
  return {
    findNewMatch: function(value) {
      if (result.length < match.length) {
        result.push(value);
      }
      else {
        result.push(value);
        result.shift();
      }
      if (result[0] == match[0] && result[match.length-1] == match[match.length-1]) {
        result.pop();
        result.shift();
        var sendData = {"result":result,"index":sendId};
        sendSocket[pageId].emit('getSerial',sendData);
      }
    }
  }
}

//send serial data to the device.
function sendSerial(data,id) {
  if (port[id]) {
    port[id].write(data,function(error) {
      if (error) {
        console.log(error);
      }
    });
  }
}

function connectBle(id) {
  // nobleId = id;
  noble.on('stateChange',function(state) {
    if (state === 'poweredOn') {
      var serviceUuids = ['6e400001b5a3f393e0a9e50e24dcca9e'];
      noble.startScanning(serviceUuids);
    }
    else {
      noble.stopScanning();
    }
  });
  receiveBle(id);
}

function receiveBle(id) {
  noble.on('discover',function(peripheral) {
    peripheral.connect(function(error) {
      console.log('connected to bluetooth device:' + peripheral.uuid);
      peripheral.discoverServices(['6e400001b5a3f393e0a9e50e24dcca9e'],function(error,services) {
        var service = services[0];
        service.discoverCharacteristics(['6e400003b5a3f393e0a9e50e24dcca9e'],function(error,characteristics) {
          var chars = characteristics[0];
          chars.on('data',function(data,isNotification) {
            var returnData = data.toString();
            console.log(returnData);
            sendSocket[id].emit('getBluetooth',returnData);
          });
          chars.subscribe(function(error) {
            console.log("Read data from serial");

          })
        })
      })
    })
  })
}

/*--------------osc-----------------/
 *-----------functions--------------/
 *///-------------------------------/

//check if a server is already running on the desired port, if so: kill it first
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
  for (var i in oscServer) {
    if (oscServer[i]) {
      oscServer[i].kill();  
    }
  }
  for (var i in oscClient) {
    if (oscClient[i]) {
      oscClient[i].kill();  
    }
  }
  for (var i in sendSocket) {
    sendSocket[i].disconnect();
  }
  for (var i in port) {
    port[i].close();
  }
}

/*-----------http-server------------/
 *----------------------------------/
 *///-------------------------------/

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

/*----------web-socket--------------/
 *----------------------------------/
 *///-------------------------------/

io.on('connection', function (socket) {
  clients[socket.id] = socket;  
  
  //initialize socket, make a connection with the webpage
  socket.on('oscLib',function(data) {
    sendSocket[data] = clients[data];
    var returnMessage = setTimeout(function() {
      sendSocket[data].emit("connected",data);
    },100);

    //what to do on disconnecting
    sendSocket[data].on('disconnect',function() {
      if (data && oscServer[data]) {
        oscServer[data].kill();
        oscServer[data] = null;
      }
      if (data && port[data]) {
        console.log("Device disconnected");
        port[data].close();  
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

  //on connecting to a serial device:
  socket.on('connectSerial',function(data) {
    connectSerial(data.serialId,data.id,data.baud);
  });

  //send serial message
  socket.on('sendSerial',function(data) {
    sendSerial(data.data,data.id);
  });

  //receive serial message
  socket.on('receiveSerial',function(data,fn) {
    fn(matches.length);
    matches.push(new Match(data.pattern,matches.length,data.id));
  });

  //bluetooth thingies
  socket.on('connectBluetooth',function(data) {
    connectBle(data.id);
  });
});