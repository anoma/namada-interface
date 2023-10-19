import {
  Query,
  TransferToEthereum,
  TransferToEthereumStatus,
} from "@namada/shared";
import { useEffect, useState } from "react";
import {
  TransferCol,
  TransferRow,
  TransfersContainer,
} from "./EthereumBridgeTransfers.components";
import { shortenAddress } from "@namada/utils";
import { chains } from "@namada/chains";
import { Account } from "slices/accounts";

type EthereumBridgeTransfersProps = {
  accounts: Account[];
  chainId: string;
};

type TransferStatus = "pending" | "relayed" | "expired" | "unknown";

const getStatus = (
  hash: string,
  status?: TransferToEthereumStatus
): TransferStatus => {
  const res = status
    ? status.pending.find((tx) => tx === hash)
      ? "pending"
      : status.relayed.find((tx) => tx === hash)
      ? "relayed"
      : status.expired.find((tx) => tx === hash)
      ? "expired"
      : "unknown"
    : "unknown";

  return res;
};

export const EthereumBridgeTransfers = ({
  accounts,
  chainId,
}: EthereumBridgeTransfersProps): JSX.Element => {
  const [transfers, setTransfers] = useState<[string, TransferToEthereum][]>(
    []
  );
  const [transfersStatus, setTransfersStatus] =
    useState<TransferToEthereumStatus>();
  const [transfersLoaded, setTransfersLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const { rpc } = chains[chainId];
      const query = new Query(rpc);
      const addresses = accounts.map(({ details }) => details.address);
      const bridgePool: [string, TransferToEthereum][] =
        await query.query_signed_bridge_pool(addresses);
      const hashes = bridgePool.map(([hash]) => hash);
      const txStatus: TransferToEthereumStatus =
        await query.query_eth_transfer_status(hashes);

      setTransfersStatus(txStatus);
      setTransfers(bridgePool);
      setTransfersLoaded(true);
    })();
  }, [JSON.stringify(accounts)]);

  return transfersLoaded && transfers.length > 0 ? (
    <TransfersContainer>
      <h3>Pending Transfers</h3>
      <TransferRow>
        <TransferCol>Kind</TransferCol>
        <TransferCol>Status</TransferCol>
        <TransferCol>Sender</TransferCol>
        <TransferCol>Recipient</TransferCol>
        <TransferCol>Amount</TransferCol>
        <TransferCol>Asset</TransferCol>
      </TransferRow>
      {transfers.map(([hash, transfer], i) => (
        <TransferRow key={i}>
          <TransferCol>{transfer.kind}</TransferCol>
          <TransferCol>{getStatus(hash, transfersStatus)}</TransferCol>
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
