import browser, { Runtime } from "webextension-polyfill";
import { LockKeyRingMsg } from "background/keyring";
import { Ports } from "router";
import { ExtensionRequester } from "./ExtensionRequester";

export enum SessionMsgType {
  Connect = "connect",
  Disconnect = "disconnect",
  Message = "message",
}

export type SessionMsg = {
  msg: string;
  type: SessionMsgType;
};

const SESSION_PORT = "session-port";
// Maximum length of inactivity
const SESSION_DURATION = 4 * 60 * 1000;

// Connect to SESSION_PORT
const initPort = (): Runtime.Port =>
  browser.runtime.connect({
    name: SESSION_PORT,
  });

/**
 * Maintain an open port to the background until a certain limit has been reached.
 */
export class Session {
  protected port: Runtime.Port | undefined;
  private _requester: ExtensionRequester | undefined;
  private _timestamp: number = Date.now();
  private _timeout: ReturnType<typeof setTimeout> | undefined;

  public start(requester?: ExtensionRequester): Runtime.Port {
    this._timestamp = Date.now();
    // Restart port:
    this.port?.disconnect();
    this.port = initPort();
    this.port.postMessage({
      msg: "Establishing port to background",
      type: SessionMsgType.Connect,
    });
    if (requester) {
      this._requester = requester;
    }

    this.port.onMessage.addListener(this.handleOnMessage);
    this.port.onDisconnect.addListener(this.handleOnDisconnect);

    this._timeout = setTimeout(() => {
      const duration = Date.now() - this._timestamp;
      if (duration < SESSION_DURATION) {
        this.port = initPort();
        this.update();
      } else {
        this.close();
      }
    }, SESSION_DURATION);

    return this.port;
  }

  public update(): void {
    this._clearTimeout();
    this.start();
  }

  public close(): void {
    // Dispatch LockKeyRingMsg if requester is available:
    this._requester?.sendMessage(Ports.Background, new LockKeyRingMsg());
    if (this.port) {
      // Post message to background that session has ended
      this.port.postMessage({
        msg: "Session ended",
        type: SessionMsgType.Disconnect,
      });

      if (this.port) {
        this.port.disconnect();
      }
    }
    this._clearTimeout();
    this._requester = undefined;
  }

  private _clearTimeout(): void {
    if (this._timeout) {
      clearTimeout(this._timeout);
    }
  }

  /**
   * Handle postMessages from background
   */
  public handleOnMessage(message: SessionMsg, _port: Runtime.Port): void {
    const { msg, type } = message;
    console.info(`Message ${type} recieved: ${msg}`);

    switch (type) {
      case SessionMsgType.Disconnect:
        this.close();
        break;
      case SessionMsgType.Connect:
        this.start();
        break;
      default:
        return;
    }
  }

  public handleOnDisconnect(port: Runtime.Port): void {
    console.info("Session port has closed.");
    this._clearTimeout();
    if (port.error) {
      console.error("Port disconnected due to an error", port.error);
    }
  }
}
