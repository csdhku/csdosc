# csdosc #

CSDOSC is een node.js OSC-server die je kunt gebruiken in combinatie met P5.js.  

### hoe dan? ###
* Download of clone alle bestanden naar je harde schijf en zet ze op een logische plaats. (bijvoorbeeld HKU/CSD/P5js/)
* Download node.js via https://nodejs.org/en/download/ en installeer dit.  
* Open de terminal en ga naar de map waar je de bestanden hebt staan. (`cd ~/HKU/CSD/P5js/csdosc`)
* Typ: `node oscServer.js`
* Ga in de browser naar localhost:8001/example_server  
* Ga in een nieuw venster van je browser naar localhost:8001/example_client
* Als het goed is kun je nu het voorbeeld bekijken.

### heb je windows? Doe eerst deze stappen ###
* Voeg node aan je path toe:
    * zoek waar de node.exe staat. (Meestal C:\Program Files\nodejs (voor 64Bit) of C:\Program Files (x86)\nodejs (voor 32Bit))
    * Kopieer dit adres
    * Open een Verkenner venster en doe een rechtermuisklik op This PC
    * Kies Properties -> Advanced system settings -> Environment Variables
    * Selecteer Path uit het vakje van "User Variables for <name>"
    * Druk op "Edit"
    * Druk op "New"
    * Plak nu het adres van node in de lege regel
    * Druk "OK"



### voorbeeld ###
Als je in de example_client je muis beweegt, zal het balletje in
example_server meebewegen.

### osc sturen naar P5.js ###
* Open een programma dat OSC kan versturen
* stuur de volgende berichten naar poort 8000 op dezelfde computer als waar node draait:
    * /x 10
    * /y 1
* het balletje in de browser zal nu bewegen.

### code gebruiken ###
Met deze OSC-library kun je zowel een server als een client aanmaken

#### Server ####
De server kan berichten ontvangen. Voor het aanmaken van een server hoef je alleen maar het poortnummer op te geven waarop je data wil ontvangen

~~~
connect = new Connect(); //maak een nieuw connect-object
connect.connectToServer(function() { //maak een verbinding met de OSC-bibliotheek
  server = new Server(); //maak een nieuw server-object
  server.startServer(8000); // start de server op poort 8000
  server.getMessage(function(add,msg) {
    oscReceiver(add,msg); //een ontvangen OSC-bericht wordt doorgestuurd naar de oscReceiver functie
  });
});
~~~

De oscReceiver functie ziet er bijvoorbeeld als volgt uit:

~~~
function oscReceiver(add,msg) { //argumenten zijn adres en bericht
  if (add === "/y") { // als het adres gelijk is aan /y, maak de variabele y gelijk aan het binnenkomende bericht
    y = msg;
  }
  else if (add == "/x") {
    x = msg;
  }
}
~~~

#### Client ####
De client kan berichten verzenden, naar een andere P5js server of naar een
ander programma dat OSC kan ontvangen. (Max, Supercollider, PureData etc.)

~~~
connect = new Connect(); //maak een nieuw connect-object
connect.connectToServer(function() { //maak een verbinding met de OSC-bibliotheek
  client = new Client(); //maak een nieuw client-object
  client.startClient("127.0.0.1",8000); //start de client, verzend naar ip-adres 127.0.0.1 en poort 8000
});
~~~

Je kunt vervolgens met de volgende code berichten sturen naar een server:

~~~
client.sendMessage("/x",15); //"/x" is het adres, 15 is het bericht.  
~~~
