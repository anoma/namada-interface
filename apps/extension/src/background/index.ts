import { init } from "@anoma/crypto";
import { ExtensionRouter } from "../extension";
import { ContentScriptEnv } from "../utils";
import { Ports } from "../router/types";
import { AddChainMsg } from "../router";

const initWasm = async () => {
  await init();
  console.info("wasm loaded");
};

initWasm();

const router = new ExtensionRouter(ContentScriptEnv.produceEnv);
router.registerMessage(AddChainMsg);
// TODO: This is just an example to test connectivity
router.addHandler("add-chain", (env, msg) =>
  console.log("add-chain", { env, msg })
);
router.listen(Ports.Background);
