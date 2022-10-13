import browser, { Runtime } from "webextension-polyfill";

export type SessionMsg = {
  msg: string;
};

export class Session {
  private _timestamp = Date.now();
  constructor(
    protected port: Runtime.Port = browser.runtime.connect({
      name: "session-port",
    })
  ) {}

  public initPort = (): Runtime.Port =>
    (this.port = browser.runtime.connect({
      name: "session-port",
    }));

  public start(): Runtime.Port {
    this._timestamp = Date.now();
    this.port.disconnect();
    this.initPort();
    this.port.postMessage({
      msg: "Establishing port to background",
    });

    this.port.onMessage.addListener((message, port) => {
      console.log(`Port established: ${message.msg}`, port);
    });

    this.port.onDisconnect.addListener((port: Runtime.Port) => {
      console.warn(
        `Session is ending after ${
          (Date.now() - this._timestamp) / 1000 / 60
        } minutes!`
      );
      if (port.error) {
        console.error("Port disconnected due to error", port.error);
      }
    });
    return this.port;
  }

  public end(): void {
    this.port.postMessage({
      msg: "Ended session",
    });

    console.log("Disconnecting session");
    this.port.disconnect();
  }
}
