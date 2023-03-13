let midi;

function setup() {
  //plaats hier de code die maar één keer hoeft te worden uitgevoerd
  createCanvas(800,600);
  background(255);

  //maak nieuw midi-object
  midi = new Midi();

  //laat alle in- en outports zien
  midi.getOutPorts();
  midi.getInPorts();

  //maak verbinding met specifieke poort
  midi.openInPort(2);
  midi.openOutPort(2);

  //ontvang note, cc of pc-berichten
  midi.getMidiNote(function(note,vel,chan){
    console.log(note,vel,chan);
  });
  midi.getControlChange(function(ctl,val,chan) {
    console.log(ctl,val,chan);
  });
  midi.getPgmChange(function(pgm,chan) {
    console.log(pgm,chan);
  });
}

function draw() {
  //plaats hier de code die continue herhaald moet worden.
}

function keyPressed() {

  //verstuur note, cc of pc-berichten.
  if (key === 'a') {
    midi.sendMidiNote(60,127);
    setTimeout(_=> {
      midi.sendMidiNote(60,0);
    },1000)  
  }
  if (key === 'b') {
    midi.sendControlChange(75,61);
  }
  if (key === 'c') {
    midi.sendPgmChange(12);
  }
  
}