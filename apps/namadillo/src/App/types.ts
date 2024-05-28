import { Location } from "react-router-dom";

export const TopLevelRouteGenerator = {
  // this creates a route for TopLevelRoute.Token
  createRouteForTokenByTokenId: (tokenId: string) => `/token/${tokenId}`,

  // this creates a route for TopLevelRoute.Wallet
  createRouteForWallet: () => TopLevelRoute.Wallet,
};

export enum TopLevelRoute {
  /* INITIAL ACCOUNT */
  AccountCreation = "/account-creation",

  /* WALLET */
  Wallet = "/",
  WalletAddAccount = "/add-account",

  /* BRIDGE */
  Bridge = "/bridge",

  /* TOKENS */
  Token = "/token/:id",
  TokenSend = "/token/send",
  TokenSendTarget = "/token/send/:accountIndex/:target",
  TokenReceive = "/token/receive",
  TokenTransfers = "/token/:id/transfers/token/:token",
  TokenTransferDetails = "/token/:id/transfers/:appliedHash",
  TokenIbcTransfer = "/token/:id/ibc-transfer",

  /* STAKING AND GOVERNANCE */
  StakingAndGovernance = "/staking-and-governance",
  Proposals = "/proposals",

  /* SETTINGS */
  Settings = "/settings",
  SettingsAccounts = "/settings/accounts",
  SettingsWalletSettings = "/settings/wallet-settings",
  SettingsAccountSettings = "/settings/account-settings/:id",
}

export enum StakingAndGovernanceSubRoute {
  Staking = "/staking",
  StakingOverview = "/staking-overview",
  ValidatorDetails = "/validator-details",
  PublicGoodsFunding = "/public-goods-funding",
}

// returns the root route from react router
// location: host.com/xxx/thisWillNotBeReturned
// returns: TopLevelRoute.Xxx
export const locationToTopLevelRoute = (
  location: Location
): TopLevelRoute | undefined => {
  const firstPartOtPath = `/${location.pathname.split("/")[1]}`;
  const values = Object.values(TopLevelRoute);
  const secondPartOtPathAsStakingAndGovernanceSubRoute =
    firstPartOtPath as unknown as TopLevelRoute;

  if (values.includes(secondPartOtPathAsStakingAndGovernanceSubRoute)) {
    return secondPartOtPathAsStakingAndGovernanceSubRoute;
  }
  return undefined;
};

// returns the second level route from react router
// location: host.com/thisWillNotBeReturned/xxx
// returns: StakingAndGovernanceSubRoute.Xxx
export const locationToStakingAndGovernanceSubRoute = (
  location: Location
): StakingAndGovernanceSubRoute | undefined => {
  const secondPartOtPath = `/${location.pathname.split("/")[2]}`;
  const values = Object.values(StakingAndGovernanceSubRoute);
  const secondPartOtPathAsStakingAndGovernanceSubRoute =
    secondPartOtPath as unknown as StakingAndGovernanceSubRoute;

  if (values.includes(secondPartOtPathAsStakingAndGovernanceSubRoute)) {
    return secondPartOtPathAsStakingAndGovernanceSubRoute;
  }
  return undefined;
};

export enum LocalStorageKeys {
  MasterSeed = "com.namada.network:seed",
  Session = "com.namada.network:session",
  Persist = "com.namada.network:state",
  ColorMode = "com.namada.color-mode",
}
