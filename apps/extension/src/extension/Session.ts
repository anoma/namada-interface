import { LockKeyRingMsg } from "background/keyring";
import { Ports } from "router";
import browser, { Runtime } from "webextension-polyfill";
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

// Get duration in minutes from an existing timestamp
const timestampToDuration = (timestamp: number): number =>
  Math.round((Date.now() - timestamp) / 1000 / 60);

export class Session {
  protected port: Runtime.Port | undefined;
  private _timestamp: number = Date.now();
  private _requester: ExtensionRequester | undefined;

  public start(requester?: ExtensionRequester): Runtime.Port {
    console.log("START");
    this._timestamp = Date.now();
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

  public update(): void {
    this._timestamp = Date.now();
  }

  public end(): void {
    const sessionDurationMinutes = timestampToDuration(this._timestamp);
    console.info(`Session is ending after ${sessionDurationMinutes} minutes!`);
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
