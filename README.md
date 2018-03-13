# csdosc #

CSDOSC is een node.js server voor Open Sound Control en seriële
communcicatie die je kunt gebruiken in combinatie met P5.js.  

## Open Sound Control ##

### Hoe instaleren en configureren ###
* Download of clone alle bestanden naar je harde schijf en zet ze op een logische plaats. (bijvoorbeeld HKU/CSD/P5js/)
* Download node.js via https://nodejs.org/en/download/ en installeer dit.  
* Heb je windows? Zie het kopje hieronder. Heb je Mac, ga dan gewoon verder met de volgende stap.
* Open de terminal en ga naar de map waar je de bestanden hebt staan. (`cd ~/HKU/CSD/P5js/csdosc`)
* Typ: `node oscServer.js`
* Ga in de browser naar localhost:8001/example_server  
* Ga in een nieuw venster van je browser naar localhost:8001/example_client
* Als het goed is kun je nu het voorbeeld bekijken.

### Heb je windows? Doe eerst deze stappen ###
* Voeg node aan je path toe. Dat doe je zo:
    * zoek waar de node.exe staat. (Meestal `C:\Program Files\nodejs` (voor 64Bit) of `C:\Program Files (x86)\nodejs` (voor 32Bit))
    * Kopieer dit adres
    * Open een Verkenner venster en doe een rechtermuisklik op `This PC`
    * Kies `Properties` -> `Advanced system settings` -> `Environment Variables`
    * Selecteer Path uit het vakje van `User Variables for <name>`
    * Druk op `Edit`
    * Druk op `New`
    * Plak nu het adres van node in de lege regel
    * Druk `OK`
* Ga nu verder waar je was bij het bovenste kopje


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
Met deze OSC-library kun je zowel een server als een client aanmaken.

In het index.html-bestand moet je de volgende extra regels invoeren bovenop de gebruikelijke P5-libraries:

~~~
<script src="../Library/socket_io.js"></script>
<script src="../oscLib.js"></script>
~~~

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

## Seriële communicatie (voor Arduino en Teensy) ##

### Installeren en configureren ###

#### MacOS ####
* Download de nieuwste versie van de csdosc: klik hierboven op 'clone or download' en dan op download zip.
* Pak het zip-bestand uit en vervang de bestanden uit de csdosc-map die al op je computer staat met de nieuwe. 
* Open de terminal en ga naar de csdosc-map (```cd ~/Path/to/csdosc```)
* Typ: ```npm rebuild```, hiermee installeer je de benodigde bibliotheek voor seriële communicatie
* Plug de usb-kabel van de Teensy in.
* Typ vervolgens ```node oscServer.js``` en de server zal starten. 
* In de terminal zie je vervolgens een lijst met serienummers van verbonden apparaten. Dit ziet er bijvoorbeeld als volgt uit:  
~~~
Serial Devices:
id: undefined
id: 2216420
~~~
* Elke Arduino of Teensy heeft een eigen, uniek serienummer. Dit nummer is in het terminalvenster te zien. Als je meerdere serienummers ziet moet je de Teensy even ontkoppelen, de server even afsluiten (ctrl+c) en opnieuw starten (pijltje omhoog + enter). Er zal nu een serienummer verdwenen zijn. Daarna verbind je de Teensy weer en sluit je de server en start je deze opnieuw op. Het nummer dat nu weer verschijnt is het serienummer van de Teensy.
* Hoe je hier vervolgens data van ontvangt of naar verstuurt staat hieronder beschreven. 

#### Windows ####
* Download de nieuwste versie van de csdosc: klik hierboven op 'clone or download' en dan op download zip.
* Pak het zip-bestand uit en vervang de bestanden uit de csdosc-map die al op je computer staat met de nieuwe. 
* Open de terminal als administrator (typ in het zoekvenster rechtsonder cmd en klik daar met je rechtermuisknop op. Kies vervolgens _open as administrator_).
* Ga naar de csdosc-map (```cd ~/Path/to/csdosc```)
* Installeer de _Window Build Tools_ met het volgende commando: ```npm install -g windows-build-tools```. Dit kan ±10 minuten duren. 
* Typ nu: ```npm rebuild```, hiermee installeer je de benodigde bibliotheek voor seriële communicatie
* Plug de usb-kabel van de Teensy in.
* Typ vervolgens ```node oscServer.js``` en de server zal starten. 
* In de terminal zie je vervolgens een lijst met serienummers van verbonden apparaten. Dit ziet er bijvoorbeeld als volgt uit:  
~~~
Serial Devices:
id: undefined
id: 2216420
~~~
* Elke Arduino of Teensy heeft een eigen, uniek serienummer. Dit nummer is in het terminalvenster te zien. Als je meerdere serienummers ziet moet je de Teensy even ontkoppelen, de server even afsluiten (ctrl+c) en opnieuw starten (pijltje omhoog + enter). Er zal nu een serienummer verdwenen zijn. Daarna verbind je de Teensy weer en sluit je de server en start je deze opnieuw op. Het nummer dat nu weer verschijnt is het serienummer van de Teensy.
* Hoe je hier vervolgens data van ontvangt of naar verstuurt staat hieronder beschreven. 

### Code gebruiken ###

In het index.html-bestand moet je de volgende extra regels invoeren bovenop de gebruikelijke P5-libraries:

~~~
<script src="../Library/socket_io.js"></script>
<script src="../oscLib.js"></script>
~~~

