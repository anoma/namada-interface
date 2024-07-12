FROM rust:1.79 as builder
WORKDIR /app
RUN apt update && apt install -y nodejs npm clang pkg-config libssl-dev protobuf-compiler curl
RUN npm install -g yarn
RUN rustup target add wasm32-unknown-unknown
RUN curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh -s -- -y
COPY .yarnrc.yml tsconfig.base.json package.json yarn.lock .
COPY ./.yarn ./.yarn
COPY ./packages ./packages
COPY ./scripts ./scripts
COPY ./apps/namadillo/package.json ./apps/namadillo/package.json
RUN yarn 
WORKDIR /app/apps/namadillo
COPY ./apps/namadillo/scripts ./scripts
RUN yarn wasm:build
COPY ./apps/namadillo .
RUN yarn 
RUN yarn build

FROM nginx:alpine
COPY --from=builder /app/apps/namadillo/dist /usr/share/nginx/html
COPY ./docker/namadillo.conf /etc/nginx/conf.d/default.conf
