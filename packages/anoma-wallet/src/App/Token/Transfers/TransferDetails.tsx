import { Heading, HeadingLevel } from "components/Heading";
import { NavigationContainer } from "components/NavigationContainer";
import { useNavigate, useParams } from "react-router-dom";
import { TransfersState } from "slices/transfers";
import { useAppSelector } from "store";
import { stringFromTimestamp } from "utils/helpers";
import { Address, TransferDetailContainer } from "./TransferDetails.components";

type TransferDetailsParams = {
  id: string;
  appliedHash: string;
};

const TransferDetail = (): JSX.Element => {
  const navigate = useNavigate();
  const { appliedHash = "" } = useParams<TransferDetailsParams>();
  const { transactions } = useAppSelector<TransfersState>(
    (state) => state.transfers
  );

  const {
    tokenType,
    amount,
    gas = 0,
    timestamp = 0,
    height = 0,
    memo,
    source,
    target,
    type,
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
        <strong>
          {type}
          <br />
          {amount} {tokenType}
        </strong>
        <br />
        {dateTimeFormatted}
      </p>
      <p>Source address:</p>
      <Address>{source}</Address>
      <p>Target address:</p>
      <Address>{target}</Address>
      <p>Applied hash:</p>
      <Address>{appliedHash}</Address>
      <p>
        Gas used: <strong>{gas}</strong>
      </p>
      <p>
        Block height: <strong>{height}</strong>
      </p>
      <p>Notes: {memo ? memo : "n/a"}</p>
    </TransferDetailContainer>
  );
};

export default TransferDetail;
