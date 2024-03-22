import { Keys } from "keys";
import { Masp } from "masp";
import { Mnemonic } from "mnemonic";
import { Rpc } from "rpc";
import { Signing } from "signing";
import { Tx } from "tx";
import { initSdk } from "./initSdk";

describe("Sdk", () => {
  it("should initialize Sdk with all sub-components", () => {
    const { tx, keys, mnemonic, rpc, masp, signing } = initSdk();
    expect(tx).toBeInstanceOf(Tx);
    expect(keys).toBeInstanceOf(Keys);
    expect(mnemonic).toBeInstanceOf(Mnemonic);
    expect(rpc).toBeInstanceOf(Rpc);
    expect(masp).toBeInstanceOf(Masp);
    expect(signing).toBeInstanceOf(Signing);
  });
});
