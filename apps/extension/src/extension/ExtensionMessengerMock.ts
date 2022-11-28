import { Callback, Messenger } from "./ExtensionMessenger";

export class ExtensionMessengerMock implements Messenger {
  // Set might influence the order of callbacks, change to array if needed
  private callbacks: Set<Callback> = new Set();

  addListener(callback: Callback): void {
    this.callbacks.add(callback);
  }
  removeListener(callback: Callback): void {
    this.callbacks.delete(callback);
  }

  sendMessage(payload: any) {
    try {
      const promises = Array.from(this.callbacks).map(cb => cb(payload));
      return Promise.all(promises);
    } catch (e) {
      return Promise.reject(e)
    }
  }
}
