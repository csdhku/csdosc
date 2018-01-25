var client;
var server;
var x, y;

function setup() {
  createCanvas(640,480);
  background(255)
  client = new Client();
  client.startClient("127.0.0.1",8000);
  console.log("haihai")
  x = 100;
  y = 100;
}

function draw() {
  background(255);
  ellipse(mouseX,mouseY,25);
}

function mouseMoved() {
  client.sendMessage("/x",mouseX);
  client.sendMessage("/y",mouseY);
}