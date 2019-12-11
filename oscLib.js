const socket = io.connect();

socket.on('connect',function() {
  //connect to the server
  socket.emit('oscLib',socket.io.engine.id);
});

socket.on('clientRunning',function(data) {
  console.log("Client is sending to: "+data.ip+", port: "+data.port);
});

socket.on('serverRunning',function(data) {
  console.log("Server is listening on port " + data.port);
});

function Connect() {
  return {
    connectToServer: function(callback) {
      socket.on('connected',function(data) {
        callback(true);
      });
    }
  }
}

function Client() {
  return {
    startClient: function(address,port) {
      let sendData = {"ip":address,"port":port,"id":socket.io.engine.id};
      socket.emit('startClient',sendData);
    },
    sendMessage: function(address,message) {
      let sendData = {"address":address,"message":message,"id":socket.io.engine.id};
      socket.emit('sendMessage',sendData);
    },
    killClient: function() {
      socket.emit('killClient');
    }
  } 
}

function Server() {
  return {
    startServer: function(port) {
      let sendData = {"port":port,"id":socket.io.engine.id};
      socket.emit('startServer',sendData);
    },
    getMessage: function(callback) {
      socket.on('getMessage',function(data){
        callback(data.add,data.msg);
      });
    },
    killServer : function() {
      socket.emit('killServer');
    }
  }
}
