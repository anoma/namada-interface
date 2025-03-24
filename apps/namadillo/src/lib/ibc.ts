import { Chain } from "@chain-registry/types";

export class ChainInfo {
  public static fromChainId(): void {}

  public static fromChannel(): void {}
}

export class AssetInfo {
  public static fromDenom(): void {}
}

export class IbcInfo {
  public sourceChain?: Chain;
  public targetChain?: Chain;
  public sourceChannel?: string;
  public targetChannel?: string;

  public static fromTrace(): void {}

  public static fromTokenAddress(): void {}

  public static fromDestinationChannel(): void {}

  public static fromTargetChannel(): void {}

  public static fromDestinationChainId(
    namadaChainName: string,
    targetChainName: string
  ): void {}
}
