import { TxType } from "@heliax/namada-sdk/web";
import {
  BondProps,
  CommitmentDetailProps,
  RedelegateProps,
  RevealPkProps,
  UnbondProps,
  VoteProposalProps,
  WithdrawProps,
} from "@namada/types";
import { shortenAddress } from "@namada/utils";
import { NamCurrency } from "App/Common/NamCurrency";
import { ReactNode } from "react";
import { FaVoteYea } from "react-icons/fa";
import { FaRegEye, FaWallet } from "react-icons/fa6";
import { GoStack } from "react-icons/go";
import { PiDotsNineBold } from "react-icons/pi";
import { TransactionCard } from "./TransactionCard";

type CommitmentProps = {
  commitment: CommitmentDetailProps;
};

const IconMap: Record<TxType, React.ReactNode> = {
  [TxType.Bond]: <GoStack />,
  [TxType.Unbond]: <GoStack />,
  [TxType.Redelegate]: <GoStack />,
  [TxType.Withdraw]: <GoStack />,
  [TxType.RevealPK]: <FaRegEye />,
  [TxType.IBCTransfer]: <FaWallet />,
  [TxType.TransparentTransfer]: <FaWallet />,
  [TxType.EthBridgeTransfer]: <FaWallet />,
  [TxType.VoteProposal]: <FaVoteYea />,
  [TxType.Batch]: <PiDotsNineBold />,
};

const TitleMap: Record<TxType, string> = {
  [TxType.Bond]: "Stake",
  [TxType.Unbond]: "Unstake",
  [TxType.Redelegate]: "Re-Delegate",
  [TxType.Withdraw]: "Withdraw",
  [TxType.RevealPK]: "Reveal PK",
  [TxType.IBCTransfer]: "IBC Transfer",
  [TxType.TransparentTransfer]: "Transfer",
  [TxType.EthBridgeTransfer]: "ETH Transfer",
  [TxType.VoteProposal]: "Vote",
  [TxType.Batch]: "Batch",
};

const formatAddress = (address: string): string =>
  shortenAddress(address, 6, 6);

const renderContent = (tx: CommitmentDetailProps): ReactNode => {
  switch (tx.txType) {
    case TxType.Bond:
      const bondTx = tx as BondProps;
      return (
        <>
          Stake <NamCurrency amount={bondTx.amount} /> to{" "}
          {formatAddress(bondTx.validator)}
        </>
      );

    case TxType.Unbond:
      const unbondTx = tx as UnbondProps;
      return (
        <>
          Unstake <NamCurrency amount={unbondTx.amount} /> from{" "}
          {formatAddress(unbondTx.validator)}{" "}
        </>
      );

    case TxType.Redelegate:
      const redelegateTx = tx as RedelegateProps;
      return (
        <>
          Re-delegate <NamCurrency amount={redelegateTx.amount} /> from{" "}
          {formatAddress(redelegateTx.sourceValidator)} to{" "}
          {formatAddress(redelegateTx.destinationValidator)}{" "}
        </>
      );

    case TxType.Withdraw:
      const withdrawTx = tx as WithdrawProps;
      return (
        <>Withdraw staked amounts of {formatAddress(withdrawTx.validator)}</>
      );

    case TxType.VoteProposal:
      const voteTx = tx as VoteProposalProps;
      return (
        <>
          Vote {voteTx.vote} on proposal #{voteTx.proposalId}
        </>
      );

    case TxType.RevealPK:
      const revealTx = tx as RevealPkProps;
      return (
        <>Reveal public key for address {formatAddress(revealTx.publicKey)}</>
      );

    // TODO: continue implementing other types in the next phases
    default:
      return <></>;
  }
};

export const Commitment = ({ commitment }: CommitmentProps): JSX.Element => {
  const txType: TxType = commitment.txType as TxType;
  return (
    <TransactionCard
      title={TitleMap[txType]}
      content={renderContent(commitment)}
      icon={IconMap[txType]}
    />
  );
};
