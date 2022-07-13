import { useNavigate, useParams } from "react-router-dom";

import Config from "config";
import { TransfersState } from "slices/transfers";
import { useAppSelector } from "store";
import { formatRoute, stringFromTimestamp } from "utils/helpers";
import { TopLevelRoute } from "App/types";

import { Heading, HeadingLevel } from "components/Heading";
import { NavigationContainer } from "components/NavigationContainer";
import { Address, TransferDetailContainer } from "./TransferDetails.components";

type TransferDetailsParams = {
  id: string;
  appliedHash: string;
};

const TransferDetail = (): JSX.Element => {
  const navigate = useNavigate();
  const { appliedHash = "", id = "" } = useParams<TransferDetailsParams>();
  const { transactions } = useAppSelector<TransfersState>(
    (state) => state.transfers
  );

  const {
    chainId: sourceChainId = "",
    tokenType,
    amount,
    gas = 0,
    timestamp = 0,
    height = 0,
    memo,
    source,
    target,
    type,
    ibcTransfer,
  } = transactions.find(
    (transaction) => transaction.appliedHash === appliedHash
  ) || {};

  const sourceChain = Config.chain[sourceChainId] || {};

  const {
    chainId = "",
    sourceChannel,
    sourcePort,
    destinationChannel,
    destinationPort,
  } = ibcTransfer || {};

  const chains = Config.chain;
  const chain = chains[chainId];
  const { ibc = [] } = chain || {};
  const ibcChainId = ibc.find((ibcChainId) => ibcChainId === chainId) || "";

  const destinationChain = chains[ibcChainId];
  const chainAlias = destinationChain?.alias;

  const dateTimeFormatted = stringFromTimestamp(timestamp);

  return (
    <TransferDetailContainer>
      <NavigationContainer
        onBackButtonClick={() => {
          navigate(formatRoute(TopLevelRoute.TokenTransfers, { id }));
        }}
      >
        <Heading level={HeadingLevel.One}>Transfer Details</Heading>
      </NavigationContainer>
      <p>
        <strong>
          {type}
          <br />
          {amount} {tokenType}
          <br />
          {sourceChain.alias}
        </strong>
        <br />
        {dateTimeFormatted}
      </p>
      <p>Source address:</p>
      <Address>{source}</Address>
      <p>Target address:</p>
      <Address>{target}</Address>
      {chainId && (
        <>
          <p>
            Destination Chain:
            <br />
            <strong>
              {chainAlias}
              <br />
              {chainId}
            </strong>
          </p>
          <p>
            IBC Transfer Channel:
            <br />
            <strong>
              {sourceChannel}/{sourcePort} - {destinationChannel}/
              {destinationPort}
            </strong>
          </p>
        </>
      )}
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
