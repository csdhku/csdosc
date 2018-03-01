var server;
var client;
var connect
var x, y;

function setup() {
  createCanvas(640,480);

  connect = new Connect();
  
  connect.connectToServer(function() {
    server = new Server();
    server.startServer(8000);
    server.getMessage(function(add,msg) {
      oscReceiver(add,msg);
    });

    client = new Client();
    client.startClient("127.0.0.1",8005);  
  });

  
  
  x = 100;
  y = 100;
}

function draw() {
  background(50,0,220);
  ellipse(x,y,25);
}

function oscReceiver(add,msg) {
  client.sendMessage("/received",msg);
  if (add === "/y") {
    y = msg;
  }
  else if (add == "/x") {
    x = msg;
  }
}
