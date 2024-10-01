export const routes = {
  root: "/",

  // Staking
  staking: "/staking",
  stakingBondingIncrement: "/staking/bonding/increment",
  stakingBondingRedelegate: "/staking/bonding/redelegate",
  stakingBondingUnstake: "/staking/bonding/unstake",
  stakingClaimRewards: "/staking/claim-rewards",

  // Governance
  governance: "/governance",
  governanceProposal: "/governance/proposal/:proposalId",
  governanceSubmitVote: "/governance/submit-vote/:proposalId",
  governanceJson: "/governance/json/:proposalId",

  // Masp
  masp: "/masp",
  maspShield: "/masp/shield",
  maspUnshield: "/masp/unshield",

  // Ibc
  ibc: "/ibc",
  ibcWithdraw: "/ibc/withdraw",
  ibcShieldAll: "/ibc/shield-all",

  // Transfer
  transfer: "/transfer",

  // Settings
  settings: "/settings",
  settingsAdvanced: "/settings/advanced",
  settingsSignArbitrary: "/settings/sign-arbitrary",
  settingsFeatures: "/settings/features",

  // Other
  switchAccount: "/switch-account",
  signMessages: "/sign-messages",
} as const;
