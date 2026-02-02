/** Device adapter types — ramificaciones para todos los dispositivos */

export type DeviceType =
  | "smartphone"
  | "smart-tv"
  | "iot-button"
  | "iot-screen"
  | "voice-assistant"
  | "sms-ivr";

export interface DeviceCapabilities {
  canDisplayAvatar: boolean;
  canPlaySound: boolean;
  canShowNotification: boolean;
  canReceiveTouch: boolean;
  canReceiveVoice: boolean;
  hasScreen: boolean;
  screenSize: "none" | "small" | "medium" | "large";
}

export interface CheckInPayload {
  userId: string;
  deviceType: DeviceType;
  timestamp: Date;
  actions: string[]; // ["alimentar", "mimar", "jugar"]
}

export interface AlertPayload {
  userId: string;
  nivel: string;
  message: string;
  timestamp: Date;
}

/**
 * Base interface for all device adapters.
 * Every new device (TV, IoT, voice...) implements this.
 */
export interface DeviceAdapter {
  readonly type: DeviceType;
  readonly capabilities: DeviceCapabilities;

  /** Initialize the device connection */
  initialize(): Promise<void>;

  /** Send a check-in from this device */
  sendCheckIn(payload: CheckInPayload): Promise<boolean>;

  /** Receive and display an alert on this device */
  receiveAlert(payload: AlertPayload): Promise<void>;

  /** Cleanup/disconnect */
  dispose(): Promise<void>;
}
