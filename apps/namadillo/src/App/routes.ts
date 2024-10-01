export const routes = {
  // staking
  staking: "/staking",
  stakingBondingIncrement: "/staking/bonding/increment",
  stakingBondingRedelegate: "/staking/bonding/redelegate",
  stakingBondingUnstake: "/staking/bonding/unstake",
  stakingClaimRewards: "/staking/claim-rewards",

  // governance
  governance: "/governance",
  governanceProposal: "/governance/proposal/:proposalId",
  governanceSubmitVote: "/governance/submit-vote/:proposalId",
  governanceJson: "/governance/json/:proposalId",

  // masp
  masp: "/masp",
  maspShield: "/masp/shield",
  maspUnshield: "/masp/unshield",

  // ibc
  ibc: "/ibc",
  ibcWithdraw: "/ibc/withdraw",
  ibcShieldAll: "/ibc/shield-all",

  // transfer
  transfer: "/transfer",
} as const;
