/* eslint-disable @typescript-eslint/no-unused-vars */
import { BaseDeviceAdapter } from "./base-adapter";
import type { DeviceCapabilities, CheckInPayload, AlertPayload } from "../types";

/**
 * IoT Button adapter — ESP32 WiFi/BLE physical button.
 * Un solo botón grande = check-in. LED de color = estado.
 *
 * TODO: Implementar
 * - ESP32 firmware (Arduino/PlatformIO)
 * - WiFi provisioning (SmartConfig o BLE)
 * - MQTT publish on button press
 * - LED RGB: verde=ok, amarillo=esperando, rojo=alerta
 * - Deep sleep entre check-ins (battery saving)
 * - OTA firmware updates
 * - Carcasa impresión 3D con forma de patita/corazón
 */
export class IoTButtonAdapter extends BaseDeviceAdapter {
  readonly type = "iot-button" as const;
  readonly capabilities: DeviceCapabilities = {
    canDisplayAvatar: false,
    canPlaySound: false, // TODO: buzzer pequeño
    canShowNotification: false, // solo LED
    canReceiveTouch: true, // botón físico
    canReceiveVoice: false,
    hasScreen: false,
    screenSize: "none",
  };

  protected async doSendCheckIn(_payload: CheckInPayload): Promise<boolean> {
    // TODO: Recibir via MQTT desde ESP32
    // topic: dame-un-ok/{userId}/checkin
    throw new Error("[iot-button] Not implemented yet");
  }

  protected async doReceiveAlert(_payload: AlertPayload): Promise<void> {
    // TODO: Enviar color LED via MQTT
    // topic: dame-un-ok/{userId}/led
    // payload: { color: "red", blink: true }
    throw new Error("[iot-button] Not implemented yet");
  }
}
