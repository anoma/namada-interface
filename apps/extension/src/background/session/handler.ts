import browser, { Runtime } from "webextension-polyfill";
import { KeyRingService } from "../keyring";
import { SessionMsg, SessionMsgType } from "extension";

export class SessionHandler {
  private _port: Runtime.Port | undefined;

  constructor(private readonly _keyRingService: KeyRingService) {
    browser.runtime.onConnect.addListener((port: Runtime.Port): void => {
      this._port = port;
      this._port.onMessage.addListener((message: SessionMsg) => {
        const { type } = message;

        switch (type) {
          case SessionMsgType.Disconnect:
            console.info("Locking keyring");
            this._keyRingService.lock();
            break;
          case SessionMsgType.Connect:
            this._port?.postMessage({
              msg: "Background connected",
              type: SessionMsgType.Message,
            });
            break;
          default:
            return;
        }
      });
    });
  }
}
