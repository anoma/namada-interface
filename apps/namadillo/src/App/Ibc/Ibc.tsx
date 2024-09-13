import { Coin } from "@cosmjs/launchpad";
import { coin, coins } from "@cosmjs/proto-signing";
import {
  QueryClient,
  SigningStargateClient,
  StargateClient,
  setupIbcExtension,
} from "@cosmjs/stargate";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import { Window as KeplrWindow } from "@keplr-wallet/types";
import { Panel } from "@namada/components";
import { DerivedAccount, WindowWithNamada } from "@namada/types";
import { useState } from "react";

const keplr = (window as KeplrWindow).keplr!;
const namada = (window as WindowWithNamada).namada!;

const chain = "theta-testnet-001";
const rpc = "https://rpc-t.cosmos.nodestake.top";

const buttonStyles = "bg-white my-2 p-2 block";

export const Ibc: React.FC = () => {
  const [error, setError] = useState("");
  const [address, setAddress] = useState("");
  const [alias, setAlias] = useState("");
  const [balances, setBalances] = useState<Coin[] | undefined>();
  const [namadaAccounts, setNamadaAccounts] = useState<DerivedAccount[]>();
  const [token, setToken] = useState("");
  const [target, setTarget] = useState("");
  const [amount, setAmount] = useState("");
  const [channelId, setChannelId] = useState("");

  const withErrorReporting =
    (fn: () => Promise<void>): (() => Promise<void>) =>
    async () => {
      try {
        await fn();
        setError("");
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log(e);
        setError(e instanceof Error ? e.message : "unknown error");
      }
    };

  const getAddress = withErrorReporting(async () => {
    const key = await keplr.getKey(chain);
    setAddress(key.bech32Address);
    setAlias(key.name);
  });

  const getBalances = withErrorReporting(async () => {
    setBalances(undefined);
    const balances = await queryBalances(address);
    setBalances(balances);
  });

  const getNamadaAccounts = withErrorReporting(async () => {
    const accounts = await namada.accounts();
    setNamadaAccounts(accounts);
  });

  const submitIbcTransfer = withErrorReporting(async () =>
    submitBridgeTransfer(rpc, chain, address, target, token, amount, channelId)
  );

  return (
    <Panel title="IBC" className="mb-2 bg-[#999999] text-black">
      {/* Error */}
      <p className="text-[#ff0000]">{error}</p>

      <hr />

      {/* Keplr addresses */}
      <h3>Keplr addresses</h3>
      <button className={buttonStyles} onClick={getAddress}>
        get address
      </button>
      <p>
        {alias} {address}
      </p>

      <hr />

      {/* Balances */}
      <h3>Balances</h3>
      <button className={buttonStyles} onClick={getBalances}>
        get balances
      </button>
      {balances?.map(({ denom, amount }) => (
        <div key={denom}>
          <label>
            <input
              type="radio"
              name="token"
              value={denom}
              checked={token === denom}
              onChange={(e) => setToken(e.target.value)}
            />
            {denom} {amount}
          </label>
        </div>
      ))}

      <hr />

      {/* Namada accounts */}
      <h3>Namada accounts</h3>
      <button className={buttonStyles} onClick={getNamadaAccounts}>
        get namada accounts
      </button>

      {namadaAccounts?.map(({ alias, address }) => (
        <div key={address}>
          <label>
            <input
              type="radio"
              name="target"
              value={address}
              checked={target === address}
              onChange={(e) => setTarget(e.target.value)}
            />
            {alias} {address}
          </label>
        </div>
      ))}

      <hr />

      {/* Amount to send */}
      <h3>Amount to send</h3>
      <input value={amount} onChange={(e) => setAmount(e.target.value)} />

      <hr />

      {/* Channel ID */}
      <h3>Channel ID</h3>
      <input value={channelId} onChange={(e) => setChannelId(e.target.value)} />

      <hr />

      {/* Submit IBC transfer */}
      <h3>Submit IBC transfer</h3>
      <button className={buttonStyles} onClick={submitIbcTransfer}>
        submit IBC transfer
      </button>
    </Panel>
  );
};

const queryBalances = async (owner: string): Promise<Coin[]> => {
  const client = await StargateClient.connect(rpc);
  const balances = (await client.getAllBalances(owner)) || [];

  await Promise.all(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    balances.map(async (coin: any) => {
      // any becuse of annoying readonly
      if (coin.denom.startsWith("ibc/")) {
        coin.denom = await ibcAddressToDenom(coin.denom);
      }
    })
  );

  return [...balances];
};

const ibcAddressToDenom = async (address: string): Promise<string> => {
  const tmClient = await Tendermint34Client.connect(rpc);
  const queryClient = new QueryClient(tmClient);
  const ibcExtension = setupIbcExtension(queryClient);

  const ibcHash = address.replace("ibc/", "");
  const { denomTrace } = await ibcExtension.ibc.transfer.denomTrace(ibcHash);
  const baseDenom = denomTrace?.baseDenom;

  if (typeof baseDenom === "undefined") {
    throw new Error("couldn't get denom from ibc address");
  }

  return baseDenom;
};

const submitBridgeTransfer = async (
  rpc: string,
  sourceChainId: string,
  source: string,
  target: string,
  token: string,
  amount: string,
  channelId: string
): Promise<void> => {
  const client = await SigningStargateClient.connectWithSigner(
    rpc,
    keplr.getOfflineSigner(sourceChainId),
    {
      broadcastPollIntervalMs: 300,
      broadcastTimeoutMs: 8_000,
    }
  );

  const fee = {
    amount: coins("0", token),
    gas: "222000",
  };

  const response = await client.sendIbcTokens(
    source,
    target,
    coin(amount, token),
    "transfer",
    channelId,
    undefined, // timeout height
    Math.floor(Date.now() / 1000) + 60, // timeout timestamp
    fee,
    `${sourceChainId}->Namada`
  );

  if (response.code !== 0) {
    throw new Error(response.code + " " + response.rawLog);
  }
};
