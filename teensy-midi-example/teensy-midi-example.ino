elapsedMillis timer = 0; //timer om om de zoveel tijd iets te doen

void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);
  usbMIDI.setHandleNoteOn(myNoteOn);
  usbMIDI.setHandleNoteOff(myNoteOff);
  usbMIDI.setHandleControlChange(myControlChange);
}

void loop() {
  // put your main code here, to run repeatedly:
  if (timer > 500) {
    //iedere 500ms reset de timer
    timer = 0;
    //stuur een willekeurige midi noot naar je laptop over de USBMIDI verbinding
    usbMIDI.sendNoteOn(int(random(128)), 127, 0);
  }
}


//deze functies worden uitgevoerd als er MIDI op je Teensy binnenkomt
//iedere functie is voor een ander type MIDI bericht
void myNoteOn(byte channel, byte note, byte velocity) {
  Serial.println("Got note on at note: " + String(note) + " velocity: " + String(velocity) + " and channel: " + String(channel));
}

void myNoteOff(byte channel, byte note, byte velocity) {
  Serial.println("Got note off at note: " + String(note) + " velocity: " + String(velocity) + " and channel: " + String(channel));
}

void myControlChange(byte channel, byte control, byte value) {
  Serial.println("Got Control Change at control : " + String(control) + " value: " + String(value) + " and channel: " + String(channel));
}