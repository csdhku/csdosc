const socket = io.connect();
let connected = 0;
let polySynth;

//stuurt socket-id door naar oscServer.js
socket.on('connect', _=> {
  socket.emit('oscLib',socket.io.engine.id);
  makeNoteSetup();
})

//geeft berichtje als de OSC-client draait
socket.on('clientRunning',function(data) {
  console.log("Client is sending to: "+data.ip+", port: "+data.port);
});

//geeft berichtje als de OSC-server draait
socket.on('serverRunning',function(data) {
  console.log("Server is listening on port " + data.port);
});

//set connected-variabele op 1 als de verbinding met de oscServer.js tot stand is gekomen
socket.on('connected',data => {
  connected = 1;
})


/*
  Class voor het aanmaken van een OSC-client. De volgende functies zijn beschikbaar:
 * - startClient(adres, poort) -> start een osc-client waarmee data verstuurd kan worden
 * - sendMessage(adres, ...waardes) -> stuur data over osc (moet bestaan uit een adres en een of meedere waardes (los of als array, kijk maar even))
 * - killClient() -> stopt de client (kan dit weg?)
*/ 
class Client {
  constructor() {
    this.clientActive = 0;
    this.clientCounter = 0;
  }
  startClient(address,port) {
    if (connected) {
      const sendData = {"ip":address,"port":port,"id":socket.io.engine.id};
      socket.emit('startClient',sendData); 
      this.clientActive = 1; 
    }
    else {
      this.clientCounter++;
      if (this.clientCounter < 4) {
        setTimeout(_=> {
          this.startClient(address,port);
        },100)
      }
      else {
        console.error(`Kan geen OSC-client opstarten...`);
      }
    } 
  }
  sendMessage(...data) {
    const address = data.shift();
    const message = data;
    if (this.clientActive) {
      if (message === undefined || message.length === 0) {
        console.error(`je moet een waarde meegeven, alleen een adres is niet goed genoeg.`);
      }
      if (message[0] === undefined) {
        console.error(`je probeert ${message[0]} te sturen, dat kan niet. Zorg dat de variabele die je verstuurt een waarde heeft`);
      }
      else if (message < - 2147483648 || message > 2147483647) {
        console.error(`Getal is te klein of te groot\nHet getal mag niet kleiner zijn dan -2147483648 en groter dan 2147483647.\nhet getal dat je probeert te versturen is ${message}`);
      }
      else {
        const sendData = {"address":address,"message":message,"id":socket.io.engine.id};
        socket.emit('sendMessage',sendData);
      }
    }
  }
  killClient() {
    if (this.clientActive) {
      socket.emit('killClient');
      this.clientActive = 0;
    }
  }
}


/*
  Class voor het aanmaken van een OSC-server. De volgende functies zijn beschikbaar:
 * - startServer(poort) -> start een osc-server waarmee data ontvangen kan worden
 * - getMessage(callback) -> ontvang data en stuurt via de callback twee waardes terug, adres en waarde (array van waarde als er meer dan 1 waarde is)
 * - killServer() -> stopt de server (kan dit weg?)
*/
class Server {
  constructor() {
    this.serverActive = 0;
    this.serverCounter = 0;
  }

  startServer(port) {
    if (connected) {
      const sendData = {"port":port,"id":socket.io.engine.id};
      socket.emit('startServer',sendData);
      this.serverActive = 1;
    }
    else {
      this.serverCounter++;
      if (this.serverCounter < 4) {
        setTimeout(_=> {
          this.startServer(port);
        },100);        
      }
      else {
        console.error(`Kan geen server opstarten...`);
      }
    }
  }
  getMessage(callback) {
    socket.on('getMessage',data => {
      let msg = data.msg;
      if (data.msg.length == 1) {
        msg = data.msg[0];
      }
      callback(data.add,msg);
    });
  }
  killServer() {
    if (this.serverActive) {
      socket.emit('killServer');
      this.serverActive = 0;
    }
  }
}


function makeNoteSetup() {
  polySynth = new p5.PolySynth()
}

function makeNote(note=60,velo=0.5,dur=100.0) {
  userStartAudio();
  if (getAudioContext().state != 'running') {
    console.warn("Audio is not loaded. Click on the screen to enable audio!\n", "Making note", int(note), "with vel", velo, "and duration", dur, "ms")
  } else polySynth.play(midiToFreq(note), velo, 0.0, dur / 1000.);
}


