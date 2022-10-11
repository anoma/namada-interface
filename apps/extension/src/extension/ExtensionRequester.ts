import browser, { Runtime } from "webextension-polyfill";
import { getAnomaRouterId } from "../extension/utils";
import { Message } from "../router";

const initPort = (): Runtime.Port =>
  browser.runtime.connect({
    name: "session-port",
  });

export class ExtensionRequester {
  protected timestamp: number | undefined;
  protected port: Runtime.Port | undefined;

  async sendMessage<M extends Message<unknown>>(
    port: string,
    msg: M
  ): Promise<M extends Message<infer R> ? R : never> {
    msg.validate();
    msg.origin = window.location.origin;
    msg.meta = {
      ...msg.meta,
      routerId: await getAnomaRouterId(),
    };

    const result = await browser.runtime.sendMessage({
      port,
      type: msg.type(),
      msg: msg,
    });

    if (!result) {
      throw new Error("Null result");
    }

    if (result.error) {
      throw new Error(result.error);
    }

    return result.return;
  }

  static async sendMessageToTab<M extends Message<unknown>>(
    tabId: number,
    port: string,
    msg: M
  ): Promise<M extends Message<infer R> ? R : never> {
    msg.validate();
    msg.origin = window.location.origin;
    msg.meta = {
      ...msg.meta,
      routerId: await getAnomaRouterId(),
    };

    const result = await browser.tabs.sendMessage(tabId, {
      port,
      type: msg.type(),
      msg: msg,
    });

    if (!result) {
      throw new Error("Null result");
    }

    if (result.error) {
      throw new Error(result.error);
    }

    return result.return;
  }

  public startSession(chainId?: string): void {
    this.port?.disconnect();
    this.port = initPort();
    if (!this.timestamp) {
      this.timestamp = Date.now();
    }

    this.port.postMessage({
      msg: "Establishing port to background",
    });

    this.port.onMessage.addListener((m, p) => {
      console.log(`Port established: ${m.msg}`, p, this.timestamp);
    });

    // eslint-disable-next-line
    this.port.onDisconnect.addListener((p: Runtime.Port) => {
      console.log("Port is disconnecting!");
      // Port.error is not available on Chrome: use Port.lastError
      if (p.error) {
        console.error("Port disconnected due to error", p.error);
      }
    });

    const SERVICE_WORKER_TIMEOUT = 5 * 60 * 1000;
    const SESSION_TIMEOUT = SERVICE_WORKER_TIMEOUT * 2 - 2000;

    if (chainId) {
      setTimeout(() => {
        const duration = (Date.now() - (this?.timestamp || 0)) / 1000;
        this.port?.disconnect();
        if (duration < SESSION_TIMEOUT / 1000) {
          this.startSession(chainId);
        } else {
          this.timestamp = undefined;
        }
      }, SERVICE_WORKER_TIMEOUT - 1000);
    }
  }
}
