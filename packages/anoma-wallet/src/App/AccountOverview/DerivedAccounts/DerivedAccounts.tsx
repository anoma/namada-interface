import { DerivedAccount } from "slices/accounts";
import {
  DerivedAccountsContainer,
  DerivedAccountsList,
  DerivedAccountItem,
} from "./DerivedAccounts.components";

type Props = {
  derived: {
    [alias: string]: DerivedAccount;
  };
};

const DerivedAccounts = (props: Props): JSX.Element => {
  const { derived } = props;
  console.log({ derived });
  return (
    <DerivedAccountsContainer>
      <DerivedAccountsList>
        {Object.keys(derived).map((alias: string) => {
          return <DerivedAccountItem key={alias}>{alias}</DerivedAccountItem>;
        })}
      </DerivedAccountsList>
    </DerivedAccountsContainer>
  );
};

export default DerivedAccounts;
