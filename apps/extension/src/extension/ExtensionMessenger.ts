import browser from "webextension-polyfill";

export type Callback = (...args: any[]) => Promise<any>;

export interface Messenger {
  addListener(callback: Callback): void;
  removeListener(callback: Callback): void;
  sendMessage(payload: any): Promise<any>;
}

export class ExtensionMessenger implements Messenger {
  addListener(callback: Callback): void {
    browser.runtime.onMessage.addListener(callback);
  }

  removeListener(callback: Callback): void {
    browser.runtime.onMessage.removeListener(callback);
  }

  sendMessage(payload: any) {
    return browser.runtime.sendMessage(payload);
  }
}
