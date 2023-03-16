let serial;
let pgmState = 0;

//variabele om aan te geven welke poort je wilt gebruiken
//op Mac is dit vaak iets als "/dev/tty.usbmodem..."
//op Windows vaak "COM" met een cijfer erachter 
let port = "/dev/tty.usbmodem23211001"
function setup() {
  //plaats hier de code die maar één keer hoeft te worden uitgevoerd
  createCanvas(800,600);
  background(255);

  //creeër nieuw Serial object
  serial = new Serial();
  
  //laat alle beschikbare seriële devices zien
  serial.getPorts();

  //open de poort met het geslecteerde device
  serial.openPort(port,9600);
  
  //lees de seriële data en log naar de console
  serial.getSerialData(data => {
    console.log(data);
  });

  //stuur seriële data
  //stuur een berichtje "on" naar de teensy
  serial.sendSerialData("on");
  setTimeout(_ => {
    //stuur na 2 seconden een bericht "of naar de Teensy"
    //dit is alleen om te testen of je Seriële verbinding werkt
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
      console.log("Serial port is closed: " + port)
    }
    else if (pgmState === 1) {
      serial.openPort(port,9600);
      pgmState = 0;
      console.log("Serial port is open: " + port);
    }
  }
  if (key === 'f') {
    serial.sendSerialData('hallo!');
  }
}