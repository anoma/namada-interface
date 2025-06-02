import { Asset, IBCTrace } from "@chain-registry/types";
import { Stack } from "@namada/components";
import { AccountType, BparamsMsgValue } from "@namada/types";
import { allDefaultAccountsAtom } from "atoms/accounts";
import { namadaShieldedAssetsAtom } from "atoms/balance";
import { chainParametersAtom } from "atoms/chain";
import { findAssetsByChainId, ibcChannelsFamily } from "atoms/integrations";
import { SwapResponse, SwapResponseError, SwapResponseOk } from "atoms/swaps";
import { createOsmosisSwapTxAtom } from "atoms/transfer/atoms";
import BigNumber from "bignumber.js";
import { useTransactionFee } from "hooks/useTransactionFee";
import invariant from "invariant";
import { useAtomValue } from "jotai";
import { broadcastTransaction, signTx } from "lib/query";
import { useCallback, useEffect, useState } from "react";
import { AddressWithAssetAndAmount } from "types";
import { getSdkInstance } from "utils/sdk";

const SLIPPAGE = 0.005;
const SWAP_CONTRACT_ADDRESS =
  "osmo1lrlqeq38ephw8mz0c3uzfdpt4fh3fr0s2atur5n33md90m4wx3mqmz7fq6";

