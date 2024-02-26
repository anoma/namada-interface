export type DelegationResponse = [string, string, string, string, string];
export type BondsResponse = [string, string, string, string];
export type UnbondsResponse = [string, string, string, string, string];

export type Delegation = {
  owner: string;
  validator: string;
  totalBonds: string;
  totalUnbonds: string;
  withdrawable: string;
};

export type Bonds = {
  owner: string;
  validator: string;
  amount: string;
  startEpoch: string;
};

export type Unbonds = {
  owner: string;
  validator: string;
  amount: string;
  startEpoch: string;
  withdrawableEpoch: string;
};

export type StakingPositions = {
  bonds: Bonds;
  unbonds: Unbonds;
};
