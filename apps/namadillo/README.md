# Namadillo

This is the React app for `namadillo`, the web client which integrates with the Namada `extension`.

## Table of Contents

- [Introduction](#introduction)
- [How to Contribute](#how-to-contribute)
- [Usage](#usage)
- [Configuration](#configuration)
- [Hosting Namadillo](#hosting-namadillo)

### Introduction

Namadillo is a high-level user interface to interact with the Namada Blockchain. The current development aims to follow the phases defined in the [Namada roadmap](https://namada.net/mainnet-launch).

### How to Contribute

If you would like to contribute, please read [CONTRIBUTING.md](../../CONTRIBUTING.md) first.

### Usage

The following commands will help you set up and manage your development environment.

```bash
# Install dependencies
yarn

# Build wasm-dependencies (for using SDK Query)
yarn wasm:build

# Build wasm-dependencies with debugging enabled
yarn wasm:build:dev

# Start app in development mode
yarn dev

# If you are running chains locally, it is recommended that you instead proxy RPC requests:
yarn dev:proxy

# Build production release:
yarn build

# Run ESLint
yarn lint

# Run ESLint fix
yarn lint:fix

# Run tests
yarn test
```

### Configuration

By running Namadillo, the interface will prompt you to enter a valid indexer URL. After you provide it, the RPC URL will be fetched from the indexer.

**Note**: If the indexer provides an incorrect RPC URL, such as a local IP address or a URL accessible only via VPN, Namadillo might not work correctly. Therefore, when configuring Namadillo with a new indexer URL, please check the settings to ensure the provided RPC URL is valid.

Alternatively, you can configure the application by modifying the `config.toml` file located in the public folder. Use the [template provided](./public/config.toml) as a base, and specify the values you wish to override.

Example:

```toml
indexer_url = "http://localhost:5000"
rpc_url = "http://localhost:27657"
masp_indexer_url = "http://localhost:5001"
```

For more details on setting up your local environment for integration between the interface and the extension, see the [README.md](../../README.md) at the root of this repo.

### Hosting Namadillo

If you're interested in hosting Namadillo, a few options are available

#### Docker

In order to build the Docker image, you can run the following command in the **monorepo root**.
`docker build . -f docker/namadillo/Dockerfile -t namadillo`

**Note:** It might take some time to build all the necessary wasm files.

It's possible to run the Docker container using the following command:

`docker run -p 80:80 namadillo`

In order to change your `config.toml`, please copy the file `/docker/namadillo/.config.toml` to `/docker/namadillo/config.toml` and change the parameters accordingly, before building the image.

**Note:** If you are using an Arch-based Linux distribution, and encounter the following error:

```bash
the --chmod option requires BuildKit. Refer to https://docs.docker.com/go/buildkit/ to learn how to build images with BuildKit enabled
```

you can install it via:

```bash
sudo pacman -S docker-buildx
```

#### Self Hosting

If you already have a server set up, you can download a Namadillo version distribution from the [packages](https://github.com/orgs/anoma/packages?repo_name=namada-interface) section of this repository, and place its contents in the desired path in your server.

**Note**: Since Namadillo is a single-page application, it is important to redirect any paths to the `index.html` file. If you're using NGINX, you can refer to this [../../docker/namadillo-nginx.conf](example).

You can edit the `config.toml` file located in the root of the released package to change default RPC and Indexer URLs.
