var serial
var x, y;

function setup() {
  createCanvas(640,480);
  frameRate(25);
  connect = new Connect();

  connect.connectToServer(function() {
    serial = new Serial();
    //vul hier device id en baudrate in, device id verschijnt in terminal-window
    serial.connectSerial("64938323331351A02181",115200);

    //luister naar serial-berichten en ontvang de lijsten die beginnen met 255
    //en eindigen met 48 de null kan elke waarde zijn.
    serial.receiveSerial([255,null,null,48],function(result) {
      serialReceiver(result);
    });
    //luister naar serial-berichten en ontvang de lijsten die beginnen met 254
    //en eindigen met 49 de null kan elke waarde zijn.
    serial.receiveSerial([254,null,null,null,49],function(result) {
      serialReceiverTwo(result);
    });
  });

  x = 100;
  y = 100;
}

function draw() {
  if (serial) {
    background(220,0,50);
    ellipse(mouseX,mouseY,25);
  }
}

function serialReceiver(result) {
  console.log(result[0],result[1]);
}

function serialReceiverTwo(result) {
  console.log(result[0],result[1]);
}