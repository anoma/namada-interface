import browser, { Runtime } from "webextension-polyfill";
import { LockKeyRingMsg } from "background/keyring";
import { Ports } from "router";
import { ExtensionRequester } from "./ExtensionRequester";

export type SessionMsg = {
  msg: string;
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
    if (this._timeout) {
      clearTimeout(this._timeout);
    }
    this.start();
  }

  public close(): void {
    // Dispatch LockKeyRingMsg if requester is available:
    this._requester?.sendMessage(Ports.Background, new LockKeyRingMsg());
    if (this.port) {
      // Post message to background that session has ended
      this.port.postMessage({
        msg: "Session ended",
      });

      if (this.port) {
        this.port.disconnect();
      }
    }
    this._requester = undefined;
  }

  public handleOnMessage(message: SessionMsg, _port: Runtime.Port): void {
    // TODO: Here we can selectively handle messages from the background:
    console.info(`Message handled: ${message.msg}`);
  }

  public handleOnDisconnect(port: Runtime.Port): void {
    console.info("Session port has closed.");
    if (port.error) {
      console.error("Port disconnected due to an error", port.error);
    }
  }
}
