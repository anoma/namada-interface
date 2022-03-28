import { useNavigate } from "react-router-dom";
import { Config } from "config";
import { Tokens } from "constants/";
import { RpcClient } from "lib";
import { useEffect, useState } from "react";
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

type Derived = DerivedAccount & { balance: number };
type DerivedAccounts = Array<Derived>;

const { network } = new Config();

const DerivedAccounts = (props: Props): JSX.Element => {
  const { derived } = props;
  const [derivedAccounts, setDerivedAccounts] = useState<DerivedAccounts>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const getDerivedAccounts = async (): Promise<void> => {
      const rpcClient = new RpcClient(network);

      const accounts = await Promise.all(
        Object.keys(derived).map(async (alias: string): Promise<Derived> => {
          const { establishedAddress = "", tokenType } = derived[alias];

          const balance = await rpcClient.queryBalance(
            `${Tokens[tokenType].address}`,
            establishedAddress
          );

          return {
            ...derived[alias],
            balance: balance >= 0 ? balance : 0,
          };
        })
      );

      setDerivedAccounts(accounts);
    };
    getDerivedAccounts();
  }, [derived]);

  return (
    <DerivedAccountsContainer>
      <DerivedAccountsList>
        {derivedAccounts.map((account: Derived) => {
          const { alias, tokenType, balance, establishedAddress } = account;
          return (
            <DerivedAccountItem key={alias}>
              <DerivedAccountAlias>{alias}</DerivedAccountAlias>
              <DerivedAccountType>{tokenType}</DerivedAccountType>
              <DerivedAccountBalance>
                <span>Balance:</span> {balance}
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
