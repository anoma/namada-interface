/* eslint-disable @typescript-eslint/no-explicit-any */
import { ROUTE } from "./constants";
import {
  ConnectInterfaceResponseMsg,
  MessageType,
  RejectSignArbitraryMsg,
  RejectSignTxMsg,
  RevokeConnectionMsg,
  SubmitApprovedSignArbitraryMsg,
} from "./messages";

jest.mock("webextension-polyfill", () => ({}));

describe("approvals messages", () => {
  test("valid RejectSignTxMsg", () => {
    const msg = new RejectSignTxMsg("msgId");

    expect(msg.type()).toBe(MessageType.RejectSignTx);
    expect(msg.route()).toBe(ROUTE);
    expect(msg.validate()).toBeUndefined();
  });

  test("invalid RejectSignTxMsg", () => {
    const msg = new RejectSignTxMsg("msgId");
    (msg as any).msgId = undefined;

    expect(() => msg.validate()).toThrow();
  });

  test("valid RejectSignArbitraryMsg", () => {
    const msg = new RejectSignArbitraryMsg("msgId");

    expect(msg.type()).toBe(MessageType.RejectSignArbitrary);
    expect(msg.route()).toBe(ROUTE);
    expect(msg.validate()).toBeUndefined();
  });

  test("invalid RejectSignArbitraryMsg", () => {
    const msg = new RejectSignArbitraryMsg("msgId");
    (msg as any).msgId = undefined;

    expect(() => msg.validate()).toThrow();
  });

  test("valid SubmitApprovedSignatureMsg", () => {
    const msg = new SubmitApprovedSignArbitraryMsg("msgId", "signer");

    expect(msg.type()).toBe(MessageType.SubmitApprovedSignArbitrary);
    expect(msg.route()).toBe(ROUTE);
    expect(msg.validate()).toBeUndefined();
  });

  test("invalid SubmitApprovedSignArbitraryMsg", () => {
    const msg = new SubmitApprovedSignArbitraryMsg("msgId", "signer");
    (msg as any).msgId = undefined;

    expect(() => msg.validate()).toThrow();

    const msg2 = new SubmitApprovedSignArbitraryMsg("msgId", "signer");
    (msg2 as any).signer = undefined;

    expect(() => msg2.validate()).toThrow();
  });

  test("valid ConnectInterfaceResponseMsg", () => {
    const msg = new ConnectInterfaceResponseMsg("interface", "chainId", true);

    expect(msg.type()).toBe(MessageType.ConnectInterfaceResponse);
    expect(msg.route()).toBe(ROUTE);
    expect(msg.validate()).toBeUndefined();
  });

  test("invalid ConnectInterfaceResponseMsg", () => {
    const msg = new ConnectInterfaceResponseMsg("interface", "chainId", true);
    (msg as any).interfaceOrigin = undefined;

    expect(() => msg.validate()).toThrow();

    const msg2 = new ConnectInterfaceResponseMsg("interface", "chainId", true);
    (msg2 as any).allowConnection = undefined;

    expect(() => msg2.validate()).toThrow();
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
