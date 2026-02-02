/* eslint-disable @typescript-eslint/no-unused-vars */
import { BaseDeviceAdapter } from "./base-adapter";
import type { DeviceCapabilities, CheckInPayload, AlertPayload } from "../types";

/**
 * IoT Screen adapter — OLED display + LED strip.
 * Muestra el avatar del Tamagotchi en pantalla OLED.
 * LED perimetral cambia de color según estado.
 *
 * TODO: Implementar
 * - ESP32 + SSD1306 OLED 1.3" (128x64) o ST7789 TFT color
 * - Bitmap del avatar convertido a formato OLED
 * - LED WS2812B strip perimetral (NeoPixel)
 * - Animaciones del avatar (parpadeo, movimiento)
 * - Botón táctil capacitivo para check-in
 * - Speaker piezo para alertas sonoras
 * - MQTT para sincronización de estado
 * - Carcasa tipo marco de fotos / mesita de noche
 */
export class IoTScreenAdapter extends BaseDeviceAdapter {
  readonly type = "iot-screen" as const;
  readonly capabilities: DeviceCapabilities = {
    canDisplayAvatar: true,
    canPlaySound: true, // buzzer/speaker
    canShowNotification: true, // OLED message
    canReceiveTouch: true, // capacitive touch
    canReceiveVoice: false,
    hasScreen: true,
    screenSize: "small",
  };

  protected async doSendCheckIn(_payload: CheckInPayload): Promise<boolean> {
    // TODO: Touch event via MQTT
    throw new Error("[iot-screen] Not implemented yet");
  }

  protected async doReceiveAlert(_payload: AlertPayload): Promise<void> {
    // TODO: Update OLED display + LED color via MQTT
    throw new Error("[iot-screen] Not implemented yet");
  }
}
