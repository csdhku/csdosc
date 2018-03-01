var client;
var server;
var connect;
var x, y;

function setup() {
  createCanvas(640,480);

  connect = new Connect();

  connect.connectToServer(function() {
    client = new Client();
    client.startClient("127.0.0.1",8015);

    server = new Server();
    server.startServer(8025);
    server.getMessage(function(add,msg) {
      oscReceiver(add,msg);
    });  
  });
  

  x = 100;
  y = 100;
}

function draw() {
  background(220,0,50);
  ellipse(mouseX,mouseY,25);
}

function mouseMoved() {
  client.sendMessage("/x",mouseX);
  client.sendMessage("/y",mouseY);
}

function oscReceiver(add,msg) {
  console.log(add,msg);
}
