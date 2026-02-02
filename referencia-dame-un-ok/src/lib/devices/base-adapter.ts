import type { DeviceAdapter, DeviceType, DeviceCapabilities, CheckInPayload, AlertPayload } from "../types";

/**
 * Abstract base class for device adapters.
 * Provides common logging and lifecycle management.
 * Extend this for each new device type.
 */
export abstract class BaseDeviceAdapter implements DeviceAdapter {
  abstract readonly type: DeviceType;
  abstract readonly capabilities: DeviceCapabilities;

  protected initialized = false;

  async initialize(): Promise<void> {
    // initialized
    this.initialized = true;
  }

  async sendCheckIn(payload: CheckInPayload): Promise<boolean> {
    if (!this.initialized) throw new Error(`[${this.type}] Not initialized`);
    void payload;
    return this.doSendCheckIn(payload);
  }

  async receiveAlert(payload: AlertPayload): Promise<void> {
    if (!this.initialized) throw new Error(`[${this.type}] Not initialized`);
    void payload;
    return this.doReceiveAlert(payload);
  }

  async dispose(): Promise<void> {
    // disposed
    this.initialized = false;
  }

  /** Implement in subclass */
  protected abstract doSendCheckIn(payload: CheckInPayload): Promise<boolean>;
  protected abstract doReceiveAlert(payload: AlertPayload): Promise<void>;
}
