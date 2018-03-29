#include <Arduino.h>
#include <CurieBLE.h>
#include <BLEPeripheral.h>
#include "BLESerial.h"
int counter = 0;
BLESerial ble = BLESerial();

void setup() {
  // put your setup code here, to run once:
  BLEsetup();
}

void loop() {
  if (counter == 255) {
    counter = 0;
  }
  else {
    counter++;
  }
  // put your main code here, to run repeatedly:
  delay(10);
  ble.println(counter);
}

void BLEsetup() {
  ble.setLocalName("CurieBot");
  ble.begin();
}
