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
    sendMessage: function(...data) {
      let address = data.shift();
      let message = data;
      if (message === undefined || message.length === 0) {
        console.error(`je moet een waarde meegeven, alleen een adres is niet goed genoeg.`);
      }
      if (message[0] === undefined) {
        console.error(`je probeert ${message[0]} te sturen, dat kan niet. Zorg dat de variabele die je verstuurt een waarde heeft.`);
      }
      else if (message < -2147483648 || message > 2147483647) {
        console.error(`Getal is te klein of te groot\nHet getal mag niet kleiner zijn dan -2147483648 en groter dan 2147483647.\nhet getal dat je probeert te versturen is ${message}`)
      }
      else {
        let sendData = {"address":address,"message":message,"id":socket.io.engine.id};
        socket.emit('sendMessage',sendData);
      }
    },
    killClient: function() {
      socket.emit('killClient');
    }
  } 
}

function makeNote(note=60,velo=0.5,dur=0.0) {
  let env = new p5.Envelope(0.01,velo,dur,0.0);
  let triOsc = new p5.Oscillator('triangle');
  triOsc.freq(midiToFreq(note));
  triOsc.start();
  env.play(triOsc);
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
