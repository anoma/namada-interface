import { Configuration, DefaultApi } from "@anomaorg/namada-indexer-client";
import { isUrlValid } from "@namada/utils";
import toml from "toml";
import { SettingsTomlOptions } from "types";

export const isIndexerAlive = async (url: string): Promise<boolean> => {
  if (!isUrlValid(url)) {
    return false;
  }
  try {
    const configuration = new Configuration({ basePath: url });
    const api = new DefaultApi(configuration);
    const response = await api.healthGet();
    return response.status === 200;
  } catch {
    return false;
  }
};

export const isMaspIndexerAlive = async (url: string): Promise<boolean> => {
  if (!isUrlValid(url)) {
    return false;
  }
  try {
    const response = await fetch(`${url}/health`);
    return response.ok && response.status === 200;
  } catch {
    return false;
  }
};

export const isRpcAlive = async (url: string): Promise<boolean> => {
  if (!isUrlValid(url)) {
    return false;
  }
  try {
    const response = await fetch(`${url}/health`);
    return response.ok && response.status === 200;
  } catch {
    return false;
  }
};

export const fetchDefaultTomlConfig =
  async (): Promise<SettingsTomlOptions> => {
    const response = await fetch("/config.toml");
    return toml.parse(await response.text()) as SettingsTomlOptions;
  };