export const OsmosisSwap: React.FC = () => {
  const { mutateAsync: performOsmosisSwap } = useAtomValue(
    createOsmosisSwapTxAtom
  );
  const { data: availableAssets, isLoading: _isLoadingAssets } = useAtomValue(
    namadaShieldedAssetsAtom
  );

  const chainParameters = useAtomValue(chainParametersAtom);
  const namadaAssets =
    chainParameters.data ?
      findAssetsByChainId(chainParameters.data.chainId)
    : [];
  const osmosisAssets =
    chainParameters.data ? findAssetsByChainId("osmosis-1") : [];

  const [from, setFrom] = useState<AddressWithAssetAndAmount | undefined>();
  const [to, setTo] = useState<Asset | undefined>();
  const [amount, setAmount] = useState<string>("");
  const [recipient, setRecipient] = useState<string>(
    "znam17drxewzvge966gzcl0u6tr4j90traepujm2vd8ptwwkgrftnhs2hdtnyzgl5freyjsdnchn4ddy"
  );
  const [localRecoveryAddr, setLocalRecoveryAddress] = useState<string>(
    "osmo18st0wqx84av8y6xdlss9d6m2nepyqwj6n3q7js"
  );
  const [quote, setQuote] = useState<
    (SwapResponseOk & { minAmount: string }) | null
  >(null);

  const { data: ibcChannels } = useAtomValue(ibcChannelsFamily("osmosis"));

  const feeProps = useTransactionFee(["IbcTransfer"], true);

  useEffect(() => {
    const call = async (): Promise<void> => {
      invariant(from, "No from asset selected");
      invariant(to, "No to asset selected");
      // We have to map namada assets to osmosis assets to get correct base
      const fromOsmosis = osmosisAssets.find(
        (assets) => assets.symbol === from.asset.symbol
      );
      const toOsmosis = osmosisAssets.find(
        (assets) => assets.symbol === to.symbol
      );

      invariant(fromOsmosis, "From asset is not found in Osmosis assets");
      invariant(toOsmosis, "To asset is not found in Osmosis assets");

      const quote = await fetch(
        "https://sqs.osmosis.zone/router/quote?" +
          new URLSearchParams({
            tokenIn: `${amount}${fromOsmosis.base}`,
            tokenOutDenom: toOsmosis.base,
            humanDenoms: "false",
          }).toString()
      );
      const response: SwapResponse = await quote.json();

      if (!(response as SwapResponseError).message) {
        const r = response as SwapResponseOk;
        const minAmount = BigNumber(r.amount_out)
          .times(BigNumber(1).minus(SLIPPAGE))
          .toString();
        setQuote({ ...(response as SwapResponseOk), minAmount });
      } else {
        setQuote(null);
      }
    };
    if (from && to && amount) {
      call();
    }
  }, [from?.originalAddress, to?.address, amount]);

  const defaultAccounts = useAtomValue(allDefaultAccountsAtom);
  const shieldedAccount = defaultAccounts.data?.find(
    (account) => account.type === AccountType.ShieldedKeys
  );
  const transparentAccount = defaultAccounts.data?.find(
    (account) => account.type !== AccountType.ShieldedKeys
  );

  const handleOsmosisSwap = useCallback(async () => {
    invariant(transparentAccount, "No transparent account is found");
    invariant(shieldedAccount, "No shielded account is found");
    invariant(from, "No from asset");
    invariant(to, "No to asset");
    invariant(ibcChannels, "No ibc channels");
    invariant(quote, "No quote");
    invariant(localRecoveryAddr, "No local recovery address");
    invariant(recipient, "No recipient");

    const toTrace = to.traces?.find((t): t is IBCTrace => t.type === "ibc")
      ?.chain.path;
    invariant(toTrace, "No IBC trace found for the to asset");
    invariant(quote.route[0], "No route found in the quote");
    const route = quote.route[0].pools.map((p) => ({
      poolId: String(p.id),
      tokenOutDenom: p.token_out_denom,
    }));

    let bparams: BparamsMsgValue[] | undefined;
    if (transparentAccount.type === AccountType.Ledger) {
      const sdk = await getSdkInstance();
      const ledger = await sdk.initLedger();
      bparams = await ledger.getBparams();
      ledger.closeTransport();
    }

    const transfer = {
      amountInBaseDenom: BigNumber(amount),
      // osmosis channel
      channelId: "channel-7",
      portId: "transfer",
      token: from.originalAddress,
      source: shieldedAccount.pseudoExtendedKey!,
      gasSpendingKey: shieldedAccount.pseudoExtendedKey!,
      receiver: SWAP_CONTRACT_ADDRESS,
      bparams,
      // TODO: replace with disposable signer
      refundTarget: transparentAccount.address,
    };
    const params = {
      transfer,
      outputDenom: toTrace,
      recipient,
      // TODO: this should also be disposable address most likely
      overflow: transparentAccount.address,
      slippage: {
        0: BigNumber(quote.minAmount)
          .integerValue(BigNumber.ROUND_DOWN)
          .toString(),
      },
      localRecoveryAddr,
      route,
      // TODO: not sure if hardcoding is ok, maybe we should connect keplr wallet
      osmosisRestRpc: "https://osmosis-rest.publicnode.com",
    };

    try {
      const encodedTxData = await performOsmosisSwap({
        signer: {
          // TODO: use disposable signer
          publicKey: transparentAccount.publicKey!,
          address: transparentAccount.address!,
        },
        account: transparentAccount,
        params: [params],
        gasConfig: feeProps.gasConfig,
      });

      // TODO: use disposable signer
      const signedTxs = await signTx(
        encodedTxData,
        transparentAccount.address!
      );
      const wwww = await broadcastTransaction(encodedTxData, signedTxs);
      console.log("Transaction broadcasted:", wwww);
      alert("Transaction sent 🚀");
    } catch (error) {
      console.error("Error performing Osmosis swap:", error);
      alert("Transaction errror 🪦");
    }
  }, [transparentAccount, shieldedAccount, quote]);

  return (
    <div className="text-white">
      <div>From:</div>
      <Stack direction="horizontal">
        <select
          className="text-black"
          onChange={(e) => setFrom(availableAssets?.[e.target.value])}
        >
          <option value=""></option>
          {Object.values(availableAssets || {}).map((al, idx) => (
            <option key={`${al.asset.base}_${idx}`} value={al.originalAddress}>
              {al.asset.symbol}
            </option>
          ))}
        </select>
        <div>{from?.amount?.toString()}</div>
      </Stack>
      <div>To:</div>
      <select
        className="text-black"
        onChange={(e) => setTo(namadaAssets[Number(e.target.value)])}
      >
        <option value=""></option>
        {namadaAssets.map((asset, i) => (
          <option key={asset.base} value={i}>
            {asset.symbol}
          </option>
        ))}
      </select>
      <div>Amount in base denom:</div>
      <input
        className="text-black"
        type="text"
        onChange={(e) => setAmount(e.target.value)}
      />
      <div>Recipient(znam address):</div>
      <input
        className="text-black"
        type="text"
        onChange={(e) => setRecipient(e.target.value)}
        value={recipient}
      />
      <div>
        Local recovery address(osmosis address to send tokens to in case
        something goes wrong on osmisis)
      </div>
      <input
        className="text-black"
        type="text"
        onChange={(e) => setLocalRecoveryAddress(e.target.value)}
        value={localRecoveryAddr}
      />
      <br />
      <button
        className="bg-yellow text-black p-4 m-3"
        onClick={handleOsmosisSwap}
      >
        SWAP🎏
      </button>

      <p>---</p>
      <div> Receive: </div>
      {quote && (
        <div>
          <div>
            Amount in: {quote.amount_in.amount}
            {from?.asset.denom_units[0].aliases?.[0]}
          </div>
          <div>
            Amount out: {quote.amount_out}
            {to?.denom_units[0].aliases?.[0]}
          </div>
          <div>
            Min amount out: {quote.minAmount}
            {to?.denom_units[0].aliases?.[0]}
          </div>
          <div>Slippage: {SLIPPAGE * 100}%</div>
          <div>Routes: </div>
          <div>Effective fee: {BigNumber(quote.effective_fee).toString()}</div>
          <div>
            Price: 1 {from?.asset.symbol} ≈{" "}
            {BigNumber(quote.amount_out).div(BigNumber(amount)).toString()}{" "}
            {to?.symbol}
          </div>
          <div>
            Price impact: {BigNumber(quote.price_impact).dp(3).toString()}
          </div>
          <ul className="list-disc list-inside">
            {quote.route.map((r, i) => (
              <li key={i}>
                Route{i + 1}
                <ul className="list-disc list-inside pl-4">
                  {r.pools.map((p, i) => (
                    <li key={i}>
                      {p.id}: {p.token_out_denom}
                      (Fee: {BigNumber(p.taker_fee).toString()})
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
