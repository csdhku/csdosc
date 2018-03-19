byte freqBytes[4] = {255,0,0,48}; //een array met waardes om te verzenden, met een startbyte en een stopbyte ter indificatie, in het midden ruimte voor twee variabele waardes
byte ampBytes[4] = {254,0,0,49}; //nog een array, met andere start- en stopbytes
byte btnBytes[3] = {254,0,50}; //een derde array, dit keer met maar 1 variabele waarde tussen de start- en stopbytes. 
byte inBytes[4]; // een lege array van 4 bytes waar seriële input in opgeslagen worden

void setup() {
  // Alles wat binnen deze accolades staat wordt een keer uitgevoerd
  pinMode(2,OUTPUT); //maakt van digitale pin 2 een output
  pinMode(13,OUTPUT); //maakt van digitale pin 13 (standaard ingebouwde led) een output
  pinMode(3,INPUT_PULLUP); //maakt van digitale pin 3 een input, met pullupweerstand (https://learn.sparkfun.com/tutorials/pull-up-resistors)
  Serial.begin(115200); //start seriële communicatie en zet de baudrate op 115200
} 

void loop() {
  //Alles binnen deze accolades wordt in een loop uitgevoerd.
  
  //ontvangen van seriele data: vanuit P5js of Max kan data naar de Arduino of Teensy worden verstuurd.
  memset(inBytes,0,sizeof(inBytes)); //de lijst voor inkomende data wordt hier leeggemaakt, zodat eventuele vorige data niet opnieuw kan worden gebruikt
  getSerial(inBytes); //roep de functie getSerial aan, met als argument de lijst waarin de data moet worden opgeslagen. 

  //verwerk de binnengekomen data. 
  if (inBytes[0] == 211 && inBytes[3] == 12) { //als de eerste byte overeenkomt met 211 én de laatste met 12 dan:
    if (inBytes[2] >= 250) { //als de 3e byte groter is dan 250 dan:
      digitalWrite(2,HIGH); //zet de digitale poort 2 op hoog, waarmee er 5V(Arduino) of 3.3V(Teensy) wordt uitgestuurd en er dus (bijvoorbeeld) een LED aan gaat
    }
    else { //zo niet dan:
      digitalWrite(2,LOW); //zet de digitale poort 2 op laag, zodat de LED uitgaat, omdat er geen stroom meer loopt 
    }
  }
  
  //Het verzenden van seriële data:
  int freqIn = analogRead(A0); //lees de waarde van de analoge pin 0
  freqBytes[1] = freqIn / 256; //deel deze waarde door 256 en sla deze op in de 2e byte van de boven aangemaakte array
  freqBytes[2] = freqIn % 256; //genereer modulo 256 van deze waarde en sla deze op in de 3e byte van de boven aangemaakte array
  Serial.write(freqBytes,4); //vestuur de array, eerste argument is de arraynaam, tweede is de lengte van de array
  int ampIn = analogRead(A1);
  ampBytes[1] = ampIn / 256;
  ampBytes[2] = ampIn % 256;
  Serial.write(ampBytes,4);
  int buttonIn = digitalRead(3); //lees de waarde van digitale pin 3
  btnBytes[1] = buttonIn;
  Serial.write(btnBytes,3); //verstuur deze waarde, als het resultaat hoog is wordt er een 1 verstuurd, als ie laag is een 0
  delay(10); //wacht 10 miliseconden voordat het programma verder gaat.
}

//Deze functie zorgt dat de seriële data gelezen wordt.
void getSerial(byte* inBytes) { 
  int count = 0; //initieer een variabele die bijhoudt hoeveel bytes er zijn binengekomen.
  while (count < sizeof(inBytes)) { // zolang deze variabele kleiner is dan het aantal te ontvangen bytes:
    if (Serial.available()){  // als er seriële data binnenkomt:
      char c = Serial.read(); // sla deze data op in een variabele
      inBytes[count] = c; //voeg deze variabele toe aan de array
      count++; //verhoog de counter met 1
    }
    else { //als de counter hoger dan of gelijk is aan het verwachte aantal bytes:
      return; //stop deze functie en ga terug naar de loop.
    }
  }
}

