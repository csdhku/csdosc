let serial;

function setup() {
  //plaats hier de code die maar één keer hoeft te worden uitgevoerd
  createCanvas(800,600);
  background(255);

  //creeër nieuw Serial object
  serial = new Serial();
  
  //laat alle beschikbare seriële devices zien
  serial.getPorts();

  //open de poort met het geslecteerde device
  serial.openPort("/dev/tty.usbmodem58476101",9600);
  
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