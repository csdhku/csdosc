var socket = io.connect();

socket.on('connect',function() {
  //connect to the server
  socket.emit('oscLib',socket.io.engine.id);
});

socket.on('clientRunning',function(data) {
  console.log("Client is running on: "+data.ip+", port: "+data.port);
});

socket.on('serverRunning',function(data) {
  console.log("Server is running on port " + data.port);
});

function Client() {
  return {
    startClient: function(address,port) {
      var sendData = {"ip":address,"port":port};
      socket.emit('startClient',sendData);
    },
    sendMessage: function(address,message) {
      var sendData = {"address":address,"message":message};
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
      var sendData = {"port":port};
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
