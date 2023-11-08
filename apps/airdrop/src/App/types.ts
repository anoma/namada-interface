export type ClaimResponse = {
  eligible: boolean;
  //TODO: check if it should be string isnteas
  amount: number;
  confirmed: boolean;
  airdrop_address?: string;
};
