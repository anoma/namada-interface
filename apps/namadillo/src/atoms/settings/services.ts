import { Configuration, DefaultApi } from "@namada/indexer-client";
import { isUrlValid } from "@namada/utils";
import toml from "toml";
import { SettingsTomlOptions, TempIndexerHealthType } from "types";
import { getSdkInstance } from "utils/sdk";

export const getIndexerHealth = async (
  url: string
): Promise<TempIndexerHealthType | undefined> => {
  if (!isUrlValid(url)) {
    return;
  }

  try {
    const configuration = new Configuration({ basePath: url });
    const api = new DefaultApi(configuration);
    const response = await api.healthGet();

    // TODO:update when indexer swagger is fixed
    // @ts-expect-error Indexer swagger is out of date
    return response.data as TempIndexerHealthType;
  } catch {
    return;
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

export const clearShieldedContext = async (chainId: string): Promise<void> => {
  const sdk = await getSdkInstance();
  await sdk.getMasp().clearShieldedContext(chainId);
};
