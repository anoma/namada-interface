import BigNumber from "bignumber.js";

import {
  QueryBalanceArgs,
  SubmitTransferArgs,
  parseExampleArgs,
  queryBalanceOptions,
  submitTransferArgs,
} from "./args";
import { queryBalance } from "./queryBalance";
import { submitTransfer } from "./submitTransfer";

const examples = ["queryBalance", "submitTransfer"] as const;

const main = async (): Promise<void> => {
  const maybeExample = process.argv[2];

  if (!examples.includes(maybeExample as (typeof examples)[number])) {
    console.error(
      `Example ${maybeExample} not found. Available examples: ${examples.join(
        ", "
      )}`
    );
    process.exit(1);
  }
  const allArgs = process.argv.slice(3);

  switch (maybeExample) {
    case "queryBalance":
      const queryArgs = parseExampleArgs<QueryBalanceArgs>(
        allArgs,
        queryBalanceOptions
      );

      await queryBalance(
        queryArgs.node,
        queryArgs.nativeToken,
        queryArgs.owner,
        queryArgs.token
      );
      break;
    case "submitTransfer":
      const transferArgs = parseExampleArgs<SubmitTransferArgs>(
        allArgs,
        submitTransferArgs
      );

      await submitTransfer(
        transferArgs.node,
        transferArgs.nativeToken,
        {
          chainId: transferArgs.chainId,
          publicKey: transferArgs.publicKey,
        },
        {
          source: transferArgs.source,
          target: transferArgs.target,
          amount: BigNumber(transferArgs.amount),
        },
        transferArgs.signingKey
      );

      break;
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
