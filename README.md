# csdosc #

CSDOSC is een node.js OSC-server die je kunt gebruiken in combinatie met P5.js.  

### hoe dan? ###
* Download of clone alle bestanden naar je harde schijf en zet ze op een logische plaats.  
* Download node.js via https://nodejs.org/en/download/ en installeer dit.  
* Open de terminal en ga naar de map waar je de bestanden hebt staan.  
* Typ: node oscServer.js  
* Ga in de browser naar localhost:8001/example/index.html  
* Als het goed is kun je nu het example bekijken.  

### osc sturen naar P5.js ###
* Open een programma dat OSC kan versturen
* stuur de volgende berichten: 
    * /x 10 
    * /y 1
* het balletje in de browser zal nu bewegen.

### code gebruiken ###
Met deze OSC-library kun je zowel een server als een client aanmaken

#### Server ####
De server kan berichten ontvangen. Voor het aanmaken van een server hoef je alleen maar het poortnummer op te geven waarop je data wil ontvangen

~~~
server = new Server(); // maak een nieuw server-object
server.startServer(8001); // start de server op een bepaalde poort
server.getMessage(function(add,msg) { // als er een bericht binnenkomt, roep dan de oscReceiver functie aan
  oscReceiver(add,msg);
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


