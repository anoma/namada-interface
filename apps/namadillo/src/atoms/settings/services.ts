import { DefaultApi } from "@anomaorg/namada-indexer-client";
import toml from "toml";
import { SettingsTomlOptions } from "types";

export const isIndexerAlive = async (url: string): Promise<boolean> => {
  try {
    const api = new DefaultApi({ basePath: url });
    const response = await api.healthGet();
    return response.status === 200;
  } catch {
    return false;
  }
};

export const isRpcAlive = async (url: string): Promise<boolean> => {
  try {
    const api = new DefaultApi({ basePath: url });
    const response = await api.healthGet();
    return response.status === 200;
  } catch {
    return false;
  }
};

export const fetchDefaultTomlConfig =
  async (): Promise<SettingsTomlOptions> => {
    const response = await fetch("/config.toml");
    return toml.parse(await response.text()) as SettingsTomlOptions;
  };
