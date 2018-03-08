byte freqBytes[4] = {255,0,0,48};
byte ampBytes[4] = {254,0,0,49};
byte btnBytes[3] = {254,0,50};
byte inBytes[4];

void setup() {
  // put your setup code here, to run once:
  pinMode(2,OUTPUT);
  pinMode(13,OUTPUT);
  pinMode(3,INPUT_PULLUP);
  Serial.begin(115200);
} 

void loop() {
  //ontvangen van seriele data, nog niet volledig uitgewerkt
  memset(inBytes,0,sizeof(inBytes));
  getSerial(inBytes);
  if (inBytes[0] == 211 && inBytes[3] == 12) {
    if (inBytes[2] >= 250) { 
      digitalWrite(2,HIGH);
    }
    else {
      digitalWrite(2,LOW);
    }
  }
  //send serial data
  int freqIn = analogRead(A0);
  freqBytes[1] = freqIn / 256;
  freqBytes[2] = freqIn % 256;
  Serial.write(freqBytes,4);
  int ampIn = analogRead(A1);
  ampBytes[1] = ampIn / 256;
  ampBytes[2] = ampIn % 256;
  Serial.write(ampBytes,4);
  int buttonIn = digitalRead(3);
  btnBytes[1] = buttonIn;
  Serial.write(btnBytes,3);
  delay(10);
}

//ontvangen van seriele data, nog niet volledig uitgewerkt
void getSerial(byte* inBytes) {
  int count = 0;
  while (count < 4) {
    if (Serial.available()){ 
      char c = Serial.read();
      inBytes[count] = c;
      count++;
    }
    else {
      return;
    }
  }
}

