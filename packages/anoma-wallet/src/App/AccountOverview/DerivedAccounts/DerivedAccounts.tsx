import { useEffect, memo } from "react";
import { useNavigate } from "react-router-dom";

import { Config } from "config";
import { RpcClient } from "lib";
import { useAppDispatch, useAppSelector } from "store";
import { AccountsState } from "slices/accounts";
import { setBalance } from "slices";
import { Tokens, TokenType } from "constants/";
import { formatRoute, stringToHash } from "utils/helpers";
import { TopLevelRoute } from "App/types";

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
import { BalancesState } from "slices/balances";

const { network } = new Config();
const rpcClient = new RpcClient(network);

const getBalance = async (
  establishedAddress: string,
  tokenType: TokenType
): Promise<number> => {
  const balance = await rpcClient.queryBalance(
    `${Tokens[tokenType].address}`,
    establishedAddress
  );
  return balance >= 0 ? balance : 0;
};

const DerivedAccounts = (): JSX.Element => {
  const balances = useAppSelector<BalancesState>((state) => state.balances);
  const { derived } = useAppSelector<AccountsState>((state) => state.accounts);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const keys = Object.keys(derived);
    if (keys.length > 0) {
      keys.forEach(async (key) => {
        const { alias, establishedAddress = "", tokenType } = derived[key];

        if (!balances[stringToHash(alias)]) {
          const token = await getBalance(establishedAddress, tokenType);
          const usd = 0; // TODO: Convert token balance to USD
          dispatch(setBalance({ alias, token, usd }));
        }
      });
    }
  }, [derived]);

  return (
    <DerivedAccountsContainer>
      <DerivedAccountsList>
        {Object.keys(derived).map((hash: string) => {
          const { alias, tokenType, establishedAddress } = derived[hash];
          const { token: tokenBalance } = balances[hash] || {};

          return (
            <DerivedAccountItem key={alias}>
              <DerivedAccountAlias>{alias}</DerivedAccountAlias>
              <DerivedAccountType>{tokenType}</DerivedAccountType>
              <DerivedAccountBalance>
                <span>Balance:</span>{" "}
                {typeof tokenBalance === "number" ? tokenBalance : "Loading"}
              </DerivedAccountBalance>
              <DerivedAccountAddress>
                {establishedAddress}
              </DerivedAccountAddress>
              <Button
                onClick={() => {
                  navigate(formatRoute(TopLevelRoute.Token, { hash }));
                }}
                variant={ButtonVariant.Contained}
              >
                Details
              </Button>
            </DerivedAccountItem>
          );
        })}
      </DerivedAccountsList>
    </DerivedAccountsContainer>
  );
};

export default memo(DerivedAccounts);
