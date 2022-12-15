// this class contains functions that are being used for the code
// of creating MASP transfers
// these are being passed to Rust(WASM) and used as a callback
// this is supposed to be the smallest possible set where the
// implementation between the desktop CLI and the web client differ
// these callbacks (and this class) reflect the trait
// namada::ledger::masp::ShieldedUtils from
// https://github.com/anoma/namada repo
export class WebShieldedUtilsJsCallbacks {
  localTxProverCallback = (input: number): string => {
    const returnValue = `localTxProverCallback called with ${input}`;
    console.log(returnValue);
    return returnValue;
  };

  save = (input: number): string => {
    const returnValue = `save called with ${input}`;
    console.log(returnValue);
    return returnValue;
  };

  load = (input: number): string => {
    const returnValue = `load called with ${input}`;
    console.log(returnValue);
    return returnValue;
  };

  queryConversion = (input: number): string => {
    const returnValue = `queryConversion called with ${input}`;
    console.log(returnValue);
    return returnValue;
  };

  queryEpoch = (input: number): string => {
    const returnValue = `queryEpoch called with ${input}`;
    console.log(returnValue);
    return returnValue;
  };

  queryStorageValue = (input: number): string => {
    const returnValue = `queryStorageValue called with ${input}`;
    console.log(returnValue);
    return returnValue;
  };
}
