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

function Lilypond() {
  return {
    setTempo(value) {
      let sendData = {"target":"tempo","value":value}
      socket.emit('lilypond',sendData);
    },
    setArtist(value) {
      let sendData = {"target":"artist","value":value}
      socket.emit('lilypond',sendData);
    },
    setTitle(value) {
      let sendData = {"target":"title","value":value}
      socket.emit('lilypond',sendData);
    },
    setKey(value) {
      let sendData = {"target":"title","value":value}
      socket.emit('lilypond',sendData);
    },
    setNotes(value, score="main") {
      let sendData = {"target":"notes","value":value,"score":score}
      socket.emit('lilypond',sendData);
    },
    setDuration(value, score="main") {
      let sendData = {"target":"duration","value":value,"score":score}
      socket.emit('lilypond',sendData);
    },
    setInstrument(value, score="main") {
      let sendData = {"target":"instrument","value":value,"score":score}
      socket.emit('lilypond',sendData);
    },
    createScore(file) {
      let sendData = {"target":"make","value":file}
      socket.emit('lilypond',sendData);
    }
  }
}

function Client() {
  return {
    startClient: function(address,port) {
      let sendData = {"ip":address,"port":port,"id":socket.io.engine.id};
      socket.emit('startClient',sendData);
    },
    sendMessage: function(...data) {
      let address = data.shift();
      let message = data;
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
        let msg = data.msg;
        if (data.msg.length == 1) {
          msg = data.msg[0];
        }
        callback(data.add,msg);
      });
    },
    killServer : function() {
      socket.emit('killServer');
    }
  }
}
