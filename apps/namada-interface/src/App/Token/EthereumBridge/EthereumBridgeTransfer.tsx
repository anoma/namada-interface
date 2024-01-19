import { chains } from "@namada/chains";
import { Query, TransferToEthereum } from "@namada/shared";
import { shortenAddress } from "@namada/utils";
import { useEffect, useState } from "react";
import { Account } from "slices/accounts";
import {
  TransferCol,
  TransferRow,
  TransfersContainer,
} from "./EthereumBridgeTransfers.components";

type EthereumBridgeTransfersProps = {
  accounts: Account[];
  chainId: string;
};

export const EthereumBridgeTransfers = (
  { accounts, chainId }: EthereumBridgeTransfersProps
): JSX.Element => {
  const [pendingTransfers, setPendingTransfers] = useState<
    TransferToEthereum[]
  >([]);
  const [transfersLoaded, setTransfersLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const { rpc } = chains[chainId];
      const query = new Query(rpc);
      const addresses = accounts.map(({ details }) => details.address);
      const bridgePool: TransferToEthereum[] =
        await query.query_signed_bridge_pool(addresses);
      setPendingTransfers(bridgePool);
      setTransfersLoaded(true);
    })();
  }, [JSON.stringify(accounts)]);

  return transfersLoaded && pendingTransfers.length > 0 ? (
    <TransfersContainer>
      <h3>Pending Transfers</h3>
      <TransferRow>
        <TransferCol>Kind</TransferCol>
        <TransferCol>Sender</TransferCol>
        <TransferCol>Recipient</TransferCol>
        <TransferCol>Amount</TransferCol>
        <TransferCol>Asset</TransferCol>
      </TransferRow>
      {pendingTransfers.map((transfer, i) => (
        <TransferRow key={i}>
          <TransferCol>{transfer.kind}</TransferCol>
          <TransferCol>{shortenAddress(transfer.sender, 4, 4)}</TransferCol>
          <TransferCol>{shortenAddress(transfer.recipient, 4, 4)}</TransferCol>
          <TransferCol>{transfer.amount}</TransferCol>
          <TransferCol>{shortenAddress(transfer.asset, 4, 4)}</TransferCol>
        </TransferRow>
      ))}
    </TransfersContainer>
  ) : (
    <></>
  );
};
