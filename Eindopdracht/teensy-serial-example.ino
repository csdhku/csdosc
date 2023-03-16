elapsedMillis timer; //timer om om de zoveel tijd iets te doen
long frameCount = 0; //deze variabele telt hoeveel berichtjes er al verstuurd zijn

void setup() {
  // put your setup code here, to run once:
  //Zorg voor een corresponderende baut-rate hier met je laptop
  Serial.begin(9600);
}

void loop() {
  // put your main code here, to run repeatedly:
  //stuur iedere 500ms een getal naar de laptop
  if (timer > 500) { 
    frameCount ++; //tel een bij Framecount op zodat we steeds een ander getal doorsturen
    timer = 0; //reset de timer
    Serial.println("Framecount:" + String(frameCount));
  }

  //ontvang Serial op de Teensy
  if (Serial.available()) {
    //als er serial is, lees dat in de incomingByte variabele en stuur het terug over de Seriële verbinding
    byte incomingByte = Serial.read();
    Serial.println("got byte " + String(incomingByte));
  }
}
