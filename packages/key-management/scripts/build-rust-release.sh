# sudo chmod 755 './scripts/build-rust.sh'

# build the project
#  wasm-pack build --target nodejs
 wasm-pack build ./lib/anoma-key-management/ --target nodejs

 # copy files to their consumers
 cp ./lib/anoma-key-management/pkg/anoma_wasm_bg.wasm ./src/KeyManagement/lib/anoma_wasm_bg.wasm
 cp ./lib/anoma-key-management/pkg/anoma_wasm_bg.js ./src/KeyManagement/lib/anoma_wasm_bg.js
 cp ./lib/anoma-key-management/pkg/anoma_wasm_bg.wasm.d.ts ./src/KeyManagement/lib/anoma_wasm_bg.wasm.d.ts
 cp ./lib/anoma-key-management/pkg/anoma_wasm.d.ts ./src/KeyManagement/lib/anoma_wasm.d.ts
 cp ./lib/anoma-key-management/pkg/anoma_wasm.js ./src/KeyManagement/lib/anoma_wasm.js