import { Message } from "../router";

export type Result<M> = {
  error?: { message: string; stack: string };
  return: Promise<M extends Message<infer R> ? R : never>;
};

export class ExtensionMessenger {
  addListener(callback: string): void {
    // browser.runtime.onMessage.addListener(callback);
  }

  removeListener(callback: string): void {
    // browser.runtime.onMessage.removeListener(callback);
  }

  sendMessage(payload: string): Promise<any> {
    return browser.runtime.sendMessage(payload);
    // return browser.runtime.sendMessage(payload);
  }
}
