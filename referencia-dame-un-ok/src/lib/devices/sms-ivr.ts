/* eslint-disable @typescript-eslint/no-unused-vars */
import { BaseDeviceAdapter } from "./base-adapter";
import type { DeviceCapabilities, CheckInPayload, AlertPayload } from "../types";

/**
 * SMS/IVR adapter — Twilio fallback.
 * Para usuarios sin smartphone: SMS diario + llamada IVR.
 * "Pulse 1 si está bien, 2 si necesita ayuda"
 *
 * TODO: Implementar
 * - Twilio SMS API (envío diario de recordatorio)
 * - Twilio Voice API (IVR con TwiML)
 * - Respuesta SMS "OK" = check-in
 * - IVR: tecla 1 = ok, tecla 2 = necesito ayuda
 * - Escalado si no responde SMS ni llamada
 * - Webhook para recibir respuestas
 * - Rate limiting y coste por mensaje
 * - Premium feature (SMS tiene coste)
 */
export class SmsIvrAdapter extends BaseDeviceAdapter {
  readonly type = "sms-ivr" as const;
  readonly capabilities: DeviceCapabilities = {
    canDisplayAvatar: false,
    canPlaySound: false,
    canShowNotification: false,
    canReceiveTouch: false, // keypad digits
    canReceiveVoice: true, // IVR voice response
    hasScreen: false,
    screenSize: "none",
  };

  protected async doSendCheckIn(_payload: CheckInPayload): Promise<boolean> {
    // TODO: Process incoming SMS/IVR response via Twilio webhook
    throw new Error("[sms-ivr] Not implemented yet");
  }

  protected async doReceiveAlert(_payload: AlertPayload): Promise<void> {
    // TODO: Send SMS or make IVR call via Twilio
    // await twilio.messages.create({ to: phone, body: payload.message });
    throw new Error("[sms-ivr] Not implemented yet");
  }
}
