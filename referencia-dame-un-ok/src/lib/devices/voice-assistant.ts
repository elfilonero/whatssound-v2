/* eslint-disable @typescript-eslint/no-unused-vars */
import { BaseDeviceAdapter } from "./base-adapter";
import type { DeviceCapabilities, CheckInPayload, AlertPayload } from "../types";

/**
 * Voice Assistant adapter — Alexa / Google Home.
 * "Alexa, dile a Dame un Ok que estoy bien"
 *
 * TODO: Implementar
 * - Alexa Skill (ASK SDK, Lambda)
 * - Google Action (Dialogflow / Actions SDK)
 * - Invocation: "Dame un Ok" / "Give Me an Ok"
 * - Intents: CheckIn, Status, Help
 * - Proactive notifications (Alexa Proactive Events API)
 * - Multi-language: ES, EN
 * - Sound effects for avatar mood
 */
export class VoiceAssistantAdapter extends BaseDeviceAdapter {
  readonly type = "voice-assistant" as const;
  readonly capabilities: DeviceCapabilities = {
    canDisplayAvatar: false, // solo voz (Echo Show sí tiene pantalla)
    canPlaySound: true,
    canShowNotification: true, // proactive notification
    canReceiveTouch: false,
    canReceiveVoice: true,
    hasScreen: false, // base case; Echo Show override
    screenSize: "none",
  };

  protected async doSendCheckIn(_payload: CheckInPayload): Promise<boolean> {
    // TODO: Webhook from Alexa/Google → API
    throw new Error("[voice-assistant] Not implemented yet");
  }

  protected async doReceiveAlert(_payload: AlertPayload): Promise<void> {
    // TODO: Proactive notification via Alexa/Google API
    throw new Error("[voice-assistant] Not implemented yet");
  }
}
