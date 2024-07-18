import {
    ChallengeResponse,
    Data,
    ErrorResponse,
    ChainsResponse,
  } from "./types";
  
  enum Endpoint {
    ChainsData = "",
  }
  
  export class ChainsAPI {
    constructor(protected readonly url: string, protected readonly chainId: string) {}
  
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
          const errors = reader?.read().then((data): Promise<ErrorResponse> => {
            const response = JSON.parse(
              new TextDecoder().decode(data.value)
            ) as ErrorResponse;
            // If code 429 is received on any request, rate limiting is blocking
            // requests from this this IP, so provide a specific message:
            if (response.code === 429) {
              response.message = "Too many requests! Try again in one hour.";
            }
            return Promise.reject(response);
          });
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
    async chainsData(): Promise<ChainsResponse> {
      return this.request(Endpoint.ChainsData);
    }
}
  