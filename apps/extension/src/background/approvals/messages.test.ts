/* eslint-disable @typescript-eslint/no-explicit-any */
import { ROUTE } from "./constants";
import {
  ConnectInterfaceResponseMsg,
  MessageType,
  RejectSignatureMsg,
  RejectTxMsg,
  RevokeConnectionMsg,
  SubmitApprovedSignArbitraryMsg,
} from "./messages";

jest.mock("webextension-polyfill", () => ({}));

describe("approvals messages", () => {
  test("valid RejectTxMsg", () => {
    const msg = new RejectTxMsg("msgId");

    expect(msg.type()).toBe(MessageType.RejectTx);
    expect(msg.route()).toBe(ROUTE);
    expect(msg.validate()).toBeUndefined();
  });

  test("invalid RejectTxMsg", () => {
    const msg = new RejectTxMsg("msgId");
    (msg as any).msgId = undefined;

    expect(() => msg.validate()).toThrow();
  });

  test("valid RejectSignatureMsg", () => {
    const msg = new RejectSignatureMsg("msgId");

    expect(msg.type()).toBe(MessageType.RejectSignature);
    expect(msg.route()).toBe(ROUTE);
    expect(msg.validate()).toBeUndefined();
  });

  test("invalid RejectSignatureMsg", () => {
    const msg = new RejectSignatureMsg("msgId");
    (msg as any).msgId = undefined;

    expect(() => msg.validate()).toThrow();
  });

  test("valid SubmitApprovedSignatureMsg", () => {
    const msg = new SubmitApprovedSignArbitraryMsg("msgId", "signer");

    expect(msg.type()).toBe(MessageType.SubmitApprovedSignArbitrary);
    expect(msg.route()).toBe(ROUTE);
    expect(msg.validate()).toBeUndefined();
  });

  test("invalid SubmitApprovedSignatureMsg", () => {
    const msg = new SubmitApprovedSignArbitraryMsg("msgId", "signer");
    (msg as any).msgId = undefined;

    expect(() => msg.validate()).toThrow();

    const msg2 = new SubmitApprovedSignArbitraryMsg("msgId", "signer");
    (msg2 as any).signer = undefined;

    expect(() => msg2.validate()).toThrow();
  });

  test("valid ConnectInterfaceResponseMsg", () => {
    const msg = new ConnectInterfaceResponseMsg(0, "interface", true);

    expect(msg.type()).toBe(MessageType.ConnectInterfaceResponse);
    expect(msg.route()).toBe(ROUTE);
    expect(msg.validate()).toBeUndefined();
  });

  test("invalid ConnectInterfaceResponseMsg", () => {
    const msg = new ConnectInterfaceResponseMsg(0, "interface", true);

    (msg as any).interfaceTabId = undefined;

    expect(() => msg.validate()).toThrow();

    const msg2 = new ConnectInterfaceResponseMsg(0, "interface", true);
    (msg2 as any).interfaceOrigin = undefined;

    expect(() => msg2.validate()).toThrow();

    const msg3 = new ConnectInterfaceResponseMsg(0, "interface", true);
    (msg3 as any).allowConnection = undefined;

    expect(() => msg3.validate()).toThrow();
  });

  test("valid RevokeConnectionMsg", () => {
    const msg = new RevokeConnectionMsg("");

    expect(msg.type()).toBe(MessageType.RevokeConnection);
    expect(msg.route()).toBe(ROUTE);
    expect(msg.validate()).toBeUndefined();
  });

  test("invalid RevokeConnectionMsg", () => {
    const msg = new RevokeConnectionMsg("");

    (msg as any).originToRevoke = undefined;

    expect(() => msg.validate()).toThrow();
  });
});
