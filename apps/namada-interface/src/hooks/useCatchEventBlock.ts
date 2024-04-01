import { Comet38Client } from "@cosmjs/tendermint-rpc";
import { useEffect, useState } from "react";
import { useAppSelector } from "store";
import { Subscription } from "xstream";

import { AccountsState } from "slices/accounts";
import {
  connectWebsocketClient,
  subscribeNewBlock,
  validateConnection,
} from "utils/subscribeNewBlock";

type TUseCatchEventBlockProps = {
  rpcAddress: string;
  refreshBalancesAtom: () => void;
  triggerCallback: () => void;
};

function useCatchEventBlock({
  rpcAddress,
  refreshBalancesAtom,
  triggerCallback,
}: TUseCatchEventBlockProps): {
  connectState: boolean;
  tmClient: Comet38Client | undefined;
  subscription: Subscription | undefined;
} {
  const [connectState, setConnectState] = useState<boolean>(false);
  const [tmClient, setTmClient] = useState<Comet38Client>();
  const [subscription, setSubscription] = useState<Subscription>();

  const { derived } = useAppSelector<AccountsState>((state) => state.accounts);

  const connect = async (address: string): Promise<void> => {
    try {
      const isValid = await validateConnection(address);
      if (!isValid) {
        throw new Error("Invalid network!");
      }

      const tmClient = await connectWebsocketClient(address);
      if (!tmClient) {
        throw new Error("Can't connect to client!");
      }

      setConnectState(true);
      setTmClient(tmClient);
    } catch (err) {
      console.error(err);
      return;
    }
  };

  useEffect(() => {
    connect(rpcAddress);
  }, [rpcAddress]);

  useEffect(() => {
    if (tmClient) {
      // triggerCallback is function want to trigger when having new block
      const subscription = subscribeNewBlock(tmClient, triggerCallback);
      setSubscription(subscription);
    }
  }, [tmClient]);

  useEffect(() => {
    // only refresh balance in account slice is not enouge. Need call function refresh balance below
    refreshBalancesAtom();
  }, [derived]);

  return { connectState, tmClient, subscription };
}

export default useCatchEventBlock;
