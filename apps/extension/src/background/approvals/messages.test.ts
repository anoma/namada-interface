/* eslint-disable @typescript-eslint/no-explicit-any */
import { TxType } from "@namada/sdk/web";
import { ROUTE } from "./constants";
import {
  ConnectInterfaceResponseMsg,
  MessageType,
  RejectSignatureMsg,
  RejectTxMsg,
  RevokeConnectionMsg,
  SubmitApprovedSignatureMsg,
  SubmitApprovedTxMsg,
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

  test("valid SubmitApprovedTxMsg", () => {
    const msg = new SubmitApprovedTxMsg(TxType.Bond, "msgId");

    expect(msg.type()).toBe(MessageType.SubmitApprovedTx);
    expect(msg.route()).toBe(ROUTE);
    expect(msg.validate()).toBeUndefined();
  });

  test("invalid SubmitApprovedTxMsg", () => {
    const msg = new SubmitApprovedTxMsg(TxType.Bond, "msgId");
    (msg as any).msgId = undefined;

    expect(() => msg.validate()).toThrow();

    const msg2 = new SubmitApprovedTxMsg(TxType.Bond, "msgId");
    (msg2 as any).txType = undefined;

    expect(() => msg2.validate()).toThrow();
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
    const msg = new SubmitApprovedSignatureMsg("msgId", "signer");

    expect(msg.type()).toBe(MessageType.SubmitApprovedSignature);
    expect(msg.route()).toBe(ROUTE);
    expect(msg.validate()).toBeUndefined();
  });

  test("invalid SubmitApprovedSignatureMsg", () => {
    const msg = new SubmitApprovedSignatureMsg("msgId", "signer");
    (msg as any).msgId = undefined;

    expect(() => msg.validate()).toThrow();

    const msg2 = new SubmitApprovedSignatureMsg("msgId", "signer");
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
