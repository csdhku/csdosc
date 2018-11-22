# csdosc #

CSDOSC is een server gemaakt in Node.js die we gebruiken tijdens de lessen SYSBAS1A en SYSBAS1B. Het is een lokale webserver waarop je webpagina's kan draaien. Daarnaast heeft het functies voor Open Sound Control en seriële communicatie, te gebruiken in combinatie met P5.js.  

## Installatie MacOS ##
* Download of clone via de groene knop `Clone or download` alle bestanden van deze [github](https://github.com/csdhku/csdosc) naar je harde schijf en zet deze in de HKU/SYSBAS-map.
* Als je de bestanden gedownload hebt: pak de .zip-file uit en hernoem `csdosc-master` naar `csdosc`.
* Download node.js via [https://nodejs.org/en/download/](https://nodejs.org/en/download/) en installeer dit.
* Ga in de terminal naar de map waarin je de csdosc-bestanden hebt gezet (bijvoorbeeld `cd ~/HKU/SYSBAS/csdosc`) en typ hier:
`npm remove serialport`  
`npm install serialport`  
`npm rebuild`  

* Typ nu `node oscServer.js`.
* Je kunt de webserver nu gebruiken!

## Installatie Windows (met gebruik van Ubuntu) ##
* Ga naar de Sysbas-folder via het commando: `cd /mnt/c/Users/Jouwnaam/HKU/Sysbas` (of iets vergelijkbaars, afhankelijk van waar jouw HKU-bestanden staan op je harde schijf)
* Clone de bestanden van [github](https://github.com/csdhku/csdosc) naar je schijf met het volgende commando: `git clone https://github.com/csdhku/csdosc.git`
* Ga vervolgens naar de map die binnengehaald is: `cd csdosc`
* Installeer node-js door de volgende commando's in te typen:  
`sudo apt-get update`  
`sudo apt-get install nodejs`  
`sudo apt-get install npm`  
* Vervolgens moet je de osc-server app configureren voor jouw systeem:
* Voer daarvoor de volgende commando's in:  
`npm remove serialport`  
`npm install serialport`  
`npm rebuild`  

* Typ nu `node oscServer.js`
* Je kunt de webserver nu gebruiken!



## Gebruik ##
We gebruiken deze node-js server in eerste instantie als lokale webserver voor het weergeven van html-bestanden in de browser. Hiermee kunnen we p5js projecten bekijken. Overige functies als OSC-communicatie en Arduino-integratie komen later aan bod.

* Zodra je in de terminal `node oscServer.js` intypt start de node-js server en verschijnt er de volgende mededeling: `De server staat aan! Je kunt deze via localhost:8001 bereiken`.
* Dit betekent dat er nu een lokale webserver draait die luistert naar de poort 8001.
* Je kunt nu in jouw favoriete webbrowser naar localhost:8001 gaat zal er een tijdelijke website verschijnen.
* Je kunt vervolgens een nieuwe project starten: maak in de p5js map een nieuwe map genaamd `first_sketch` en kopieer de twee bestanden `index.html` en `sketch.js` uit `empty-example` naartoe.
* Ga nu in de browser naar `localhost:8001/first_sketch` en je zult hier een lege p5js sketch zien.
* Je kunt deze sketch vervolgens aanpassen naar jouw wensen.
* Maak voor elk nieuw project een nieuwe map en gebruik de voorbeelden uit `empty-example` als basis.
