export type SpendingKey = string;

export type GenerateProofMessage = {
  type: string;
  target: string;
  routerId: number;
  data: GenerateProofMessageData;
};

export type GenerateProofMessageData = {
  transferMsg: string;
  txMsg: string;
  msgId: string;
  spendingKey: SpendingKey;
  rpc: string;
  nativeToken: string;
};

export const INIT_MSG = "init";
export const GENERATE_PROOF_SUCCESSFUL_MSG = "generate-proof-successful";
export const GENERATE_PROOF_FAILED_MSG = "generate-proof-failed";
export const WEB_WORKER_ERROR_MSG = "web-worker-error";
export type MsgName =
  | typeof INIT_MSG
  | typeof GENERATE_PROOF_FAILED_MSG
  | typeof GENERATE_PROOF_SUCCESSFUL_MSG
  | typeof WEB_WORKER_ERROR_MSG;

export type Msg = { msgName: MsgName; payload?: string };
