import browser, { Runtime } from "webextension-polyfill";
import { LockKeyRingMsg } from "background/keyring";
import { Ports } from "router";
import { ExtensionRequester } from "./ExtensionRequester";

export type SessionMsg = {
  msg: string;
};

const SESSION_PORT = "session-port";

// Connect to SESSION_PORT
const initPort = (): Runtime.Port =>
  browser.runtime.connect({
    name: SESSION_PORT,
  });

export class Session {
  protected port: Runtime.Port | undefined;
  private _requester: ExtensionRequester | undefined;

  public start(requester?: ExtensionRequester): Runtime.Port {
    // Restart port:
    this.port?.disconnect();
    this.port = initPort();
    this.port.postMessage({
      msg: "Establishing port to background",
    });
    this._requester = requester;

    this.port.onMessage.addListener(this.handleOnMessage);
    this.port.onDisconnect.addListener(this.handleOnDisconnect);
    return this.port;
  }

  public close(): void {
    // Dispatch LockKeyRingMsg if requester is available:
    this._requester?.sendMessage(Ports.Background, new LockKeyRingMsg());
    if (this.port) {
      // Post message to background that session has ended
      this.port.postMessage({
        msg: "Session ended",
      });

      console.info("Disconnecting session");
      if (this.port) {
        this.port.disconnect();
      }
    }
    this._requester = undefined;
  }

  public handleOnMessage(message: SessionMsg, _port: Runtime.Port): void {
    console.info(`Message handled: ${message.msg}`);
  }

  public handleOnDisconnect(port: Runtime.Port): void {
    console.info("Session port has closed.");
    if (port.error) {
      console.error("Port disconnected due to an error", port.error);
    }
  }
}
