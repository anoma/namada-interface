import { Dispatch } from "react";

import { Namada } from "@namada/integrations";

import { fetchValidators } from "slices/StakingAndGovernance/actions";
import { addAccounts, fetchBalances } from "slices/accounts";
import { setChain } from "slices/chain";
import { fetchProposals } from "slices/proposals";

export const NamadaAccountChangedHandler =
  (
    dispatch: Dispatch<unknown>,
    integration: Namada,
    refreshAccounts: () => Promise<void>
  ) =>
  async () => {
    refreshAccounts();

    const accounts = (await integration.accounts()) || [];

    dispatch(addAccounts(accounts));
    dispatch(fetchBalances());
  };

export const NamadaNetworkChangedHandler =
  (
    dispatch: Dispatch<unknown>,
    integration: Namada,
    refreshChain: () => Promise<void>
  ) =>
  async () => {
    refreshChain();

    const chain = await integration.getChain();
    if (chain) {
      dispatch(setChain(chain));
      dispatch(fetchBalances());
    }
  };

export const NamadaProposalsUpdatedHandler =
  (dispatch: Dispatch<unknown>) => async () => {
    dispatch(fetchProposals());
  };

export const NamadaUpdatedBalancesHandler =
  (dispatch: Dispatch<unknown>, refreshBalances: () => void) => async () => {
    dispatch(fetchBalances());
    refreshBalances();
  };

export const NamadaUpdatedStakingHandler =
  (dispatch: Dispatch<unknown>) => async () => {
    dispatch(fetchValidators());
  };

export const NamadaTxCompletedHandler =
  (_dispatch: Dispatch<unknown>, refreshPublicKeys: () => void) =>
  async (_event: CustomEventInit) => {
    refreshPublicKeys();
  };

export const NamadaConnectionRevokedHandler =
  (
    integration: Namada,
    setNamadaExtensionConnected: (connected: boolean) => void
  ) =>
  async () => {
    const connected = !!(await integration.isConnected());
    setNamadaExtensionConnected(connected);
  };
