/* eslint-disable @typescript-eslint/no-unused-vars */
import { BaseDeviceAdapter } from "./base-adapter";
import type { DeviceCapabilities, CheckInPayload, AlertPayload } from "../types";

/**
 * Smart TV adapter — HbbTV / WebOS / Tizen.
 * Overlay sobre emisión de TV, botón OK del mando = check-in.
 * ~85% hogares españoles tienen Smart TV.
 *
 * TODO: Implementar
 * - HbbTV overlay (DVB-T2, receptor integrado)
 * - WebOS SDK (LG)
 * - Tizen SDK (Samsung)
 * - Android TV (Sony, Philips, Xiaomi)
 * - Botón OK del mando como check-in
 * - Mostrar avatar en esquina de la pantalla
 * - Alertas como banner overlay sobre la emisión
 */
export class SmartTvAdapter extends BaseDeviceAdapter {
  readonly type = "smart-tv" as const;
  readonly capabilities: DeviceCapabilities = {
    canDisplayAvatar: true,
    canPlaySound: true,
    canShowNotification: true,
    canReceiveTouch: false, // mando a distancia, no táctil
    canReceiveVoice: false, // TODO: algunos tienen micrófono
    hasScreen: true,
    screenSize: "large",
  };

  protected async doSendCheckIn(_payload: CheckInPayload): Promise<boolean> {
    // TODO: Enviar check-in via API REST/WebSocket
    // El botón OK del mando dispara esta función
    throw new Error("[smart-tv] Not implemented yet");
  }

  protected async doReceiveAlert(_payload: AlertPayload): Promise<void> {
    // TODO: Mostrar overlay de alerta sobre la emisión de TV
    // Banner semi-transparente con avatar + mensaje
    throw new Error("[smart-tv] Not implemented yet");
  }
}
