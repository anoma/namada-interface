import { useEffect, useState, useReducer } from "react";
import { useNavigate } from "react-router-dom";
import { Config } from "config";
import { Tokens } from "constants/";
import { RpcClient } from "lib";
import { DerivedAccount } from "slices/accounts";
import {
  DerivedAccountsContainer,
  DerivedAccountsList,
  DerivedAccountItem,
  DerivedAccountAddress,
  DerivedAccountAlias,
  DerivedAccountBalance,
  DerivedAccountType,
} from "./DerivedAccounts.components";
import { Button, ButtonVariant } from "components/Button";
import { TopLevelRoute } from "App/types";

type Props = {
  derived: {
    [alias: string]: DerivedAccount;
  };
};

const { network } = new Config();
const rpcClient = new RpcClient(network);

const getBalance = async (
  establishedAddress: string,
  tokenType: string
): Promise<number> => {
  const balance = await rpcClient.queryBalance(
    `${Tokens[tokenType].address}`,
    establishedAddress
  );
  return balance >= 0 ? balance : 0;
};

enum BalanceActionTypes {
  Add = "Add",
}

type BalanceState = {
  [alias: string]: number;
};

type BalanceAction = {
  type: BalanceActionTypes;
  payload: { alias: string; balance: number };
};

const balanceReducer = (
  state: BalanceState,
  action: BalanceAction
): BalanceState => {
  const { type, payload } = action;
  const { alias, balance } = payload;

  switch (type) {
    case BalanceActionTypes.Add:
      return {
        ...state,
        [alias]: balance,
      };
    default:
      return state;
  }
};

const DerivedAccounts = ({ derived }: Props): JSX.Element => {
  const [derivedAccounts, setDerivedAccounts] = useState<DerivedAccount[]>([]);
  const [balances, dispatch] = useReducer(balanceReducer, {});
  const navigate = useNavigate();

  useEffect(() => {
    const accounts = Object.keys(derived).map(
      (alias: string): DerivedAccount => derived[alias]
    );
    setDerivedAccounts(accounts);
  }, [derived]);

  useEffect(() => {
    derivedAccounts.forEach(async (account) => {
      const { alias, establishedAddress = "", tokenType } = account;
      const balance = await getBalance(establishedAddress, tokenType);
      dispatch({ type: BalanceActionTypes.Add, payload: { alias, balance } });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [derivedAccounts]);

  return (
    <DerivedAccountsContainer>
      <DerivedAccountsList>
        {derivedAccounts.map((account) => {
          const { alias, tokenType, establishedAddress } = account;
          const balance = balances[alias];

          return (
            <DerivedAccountItem key={alias}>
              <DerivedAccountAlias>{alias}</DerivedAccountAlias>
              <DerivedAccountType>{tokenType}</DerivedAccountType>
              <DerivedAccountBalance>
                <span>Balance:</span>{" "}
                {typeof balance === "number" ? balance : "Loading"}
              </DerivedAccountBalance>
              <DerivedAccountAddress>
                {establishedAddress}
              </DerivedAccountAddress>
              <Button
                onClick={() => {
                  navigate(`${TopLevelRoute.SettingsAccountSettings}/${alias}`);
                }}
                variant={ButtonVariant.Contained}
              >
                Settings
              </Button>
            </DerivedAccountItem>
          );
        })}
      </DerivedAccountsList>
    </DerivedAccountsContainer>
  );
};

export default DerivedAccounts;
