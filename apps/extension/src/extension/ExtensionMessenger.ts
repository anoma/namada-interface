export type Callback = (...args: any[]) => Promise<any>;

export interface Messenger {
  addListener(callback: Callback): void;
  removeListener(callback: Callback): void;
  sendMessage(payload: any): Promise<any>;
}

export class ExtensionMessenger implements Messenger {
  addListener(callback: Callback): void {
    // this.callbacks.add(callback);
  }

  removeListener(callback: Callback): void {
    // this.callbacks.delete(callback);
  }

  sendMessage(payload: any) {
    return browser.runtime.sendMessage(payload);
  }
}
