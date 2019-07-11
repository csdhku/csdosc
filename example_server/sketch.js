/* Voorbeeld-sketch voor het gebruik van Open Sound Control in P5js - server
 * Deze sketch luistert naar berichten die worden gestuurd naar poort 9000.
 */

//aanmaken van de benodigde variabelen.
let server;
let connect
let x, y;

function setup() {
  createCanvas(640,480);

  //maak een connect-object aan dat zorgt voor de communicatie met oscServer.js
  connect = new Connect();
  
  //maak verbinding met oscServer.js, en voor code tussen {} uit zodra deze verbinding tot stand is gekomen.
  connect.connectToServer(function() {
    //maak een nieuw server-object aan.
    server = new Server();

    //start de server en zorg dat deze gaat luisteren naar poort 9000
    server.startServer(9000);

    //als de server een bericht ontvangt voert deze de functie oscReceiver uit en geeft deze twee argumenten mee: address en msg.
    server.getMessage(function(address,msg) {
      oscReceiver(address,msg);
    });
  });
  x = 100;
  y = 100;
}

function draw() {
  background(50,0,220);
  ellipse(x,y,25);
}

//de functie die aangeroepen wordt als er OSC-data binnenkomt
function oscReceiver(address,msg) {
  //als de variabele address gelijk is aan /y wordt de code tussen de {} uitegevoerd
  if (address === "/y") {
    y = msg;
  }
  //als de variabele address gelijk is aan /x wordt de code tussen de {} uitegevoerd
  else if (address == "/x") {
    x = msg;
  }
}
