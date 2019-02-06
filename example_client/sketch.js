/* voorbeeld-sketch voor het gebruik van Open Sound Control in P5js - client
 * Deze sketch stuurt berichten naar het IP-adres 127.0.0.1 en poort 9000
 */

//aanmaken van de benodigde variabelen.
let client;
let connect;
let x, y;

function setup() {
  createCanvas(640,480);
  //maak een connect-object aan dat zorgt voor de communicatie met oscServer.js
  connect = new Connect();

  //maak verbinding met oscServer.js, en voer code tussen {} uit zodra deze verbinding tot stand is gekomen.
  connect.connectToServer(function() {
    //maak een nieuwe client-object aan.
    client = new Client();

    //start de client en laat deze berichten sturen naar het ip-adres 127.0.0.1 en poort 9000
    client.startClient("127.0.0.1",9000); 
  });

  x = 100;
  y = 100;
}

function draw() {
  background(220,0,50);


  //laat een ellipse zien op de positie van de muiscursor.
  ellipse(mouseX,mouseY,25);
}

function mouseMoved() {
  //stuur een bericht naar het adres /x met als waarde de x-positie van de muis
  client.sendMessage("/x",mouseX);

  //stuur een bericht naar het adres /y met als waarde de y-positie van de muis.
  client.sendMessage("/y",mouseY);
}