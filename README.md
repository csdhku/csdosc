# csdosc #

CSDOSC is een node.js server voor Open Sound Control en seriële
communcicatie die je kunt gebruiken in combinatie met P5.js.  

## Open Sound Control##

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

## Seriële communicatie (voor Arduino en Teensy)##

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

### Code Gebruiken ###