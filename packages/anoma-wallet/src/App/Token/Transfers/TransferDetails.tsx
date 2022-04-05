import { Heading, HeadingLevel } from "components/Heading";
import { NavigationContainer } from "components/NavigationContainer";
import { useNavigate, useParams } from "react-router-dom";
import { TransactionsState } from "slices/transactions";
import { useAppSelector } from "store";
import { amountFromMicro, stringFromTimestamp } from "utils/helpers";
import { Address, TransferDetailContainer } from "./TransferDetails.components";

type TransferDetailsParams = {
  hash: string;
  appliedHash: string;
};

const TransferDetail = (): JSX.Element => {
  const navigate = useNavigate();
  const { hash = "", appliedHash = "" } = useParams<TransferDetailsParams>();
  const { accountTransactions } = useAppSelector<TransactionsState>(
    (state) => state.transactions
  );

  const transactions = accountTransactions[hash] || [];

  const {
    tokenType,
    amount,
    gas = 0,
    timestamp = 0,
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
      <p>Time: {dateTimeFormatted}</p>
    </TransferDetailContainer>
  );
};

export default TransferDetail;
