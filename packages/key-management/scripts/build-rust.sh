# sudo chmod 755 './scripts/build-rust.sh'

# build the project
#  wasm-pack build --target nodejs
 wasm-pack build ./lib/anoma-key-management/ --target web

 # copy files to their consumers
 cp ./lib/anoma-key-management/pkg/anoma_wasm_bg.wasm ./src/lib/anoma_wasm_bg.wasm
 cp ./lib/anoma-key-management/pkg/anoma_wasm_bg.wasm ./src/lib/anoma_wasm_bg.wasm
 cp ./lib/anoma-key-management/pkg/anoma_wasm_bg.js ./src/lib/anoma_wasm_bg.js
 cp ./lib/anoma-key-management/pkg/anoma_wasm_bg.wasm.d.ts ./src/lib/anoma_wasm_bg.wasm.d.ts
 cp ./lib/anoma-key-management/pkg/anoma_wasm.d.ts ./src/lib/anoma_wasm.d.ts
 cp ./lib/anoma-key-management/pkg/anoma_wasm.js ./src/lib/anoma_wasm.js

 