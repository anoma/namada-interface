import { parseArgs } from "node:util";

type CommonArgs = {
  node: string;
  nativeToken: string;
};

export type QueryBalanceArgs = CommonArgs & {
  owner: string;
  token: string;
};

export type SubmitTransferArgs = CommonArgs & {
  chainId: string;
  source: string;
  target: string;
  amount: string;
  signingKey: string;
  publicKey: string;
};

type ExampleArgs = QueryBalanceArgs | SubmitTransferArgs;

const commonOptions = {
  node: {
    type: "string",
    short: "n",
  },
  nativeToken: {
    type: "string",
    short: "t",
  },
} as const;

export const queryBalanceOptions = {
  ...commonOptions,
  owner: { type: "string" },
  token: { type: "string" },
} as const;

export const submitTransferArgs = {
  ...commonOptions,
  chainId: { type: "string" },
  source: { type: "string" },
  target: { type: "string" },
  amount: { type: "string" },
  signingKey: { type: "string" },
  publicKey: { type: "string" },
} as const;

type Options = Record<string, { type: "string" | "boolean"; short?: string }>;

export const parseExampleArgs = <T extends ExampleArgs>(
  allArgs: string[],
  options: Options
): T => {
  const maybeArgs = parseArgs({
    args: allArgs,
    options,
  }).values;

  for (const [name] of Object.entries(options)) {
    if (!(name in maybeArgs)) {
      throw new Error(`--${name} must be provided`);
    }
  }
  // Unfortunatelly TS is stupid and can't infer that maybeArgs has all required keys
  return maybeArgs as T;
};
