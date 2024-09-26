/* eslint-disable @typescript-eslint/no-explicit-any */
import { WrapperTxMsgValue } from "@namada/types";
import BigNumber from "bignumber.js";
import createMockInstance from "jest-create-mock-instance";
import {
  ApproveConnectInterfaceMsg,
  ApproveSignArbitraryMsg,
  ApproveSignTxMsg,
  IsConnectionApprovedMsg,
} from "provider";
import { Message } from "router";
import { getHandler } from "./handler";
import {
  ConnectInterfaceResponseMsg,
  DisconnectInterfaceResponseMsg,
  RejectSignArbitraryMsg,
  RejectSignTxMsg,
  RevokeConnectionMsg,
  SubmitApprovedSignArbitraryMsg,
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
    const chainId = "";
    const service: jest.Mocked<ApprovalsService> = createMockInstance(
      ApprovalsService as any
    );
    const handler = getHandler(service);
    const env = {
      isInternalMsg: true,
      senderTabId: 1,
      requestInteraction: () => {},
    };

    const approveTxMsg = new ApproveSignTxMsg(
      [
        {
          args: new WrapperTxMsgValue({
            token: "",
            feeAmount: BigNumber(0),
            gasLimit: BigNumber(0),
            chainId: "",
          }),
          hash: "",
          bytes: "",
          signingData: [],
        },
      ],
      "signer"
    );

    handler(env, approveTxMsg);
    expect(service.approveSignTx).toBeCalled();

    const rejectTxMsg = new RejectSignTxMsg("msgId");
    handler(env, rejectTxMsg);
    expect(service.rejectSignTx).toBeCalled();

    const isConnectionApprovedMsg = new IsConnectionApprovedMsg(chainId);
    handler(env, isConnectionApprovedMsg);
    expect(service.isConnectionApproved).toBeCalled();

    const approveConnectInterfaceMsg = new ApproveConnectInterfaceMsg(chainId);
    handler(env, approveConnectInterfaceMsg);
    expect(service.approveConnection).toBeCalled();

    const connectInterfaceResponseMsg = new ConnectInterfaceResponseMsg(
      "",
      chainId,
      true
    );
    handler(env, connectInterfaceResponseMsg);
    expect(service.approveConnectionResponse).toBeCalled();

    const disconnectInterfaceResponseMsg = new DisconnectInterfaceResponseMsg(
      "",
      true
    );
    handler(env, disconnectInterfaceResponseMsg);
    expect(service.approveDisconnectionResponse).toBeCalled();

    const revokeConnectionMsg = new RevokeConnectionMsg("");
    handler(env, revokeConnectionMsg);
    expect(service.revokeConnection).toBeCalled();

    const approveSignArbitraryMsg = new ApproveSignArbitraryMsg("", "");
    handler(env, approveSignArbitraryMsg);
    expect(service.approveSignArbitrary).toBeCalled();

    const rejectSignArbitraryMsg = new RejectSignArbitraryMsg("");
    handler(env, rejectSignArbitraryMsg);
    expect(service.rejectSignArbitrary).toBeCalled();

    const submitApprovedSignArbitrartyMsg = new SubmitApprovedSignArbitraryMsg(
      "",
      ""
    );
    handler(env, submitApprovedSignArbitrartyMsg);
    expect(service.submitSignArbitrary).toBeCalled();

    const unknownMsg = new UnknownMsg();
    expect(() => handler(env, unknownMsg)).toThrow();
  });
});
