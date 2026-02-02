import type { DeviceType, DeviceAdapter } from "../types";
import { SmartphoneAdapter } from "./smartphone";
import { SmartTvAdapter } from "./smart-tv";
import { IoTButtonAdapter } from "./iot-button";
import { IoTScreenAdapter } from "./iot-screen";
import { VoiceAssistantAdapter } from "./voice-assistant";
import { SmsIvrAdapter } from "./sms-ivr";

export { BaseDeviceAdapter } from "./base-adapter";
export { SmartphoneAdapter } from "./smartphone";
export { SmartTvAdapter } from "./smart-tv";
export { IoTButtonAdapter } from "./iot-button";
export { IoTScreenAdapter } from "./iot-screen";
export { VoiceAssistantAdapter } from "./voice-assistant";
export { SmsIvrAdapter } from "./sms-ivr";

/** Device registry — factory for creating adapters by type */
const DEVICE_REGISTRY: Record<DeviceType, new () => DeviceAdapter> = {
  smartphone: SmartphoneAdapter,
  "smart-tv": SmartTvAdapter,
  "iot-button": IoTButtonAdapter,
  "iot-screen": IoTScreenAdapter,
  "voice-assistant": VoiceAssistantAdapter,
  "sms-ivr": SmsIvrAdapter,
};

/** Create a device adapter by type */
export function createDevice(type: DeviceType): DeviceAdapter {
  const Adapter = DEVICE_REGISTRY[type];
  if (!Adapter) throw new Error(`Unknown device type: ${type}`);
  return new Adapter();
}

/** Get all supported device types */
export function getSupportedDevices(): DeviceType[] {
  return Object.keys(DEVICE_REGISTRY) as DeviceType[];
}
