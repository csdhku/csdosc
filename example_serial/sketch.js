var serial
var x, y;

function setup() {
  createCanvas(640,480);

  connect = new Connect();

  connect.connectToServer(function() {
    serial = new Serial();
    serial.connectSerial("64938323331351A02181",9600);
    serial.receiveSerial(function(lsb,hsb) {
      serialReceiver(lsb,hsb);
    })
  });

  x = 100;
  y = 100;
}

function draw() {
  background(220,0,50);
  ellipse(mouseX,mouseY,25);
}

function serialReceiver(lsb,hsb) {
  console.log(lsb,hsb);
}
