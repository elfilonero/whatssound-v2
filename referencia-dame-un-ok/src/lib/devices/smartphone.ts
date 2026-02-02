import { BaseDeviceAdapter } from "./base-adapter";
import type { DeviceCapabilities, CheckInPayload, AlertPayload } from "../types";

/**
 * Smartphone adapter — MVP implementation.
 * Uses web push notifications and the React UI.
 */
export class SmartphoneAdapter extends BaseDeviceAdapter {
  readonly type = "smartphone" as const;
  readonly capabilities: DeviceCapabilities = {
    canDisplayAvatar: true,
    canPlaySound: true,
    canShowNotification: true,
    canReceiveTouch: true,
    canReceiveVoice: false,
    hasScreen: true,
    screenSize: "medium",
  };

  protected async doSendCheckIn(payload: CheckInPayload): Promise<boolean> {
    // TODO: Send check-in to Supabase
    // await supabase.from('check_ins').insert(payload);
    void payload;
    return true;
  }

  protected async doReceiveAlert(payload: AlertPayload): Promise<void> {
    // TODO: Show push notification
    // await Notification.requestPermission();
    // new Notification("Dame un Ok", { body: payload.message });
    void payload;
  }
}
