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
});

//receive serial ports
socket.on('serialPorts',data => {
  console.log("Available serial ports");
  for (let i in data) {
    console.log(i+":",data[i]);
  }
})

//receive midi-in-ports
socket.on('midiInPorts',data => {
  console.log("Available midi-in ports");
  for (let i in data) {
    console.log(i+":",data[i]);
  }
});

//receive midi-out-ports
socket.on('midiOutPorts',data => {
  console.log("Available midi-out ports:");
  for (let i in data) {
    console.log(i+":",data[i]);
  }
});



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
        console.error("Je stuurt niets of stuurt iets dat undefined is");
      } else if (Number.isNaN(message[0])) {
        console.error("Je probeert iets te sturen wat niet bestaat, NaN");
      } else if (message === undefined || message.length === 0) {
        console.error(`je moet een waarde meegeven, alleen een adres is niet goed genoeg.`);
      } else if (message[0] === undefined) {
        console.error(`je probeert ${message[0]} te sturen, dat kan niet. Zorg dat de variabele die je verstuurt een waarde heeft`);
      }
      else if (message < - 2147483648 || message > 2147483647) {
        console.error(`Getal is te klein of te groot\nHet getal mag niet kleiner zijn dan -2147483648 en groter dan 2147483647.\nhet getal dat je probeert te versturen is ${message}`);
      } else {
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

class Serial {
  getPorts() {
    let sendData = {"id":socket.io.engine.id};
    socket.emit('getSerialPorts',sendData);
  }

  openPort(path,baud) {
    const sendData = {
      "path":path,
      "baudRate":baud,
      "id":socket.io.engine.id
    };
    socket.emit('openSerialPort',sendData);
  }

  closePort() {
    const sendData = {"id":socket.io.engine.id}
    socket.emit('closeSerialPort',sendData);
  }

  getSerialData(callback) {
    socket.on('serialData',data => {
      callback(data.message);
    });
  }

  sendSerialData(data) {
    let sendData = {
      "message":data,
      "id":socket.io.engine.id
    };
    socket.emit('sendSerialData',sendData);
  }
}

class Midi {
  //methods for midi in:
  getInPorts() {
    let sendData = {"id":socket.io.engine.id};
    socket.emit('getInPorts',sendData);
  }

  openInPort(p) {
    let sendData = {
      "port": p,
      "id": socket.io.engine.id
    }
    socket.emit('openInPort',sendData);
  }

  getMidiNote(callback) {
    this.getMidi(data => {
      let chan = data[0];
      if (chan >= 144 && chan < 160) {
        let note = data[1];
        let velocity = data[2];
        callback(note,velocity,chan-143);
      }
    });
  }

  getControlChange(callback) {
    this.getMidi(data => {
      let chan = data[0];
      if (chan >= 176 && chan < 192) {
        let ctl = data[1];
        let val = data[2];
        callback(ctl,val,chan-175);
      }
    });
  }

  getPgmChange(callback) {
    this.getMidi(data => {
      let chan = data[0];
      if (chan >= 192 && chan < 208) {
        let pgm = data[1];
        callback(pgm,chan-191);
      }
    });
  }

  getMidi(callback) {
    socket.on('getMidi',data => {
      callback(data.message);
    });
  }

  //methods for midi out:
  getOutPorts() {
    let sendData = {"id":socket.io.engine.id};
    socket.emit('getOutPorts',sendData);
  }

  openOutPort(p) {
    let sendData = {
      "port": p,
      "id": socket.io.engine.id
    };
    socket.emit('openOutPort',sendData);
  }

  sendMidiNote(note,vel,chan=1) {
    let sendData = {
      "note": note,
      "vel": vel,
      "chan": chan+143,
      "id": socket.io.engine.id
    };
    socket.emit('sendMidiData',sendData);
  }

  sendControlChange(ctl,val,chan=1) {
    let sendData = {
      "note": ctl,
      "vel": val,
      "chan": chan+175,
      "id":socket.io.engine.id
    };
    socket.emit('sendMidiData',sendData);
  }

  sendPgmChange(note,chan=1) {
    let sendData = {
      "note": note,
      "chan": chan+192,
      "id": socket.io.engine.id
    };
    socket.emit('sendMidiData',sendData);
  }
}

function makeNoteSetup() {
  polySynth = new p5.PolySynth(p5.MonoSynth, 16);
}

function makeNote(note=60,velo=0.5,dur=100.0) {
  let error = 0;
  if (typeof note !== "number") {
    console.error("note is not a number. it's a(n)",typeof note);
    error = 1;
  }
  if (typeof velo !== "number") {
    console.error("velocity is not a number. it's a(n)",typeof velo);
    error = 1;
  }
  if (typeof dur !== "number") {
    console.error("duration is not a number. it's a(n)",typeof dur);
    error = 1;
  }
  userStartAudio();
  if (getAudioContext().state != 'running') {
    console.warn("Audio is not loaded. Click on the screen to enable audio!\n", "Making note", int(note), "with vel", velo, "and duration", dur, "ms")
  } 
  else if (error === 0) {
    polySynth.play(midiToFreq(note), velo, 0.0, dur / 1000.);
  }
}


