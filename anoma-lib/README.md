# POC - WASM

This is the WASM component. This can be built manually as follows:

```bash
# From anoma-web/poc-2-transaction/
wasm-pack build src/wasm --out-dir ../anoma --out-name anomawasm --target web
```

Which should create the `anoma/anomawasm*` files required by `/src/utils/Anoma`.

More to come!
