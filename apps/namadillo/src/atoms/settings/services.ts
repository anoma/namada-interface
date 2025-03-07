import {
  ApiV1CrawlersTimestampsGet200ResponseInner,
  ApiV1CrawlersTimestampsGetCrawlerNamesEnum,
  DefaultApi,
  HealthGet200Response,
} from "@namada/indexer-client";
import { isUrlValid } from "@namada/utils";
import toml from "toml";
import { SettingsTomlOptions } from "types";
import { getSdkInstance } from "utils/sdk";

export const getIndexerHealth = async (
  api: DefaultApi
): Promise<HealthGet200Response | undefined> => {
  try {
    const response = await api.healthGet();
    return response.data;
  } catch {
    return;
  }
};

export const getIndexerCrawlerInfo = async (
  api: DefaultApi,
  services?: ApiV1CrawlersTimestampsGetCrawlerNamesEnum[]
): Promise<ApiV1CrawlersTimestampsGet200ResponseInner[] | undefined> => {
  try {
    const response = await api.apiV1CrawlersTimestampsGet(services);
    return response.data;
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
