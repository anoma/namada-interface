import { Chain } from "@chain-registry/types";

export const namadaChainMock: Partial<Chain> = {
  chain_id: "test",
  chain_name: "namada",
  pretty_name: "Namada",
  logo_URIs: { svg: "namada-icon" },
};

export const randomChainMock: Partial<Chain> = {
  chain_id: "test",
  chain_name: "testchain",
  pretty_name: "TestChain",
  logo_URIs: { svg: "testchain-icon" },
};
