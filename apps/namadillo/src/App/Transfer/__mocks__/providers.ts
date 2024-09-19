import { Provider } from "types";

export const providerMock: Provider = {
  name: "Keplr",
  iconUrl: "test.svg",
  connected: false,
};

export const providerConnectedMock: Provider = {
  ...providerMock,
  connected: true,
};
