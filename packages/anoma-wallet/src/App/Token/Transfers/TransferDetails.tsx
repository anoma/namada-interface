import { Heading, HeadingLevel } from "components/Heading";
import { NavigationContainer } from "components/NavigationContainer";
import { useNavigate, useParams } from "react-router-dom";
import { AccountsState } from "slices/accounts";
import { useAppSelector } from "store";
import { amountFromMicro, stringFromTimestamp } from "utils/helpers";
import { Address, TransferDetailContainer } from "./TransferDetails.components";

type TransferDetailsParams = {
  id: string;
  appliedHash: string;
};

const TransferDetail = (): JSX.Element => {
  const navigate = useNavigate();
  const { id = "", appliedHash = "" } = useParams<TransferDetailsParams>();
  const { transactions: accountTransactions } = useAppSelector<AccountsState>(
    (state) => state.accounts
  );

  const transactions = accountTransactions[id] || [];

  const {
    tokenType,
    amount,
    gas = 0,
    timestamp = 0,
    memo,
    shielded,
    target,
  } = transactions.find(
    (transaction) => transaction.appliedHash === appliedHash
  ) || {};

  const dateTimeFormatted = stringFromTimestamp(timestamp);

  return (
    <TransferDetailContainer>
      <NavigationContainer
        onBackButtonClick={() => {
          navigate(-1);
        }}
      >
        <Heading level={HeadingLevel.One}>Transfer Details</Heading>
      </NavigationContainer>
      <p>
        Token: <strong>{tokenType}</strong>
        <br />
        Applied hash:
      </p>
      <Address>{appliedHash}</Address>
      <p>
        Amount: <strong>{amount}</strong>
        <br />
        Gas used: <strong>{amountFromMicro(gas)}</strong>
        <br />
        Target address:
      </p>
      <Address>{target}</Address>
      <p>Notes: {memo ? memo : "n/a"}</p>
      <p>
        Shielded transaction?: <strong>{shielded ? "Yes!" : "No"}</strong>
      </p>
      <p>Time: {dateTimeFormatted}</p>
    </TransferDetailContainer>
  );
};

export default TransferDetail;
