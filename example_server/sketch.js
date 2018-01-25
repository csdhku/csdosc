var server;
var x, y;

function setup() {
  createCanvas(640,480);
  background(255)

  server = new Server();
  server.startServer(8000);
  server.getMessage(function(add,msg) {
    oscReceiver(add,msg);
  });
  
  x = 100;
  y = 100;
}

function draw() {
  background(255);
  ellipse(x,y,25);
}

function oscReceiver(add,msg) {
  if (add === "/y") {
    y = msg;
  }
  else if (add == "/x") {
    x = msg;
  }
}