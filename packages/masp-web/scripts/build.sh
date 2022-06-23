# chmod +x ./scripts/build.sh

# if the user is on mac this is needed
if [[ "$OSTYPE" == "darwin"* ]]; then
# might have to install clang
CC=/opt/homebrew/opt/llvm/bin/clang AR=/opt/homebrew/opt/llvm/bin/llvm-ar wasm-pack build --target web ./lib
else
wasm-pack build --target web ./lib
fi
# ls -l ./lib/pkg

# these are needed on the first run
# mkdir ./src/utils/masp-web
touch ./src/utils/masp-web/masp_web_bg.wasm
# touch ./src/utils/masp-web/masp_web_bg.js
touch ./src/utils/masp-web/masp_web_bg.wasm.d.ts
touch ./src/utils/masp-web/masp_web.d.ts
touch ./src/utils/masp-web/masp_web.js

# copy
cp ./lib/pkg/masp_web_bg.wasm ./src/utils/masp-web/masp_web_bg.wasm
# cp ./lib/pkg/masp_web_bg.js ./src/utils/masp-web/masp_web_bg.js
cp ./lib/pkg/masp_web_bg.wasm.d.ts ./src/utils/masp-web/masp_web_bg.wasm.d.ts
cp ./lib/pkg/masp_web.d.ts ./src/utils/masp-web/masp_web.d.ts
cp ./lib/pkg/masp_web.js ./src/utils/masp-web/masp_web.js
