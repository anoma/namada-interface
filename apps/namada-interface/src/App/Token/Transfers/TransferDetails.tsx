import { useNavigate } from "react-router-dom";

import { chains } from "@anoma/chains";
import { Chain } from "@anoma/types";
import { stringFromTimestamp } from "@anoma/utils";
import {
  Heading,
  HeadingLevel,
  NavigationContainer,
  Icon,
  IconName,
} from "@anoma/components";

import { TransfersState } from "slices/transfers";
import { useAppSelector } from "store";
import { Address, TransferDetailContainer } from "./TransferDetails.components";
import { BackButton } from "../TokenSend/TokenSendForm.components";
import { ButtonsContainer, TransfersContent } from "./Transfers.components";
import { useSanitizedParams } from "@anoma/hooks";

type TransferDetailsParams = {
  id: string;
  appliedHash: string;
};

const TransferDetail = (): JSX.Element => {
  const navigate = useNavigate();
  const { appliedHash = "" } = useSanitizedParams<TransferDetailsParams>();
  const { transactions } = useAppSelector<TransfersState>(
    (state) => state.transfers
  );

  const {
    chainId: sourceChainId,
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

  const sourceChain: Chain | undefined = Object.values(chains).find(
    (chain: Chain) => chain.chainId === sourceChainId
  );

  const {
    chainId,
    sourceChannel,
    sourcePort,
    destinationChannel,
    destinationPort,
  } = ibcTransfer || {};

  const chainAlias = sourceChain?.alias;
  const dateTimeFormatted = stringFromTimestamp(timestamp);

  return (
    <TransferDetailContainer>
      <NavigationContainer>
        <Heading level={HeadingLevel.One}>Transfer Details</Heading>
      </NavigationContainer>
      <TransfersContent>
        <p>
          <strong>
            {type}
            <br />
            {amount} {tokenType}
            <br />
            {sourceChain?.alias}
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
      </TransfersContent>

      <ButtonsContainer>
        <BackButton onClick={() => navigate(-1)}>
          <Icon iconName={IconName.ChevronLeft} />
        </BackButton>
      </ButtonsContainer>
    </TransferDetailContainer>
  );
};

export default TransferDetail;
