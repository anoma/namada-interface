import {
  ChallengeResponse,
  Data,
  ErrorResponse,
  SettingsResponse,
  TransferResponse,
} from "./types";

enum Endpoint {
  Settings = "/setting",
  Challenge = "/challenge",
  Transfer = "",
}

export class API {
  constructor(protected readonly url: string) {}

  /**
   * Wrapper for fetch requests to handle ReadableStream response when errors are received from API
   *
   * @param {string} endpoint
   * @param {RequestInit} options
   *
   * @returns Object
   */
  async request<T = unknown>(
    endpoint: string,
    options: RequestInit = { method: "GET" }
  ): Promise<T> {
    return await fetch(new URL(`${this.url}${endpoint}`), {
      ...options,
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        const reader = response?.body?.getReader();
        const errors = reader
          ?.read()
          .then(
            (data): Promise<ErrorResponse> =>
              Promise.reject(JSON.parse(new TextDecoder().decode(data.value)))
          );
        if (!errors) {
          throw new Error("Unable to parse error response");
        }
        return errors;
      })
      .catch((e) => {
        console.error(e);
        return Promise.reject(e);
      });
  }

  /**
   * Request faucet settings
   *
   * @returns Object
   */
  async settings(): Promise<SettingsResponse> {
    return this.request(Endpoint.Settings);
  }

  /**
   * Request challenge from endpoint url
   *
   * @param {string} publicKey
   * @returns Object
   */
  async challenge(publicKey: string): Promise<ChallengeResponse> {
    return this.request(`${Endpoint.Challenge}/${publicKey}`);
  }

  /**
   * Submit a transfer request
   *
   * @param {Data} data
   * @returns {Object}
   */
  async submitTransfer(data: Data): Promise<TransferResponse> {
    return this.request(Endpoint.Transfer, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
