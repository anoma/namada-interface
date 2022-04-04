import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Config } from "config";
import { Tokens, TokenType } from "constants/";
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
import { useAppDispatch, useAppSelector } from "store";
import { setBalance } from "slices";
import { stringToHash } from "utils/helpers";

type Props = {
  derived: {
    [alias: string]: DerivedAccount;
  };
};

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

const DerivedAccounts = ({ derived }: Props): JSX.Element => {
  const [derivedAccounts, setDerivedAccounts] = useState<DerivedAccount[]>([]);
  const { accountBalances } = useAppSelector((state) => state.balances);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const accounts = Object.keys(derived).map(
      (hash: string): DerivedAccount => derived[hash]
    );
    setDerivedAccounts(accounts);
  }, [derived]);

  useEffect(() => {
    derivedAccounts.forEach(async (account) => {
      const { alias, establishedAddress = "", tokenType } = account;
      if (!accountBalances[alias]) {
        const token = await getBalance(establishedAddress, tokenType);
        const usd = 0; // TODO: Convert token balance to USD
        dispatch(setBalance({ alias, token, usd }));
      }
    });
  }, [derivedAccounts]);

  return (
    <DerivedAccountsContainer>
      <DerivedAccountsList>
        {derivedAccounts.map((account) => {
          const { alias, tokenType, establishedAddress } = account;
          const hash = stringToHash(alias);
          const { token: tokenBalance } = accountBalances[hash] || {};

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
                  navigate(`${TopLevelRoute.SettingsAccountSettings}/${hash}`);
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
