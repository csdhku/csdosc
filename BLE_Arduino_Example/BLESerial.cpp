// Copyright (c) Sandeep Mistry. All rights reserved.
// from https://github.com/sandeepmistry/arduino-BLEPeripheral/blob/master/examples/serial/
// Licensed under the MIT license. See LICENSE file in the project root for full license information.


#include "BLESerial.h"

// #define BLE_SERIAL_DEBUG

BLESerial* BLESerial::_instance = NULL;

BLESerial::BLESerial(unsigned char req, unsigned char rdy, unsigned char rst) :
#if defined(_VARIANT_ARDUINO_101_X_)
  BLEPeripheral()
#else
  BLEPeripheral(req, rdy, rst)
#endif
{
  this->_txCount = 0;
  this->_rxHead = this->_rxTail = 0;
  this->_flushed = 0;
  BLESerial::_instance = this;

  addAttribute(this->_uartService);
  addAttribute(this->_uartNameDescriptor);
  setAdvertisedServiceUuid(this->_uartService.uuid());
  addAttribute(this->_rxCharacteristic);
  addAttribute(this->_rxNameDescriptor);
  this->_rxCharacteristic.setEventHandler(BLEWritten, BLESerial::_received); //this->_rxCharacteristic.setEventHandler(BLEWritten, (void(*)(BLECentral&, BLECharacteristic&))NULL);
  addAttribute(this->_txCharacteristic);
  addAttribute(this->_txNameDescriptor);
}

void BLESerial::begin(...) {
  BLEPeripheral::begin();
  #ifdef BLE_SERIAL_DEBUG
    Serial.println(F("BLESerial::begin()"));
  #endif
}

void BLESerial::poll() {
  if (millis() < this->_flushed + 100) {
    BLEPeripheral::poll();
  } else {
    flush();
  }
}

void BLESerial::end() {
  this->_rxCharacteristic.setEventHandler(BLEWritten, (void(*)(BLECentral&, BLECharacteristic&))NULL); //this->_rxCharacteristic.setEventHandler(BLEWritten, NULL);
  this->_rxHead = this->_rxTail = 0;
  flush();
  BLEPeripheral::disconnect();
}

int BLESerial::available(void) {
#ifndef _VARIANT_ARDUINO_101_X_
  // TODO Need to do more testing to determine if all of these calls to BLEPeripheral::poll are
  // actually necessary. Seems to run fine without them, but only minimal testing so far.
  BLEPeripheral::poll();
#endif

  int retval = (this->_rxHead - this->_rxTail + sizeof(this->_rxBuffer)) % sizeof(this->_rxBuffer);
  #ifdef BLE_SERIAL_DEBUG
    Serial.print(F("BLESerial::available() = "));
    Serial.println(retval);
  #endif
  return retval;
}

int BLESerial::peek(void) {
#ifndef _VARIANT_ARDUINO_101_X_
  BLEPeripheral::poll();
#endif

  if (this->_rxTail == this->_rxHead) return -1;
  uint8_t byte = this->_rxBuffer[this->_rxTail];
  #ifdef BLE_SERIAL_DEBUG
    Serial.print(F("BLESerial::peek() = "));
    Serial.print((char) byte);
    Serial.print(F(" 0x"));
    Serial.println(byte, HEX);
  #endif
  return byte;
}

int BLESerial::read(void) {
#ifndef _VARIANT_ARDUINO_101_X_
  BLEPeripheral::poll();
#endif

  if (this->_rxTail == this->_rxHead) return -1;
  this->_rxTail = (this->_rxTail + 1) % sizeof(this->_rxBuffer);
  uint8_t byte = this->_rxBuffer[this->_rxTail];
  #ifdef BLE_SERIAL_DEBUG
    Serial.print(F("BLESerial::read() = "));
    Serial.print((char) byte);
    Serial.print(F(" 0x"));
    Serial.println(byte, HEX);
  #endif
  return byte;
}

void BLESerial::flush(void) {
  if (this->_txCount == 0) return;

#ifndef _VARIANT_ARDUINO_101_X_
  // ensure there are available packets before sending
  while(!this->_txCharacteristic.canNotify()) {
    BLEPeripheral::poll();
  }
#endif

  this->_txCharacteristic.setValue(this->_txBuffer, this->_txCount);
  this->_flushed = millis();
  this->_txCount = 0;
  BLEPeripheral::poll();
  #ifdef BLE_SERIAL_DEBUG
    Serial.println(F("BLESerial::flush()"));
  #endif
}

size_t BLESerial::write(uint8_t byte) {
#ifndef _VARIANT_ARDUINO_101_X_
  BLEPeripheral::poll();
#endif
  if (this->_txCharacteristic.subscribed() == false) return 0;
  this->_txBuffer[this->_txCount++] = byte;
  if (this->_txCount == sizeof(this->_txBuffer)) flush();
  #ifdef BLE_SERIAL_DEBUG
    Serial.print(F("BLESerial::write("));
    Serial.print((char) byte);
    Serial.print(F(" 0x"));
    Serial.print(byte, HEX);
    Serial.println(F(") = 1"));
  #endif
  return 1;
}

BLESerial::operator bool() {
  bool retval = BLEPeripheral::connected();
  #ifdef BLE_SERIAL_DEBUG
    Serial.print(F("BLESerial::operator bool() = "));
    Serial.println(retval);
  #endif
  return retval;
}

void BLESerial::_received(const uint8_t* data, size_t size) {
  for (size_t i = 0; i < size; i++) {
    this->_rxHead = (this->_rxHead + 1) % sizeof(this->_rxBuffer);
    this->_rxBuffer[this->_rxHead] = data[i];
  }
  #ifdef BLE_SERIAL_DEBUG
    Serial.print(F("BLESerial::received("));
    for (int i = 0; i < size; i++) Serial.print((char) data[i]);
    Serial.println(F(")"));
  #endif
}

void BLESerial::_received(BLECentral& /*central*/, BLECharacteristic& rxCharacteristic) {
  BLESerial::_instance->_received(rxCharacteristic.value(), rxCharacteristic.valueLength());
}
