var ble;
var x = 0;

function setup() {
  createCanvas(windowWidth,windowHeight);
  frameRate(25);
  connect = new Connect();

  connect.connectToServer(function() {

    ble = new Bluetooth();

    ble.connectBluetooth();

    ble.receiveBluetooth(function(data) {
      x = data;
    });
  });
}

function draw() {
 background(255);
 ellipse(x,10,10); 
}