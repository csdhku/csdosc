let serial;
let pgmState = 0;
function setup() {
  //plaats hier de code die maar één keer hoeft te worden uitgevoerd
  createCanvas(800,600);
  background(255);

  //creeër nieuw Serial object
  serial = new Serial();
  
  //laat alle beschikbare seriële devices zien
  serial.getPorts();

  //open de poort met het geslecteerde device
  serial.openPort("/dev/tty.usbmodem23211001",9600);
  
  //lees de seriële data en log naar de console
  serial.getSerialData(data => {
    console.log(data);
  });

  //stuur seriële data
  serial.sendSerialData("on");
  setTimeout(_ => {
    serial.sendSerialData("off");
  },2000)
}

function draw() {
  //plaats hier de code die continue herhaald moet worden.
}

function keyPressed() {
  //als op je spatie drukt, wordt de poort gesloten of geopend
  //zodat je makkelijk kan programmeren.
  if (key === ' ') {
    if (pgmState === 0) {
      serial.closePort();
      pgmState = 1;
      console.log("serial port is closed")
    }
    else if (pgmState === 1) {
      serial.openPort("/dev/tty.usbmodem23211001",9600);
      pgmState = 0;
      console.log("serial port is open");
    }
  }
}