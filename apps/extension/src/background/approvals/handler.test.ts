/* eslint-disable @typescript-eslint/no-explicit-any */
import { TxType } from "@namada/sdk/web";
import { AccountType } from "@namada/types";
import createMockInstance from "jest-create-mock-instance";
import {
  ApproveConnectInterfaceMsg,
  ApproveSignArbitraryMsg,
  ApproveTxMsg,
  IsConnectionApprovedMsg,
} from "provider";
import { Message } from "router";
import { getHandler } from "./handler";
import {
  ConnectInterfaceResponseMsg,
  RejectSignatureMsg,
  RejectTxMsg,
  RevokeConnectionMsg,
  SubmitApprovedSignatureMsg,
  SubmitApprovedTxMsg,
} from "./messages";
import { ApprovalsService } from "./service";

jest.mock("webextension-polyfill", () => ({}));

class UnknownMsg extends Message<unknown> {
  validate(): void {}
  route(): string {
    return "unknown";
  }
  type(): string {
    return "unknown";
  }
}

describe("approvals handler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("handlers switch", () => {
    const service: jest.Mocked<ApprovalsService> = createMockInstance(
      ApprovalsService as any
    );
    const handler = getHandler(service);
    const env = {
      isInternalMsg: true,
      senderTabId: 1,
      requestInteraction: () => {},
    };

    const approveTxMsg = new ApproveTxMsg(
      TxType.Bond,
      "txMsg",
      "specificMsg",
      AccountType.Mnemonic
    );
    handler(env, approveTxMsg);
    expect(service.approveTx).toBeCalled();

    const rejectTxMsg = new RejectTxMsg("msgId");
    handler(env, rejectTxMsg);
    expect(service.rejectTx).toBeCalled();

    const submitApprovedTxMsg = new SubmitApprovedTxMsg(TxType.Bond, "msgId");
    handler(env, submitApprovedTxMsg);
    expect(service.submitTx).toBeCalled();

    const isConnectionApprovedMsg = new IsConnectionApprovedMsg();
    handler(env, isConnectionApprovedMsg);
    expect(service.isConnectionApproved).toBeCalled();

    const approveConnectInterfaceMsg = new ApproveConnectInterfaceMsg();
    handler(env, approveConnectInterfaceMsg);
    expect(service.approveConnection).toBeCalled();

    const connectInterfaceResponseMsg = new ConnectInterfaceResponseMsg(
      0,
      "",
      true
    );
    handler(env, connectInterfaceResponseMsg);
    expect(service.approveConnectionResponse).toBeCalled();

    const revokeConnectionMsg = new RevokeConnectionMsg("");
    handler(env, revokeConnectionMsg);
    expect(service.revokeConnection).toBeCalled();

    const approveSignArbitraryMsg = new ApproveSignArbitraryMsg("", "");
    handler(env, approveSignArbitraryMsg);
    expect(service.approveSignature).toBeCalled();

    const rejectSignatureMsg = new RejectSignatureMsg("");
    handler(env, rejectSignatureMsg);
    expect(service.rejectSignature).toBeCalled();

    const submitApprovedSignatureMsg = new SubmitApprovedSignatureMsg("", "");
    handler(env, submitApprovedSignatureMsg);
    expect(service.submitSignature).toBeCalled();

    const unknownMsg = new UnknownMsg();
    expect(() => handler(env, unknownMsg)).toThrow();
  });
});
