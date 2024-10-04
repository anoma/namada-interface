import { OfflineSigner } from "@cosmjs/launchpad";
import { coin, coins } from "@cosmjs/proto-signing";
import {
  MsgTransferEncodeObject,
  SigningStargateClient,
} from "@cosmjs/stargate";
import BigNumber from "bignumber.js";
import { getSdkInstance } from "hooks";

type CommonParams = {
  signer: OfflineSigner;
  sourceAddress: string;
  destinationAddress: string;
  amount: BigNumber;
  token: string;
  sourceChannelId: string;
};

type TransparentParams = CommonParams & { isShielded: false };
type ShieldedParams = CommonParams & {
  isShielded: true;
  destinationChannelId: string;
};

export type IbcTransferParams = TransparentParams | ShieldedParams;

const getShieldedArgs = async (
  target: string,
  token: string,
  amount: BigNumber,
  destinationChannelId: string
): Promise<{ receiver: string; memo: string }> => {
  const sdk = await getSdkInstance();

  const memo = await sdk.tx.generateIbcShieldingMemo(
    target,
    token,
    amount,
    destinationChannelId
  );

  return {
    receiver: sdk.masp.maspAddress(),
    memo,
  };
};

export const submitIbcTransfer =
  (transferParams: IbcTransferParams) =>
  async (rpc: string): Promise<void> => {
    const {
      signer,
      sourceAddress,
      destinationAddress,
      amount,
      token,
      sourceChannelId,
      isShielded,
    } = transferParams;

    const client = await SigningStargateClient.connectWithSigner(rpc, signer, {
      broadcastPollIntervalMs: 300,
      broadcastTimeoutMs: 8_000,
    });

    const fee = {
      amount: coins("0", token),
      gas: "222000",
    };

    const timeoutTimestampNanoseconds =
      BigInt(Math.floor(Date.now() / 1000) + 60) * BigInt(1_000_000_000);

    const { receiver, memo }: { receiver: string; memo?: string } =
      isShielded ?
        await getShieldedArgs(
          destinationAddress,
          token,
          amount,
          transferParams.destinationChannelId
        )
      : { receiver: destinationAddress };

    const transferMsg: MsgTransferEncodeObject = {
      typeUrl: "/ibc.applications.transfer.v1.MsgTransfer",
      value: {
        sourcePort: "transfer",
        sourceChannel: sourceChannelId,
        sender: sourceAddress,
        receiver,
        token: coin(amount.toString(), token),
        timeoutHeight: undefined,
        timeoutTimestamp: timeoutTimestampNanoseconds,
        memo,
      },
    };

    const response = await client.signAndBroadcast(
      sourceAddress,
      [transferMsg],
      fee
    );

    if (response.code !== 0) {
      throw new Error(response.code + " " + response.rawLog);
    }
  };