#### Initialisatie ####
Om gebruik te maken van de library moet je, net als bij _Open Sound Control_, eerst verbinding maken met deze library. Hiervoor is de volgende code nodig:
~~~
var serial
var connect

function setup() {
  createCanvast(800,600);
  connect = new Connect();
  connect.connectToServer(function() {

  });
}

function draw() {

}
~~~
Met connectToServer wordt er een verbindig gemaakt met de library en zodra deze verbindig gemaakt is wordt alles wat tussende daaropvolgende _function() {}_ staat uitgevoerd.  
De verbinding met de seriele poort wordt gemaakt door de volgende code uit te voeren:
~~~ 
serial = new Serial;
serial.connectSerial("2216420",115200);
~~~
Het eerste getal dat je als argument meegeeft aan de connectSerial-functie is het serienummer van de Teensy. Je ziet hierboven hoe je dat nummer kunt vinden.  
Het tweede getal is de baudrate, de snelheid waarmee jouw computer met de Teensy communiceert.  

#### Berichten verzenden ####
Je kunt met deze serial-library zowel berichten ontvangen van je Teensy als berichten verzenden naar je Teensy. Het verzenden van berichten werkt als volgt:  
Een seriële poort verstuurt, zoals de naam doet vermoeden, berichten één voor één. Als je dus bijvoorbeeld de getallen _15, 90 en 12_ wil verzenden zal eerst de 15 worden verzonden, daarna de 90 en daarna de 12. Als je vervolgens een nieuw bericht wil sturen, bijvoobeeld: _18, 11, 64 en 77_, moet er op de één of andere manier duidelijk worden waar het eerste bericht eindigt en waar het tweede bericht begint.  
Om dit duidelijk te maken zetten we aan het begin en aan het eind van de reeks getallen die we willen versturen een getal dat dient als identifier. Dus ons eerste bericht ziet er dan zo uit: ```[255,15,90,12,1]```. Voor het tweede bericht gebruiken we twee andere getallen die als identifier dienen: ```[254,18,11,64,77,2]```. Aangezien je maximaal één byte per keer kan versturen en grootste getal dat in byte past 255 is, zullen de getallen die je kunt verzenden niet groter zijn dan 255. Ook de identifiers die aan het begin en eind van een bericht staan kunnen niet groter zijn dan 255.  
Voor elke functie op de Teensy (het aan- of uitzetten van een motor, led of iets dergelijks) gebruik je een nieuwe unieke identifier.  
Eén van de twee identifier-getallen moet anders zijn dan bij de andere berichten. Dus je kunt prima voor elk bericht hetzelfde begingetal gebruiken, zolang je dan maar een ander eindgetal gebruikt.  
Met de volgende code kun je een bericht versturen naar de Teensy:
~~~
serial.sendSerial([254,18,11,64,77]);
~~~
Houdt er rekening mee dat als je berichten verstuurt in de draw-loop, deze berichten met de snelheid van de framerate worden verstuurd. Dit kan de Teensy niet altijd even goed aan. Zorg er dus voor dat er alleen berichten worden verstuurd als er iets verandert in de code.

#### Berichten ontvangen ####

Om berichten te ontvangen moet je opnieuw gebruik maken van unieke identifier-nummers om duidelijk te krijgen welke functie je bericht heeft, of het bijvoorbeeld data van een potmeter is, van een LDR of van een bewegingssensor.  
De code voor het ontvangen van berichten plaats je in de setup(), in de connect-functie en ziet er alsvolgt uit:

~~~
serial.receiveSerial([255,null,null,49],function(result) {
  receiveData(result);
});
~~~

Op de plaats van de null komt een variabel getal dat door de Teensy wordt verzonden
Buiten de setup en draw functie kun je vervolgens een functie maken waarin je de data verwerkt. De identifier-nummers worden door de library weggefilterd, dus in _result_ komt een array te staan met de lengte van het aantaal nulls dat je hebt opgegeven.

~~~
function receiveData(result) {
  x = (result[0]*256)+result[1];
}
~~~

### Complete code ###
Een voorbeeld van een volledig werkende code voor het versturen en ontvangen van data van een Teensy of Arduino staat hieronder:
~~~
var serial
var connect
var x = 0;
function setup() {
  createCanvast(800,600);
  connect = new Connect();
  connect.connectToServer(function() {
    serial = new Serial;
    serial.connectSerial("2216420",115200);
    serial.receiveSerial([255,null,null,49],function(result) {
      receiveData(result);
    });
  });
}

function draw() {
  background(255);
  ellipse(x,10,25);
}

function receiveData(result) {
  x = (result[0]*256)+result[1];
}

function mousePressed() {
  serial.sendSerial([254,18,11,64,77]);
}
~~~



#### getallen groter dan 255 versturen ####

Omdat er maximaal een byte per keer kan worden verzonden en ontvangen moet er een manier worden verzonnen om getallen groter dan 255 te versturen. Om dit te doen kun je in de Arduino-code een getal dat groter is dan 255 op de volgende manier onderverdelen in twee getallen:
~~~
byte sendBytes = [255,0,0,49];
int sendBytes[1] = x / 256;
int sendBytes[2] = x % 256;
Serial.write(sendBytes,4);
~~~
In de javascript-code vermenigvuldig je vervolgens het eerste getal met 256 en tel je daar het tweede getal bij op.  

