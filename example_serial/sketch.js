var serial
var x, y;
var send = 0;
var osc;
var freq;
var amp;
var oscChange = 0;

function setup() {
  createCanvas(windowWidth,windowHeight);
  frameRate(25);
  connect = new Connect();

  connect.connectToServer(function() {
    serial = new Serial();
    //vul hier device id en baudrate in, device id verschijnt in terminal-window
    serial.connectSerial("2216420",115200);

    //luister naar serial-berichten en ontvang de lijsten die beginnen met 255
    //en eindigen met 48 de null kan elke waarde zijn.
    serial.receiveSerial([255,null,null,48],function(result) {
      serialReceiver(result);
    });
    //luister naar serial-berichten en ontvang de lijsten die beginnen met 254
    //en eindigen met 49 de null kan elke waarde zijn.
    serial.receiveSerial([254,null,null,49],function(result) {
      serialReceiverTwo(result);
    });
    serial.receiveSerial([254,null,50],function(result) {
      buttonIn(result);
    });
  });
  freq = 220;
  amp = 0.1;
  osc = new p5.Oscillator();
  osc.setType('triangle');
  osc.amp(amp);
  osc.start();

  x = 100;
  y = 100;
}

function draw() {
  if (serial) {
    background(x/4,y/4,255-(x/4));
    ellipse(x,y,25);
    if (mouseX > windowWidth/2) {
      if (send == 0) {
        serial.sendSerial([211,0,250,12]);
        send = 1;
      }
    }
    else {
      if (send == 1) {
        serial.sendSerial([211,0,0,12]);
        send = 0;
      }
    }
  }
}

function serialReceiver(result) {
  x = (result[0]*256)+result[1];
  x = map(x,0,1024,0,windowWidth);
  freq = map(x,0,1024,220,440);
  osc.freq(freq);
  // console.log(result[0],result[1]);
}

function serialReceiverTwo(result) {
  y = (result[0]*256)+result[1];
  y = map(y,0,1024,0,windowHeight);
  amp = map(y,0,1024,0.0,0.5);
  osc.amp(amp);
}

function buttonIn(result) {
  if (result == 1) {
    if (oscChange == 0) {
      osc.stop();
      oscChange = 1;  
    }
  }
  if (result == 0) {
    if (oscChange == 1) {
      osc.start();  
      oscChange = 0;
    }
  }
}