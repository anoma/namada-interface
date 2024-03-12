import BigNumber from "bignumber.js";

/* Query balance example

yarn example queryBalance \
-n http://127.0.0.1:27657 \
-t tnam1qxgfw7myv4dh0qna4hq0xdg6lx77fzl7dcem8h7e \
--token tnam1qxgfw7myv4dh0qna4hq0xdg6lx77fzl7dcem8h7e \
--owner tnam1qqshvryx9pngpk7mmzpzkjkm6klelgusuvmkc0uz

*/

/* Submit transfer example

yarn example submitTransfer \
-n http://127.0.0.1:27657 \
-t tnam1qxgfw7myv4dh0qna4hq0xdg6lx77fzl7dcem8h7e \
--source tnam1qqshvryx9pngpk7mmzpzkjkm6klelgusuvmkc0uz \
--target tnam1qz4sdx5jlh909j44uz46pf29ty0ztftfzc98s8dx \
--amount 100 \
--chainId localnet.a38cf62f63db8c1a1f3c9 \
--signingKey 0134eae1393f86a8da08bc476b89dc73eed9040095b604d347ceacc1b734b32b \
--publicKey tpknam1qzz3nvg5zjwdpk5z0x9ngkf7guv9qpqrtz0da7weenwl5766pkkgvvt689t

*/

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
