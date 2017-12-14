var client;
var server;
var x, y;

function setup() {
  createCanvas(640,480);
  background(255)
  client = new Client();
  client.startClient("127.0.0.1",8000);
  client.sendMessage("/address/test",500);

  server = new Server();
  server.startServer(8001);
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