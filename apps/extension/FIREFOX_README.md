# NOTICE FOR FIREFOX ADD-ON REVIEWERS

This is the monorepo which contains the source code for Namada Extension. Please follow the instructions
exactly as they are described below.

## Table of Contents

- [Build Instructions](#build-instructions)
- [Notes](#notes)
  - [Environment](#environment)
  - [Setting up Node & NPM](#setting-up-node-and-npm)
  - [Source Code](#source-code)

## Build instructions

1. Certify that Docker 27+ is installed in your system before proceeding with the build:

```bash
docker --version
```

2. From the **repository root**, build the Docker image:

```bash
docker build . -t namada-keychain -f docker/extension/Dockerfile
```

3. Wait for the build to complete, and then copy the files from the container by executing the following command in the **repository root**:

```bash
docker run --rm -v ./apps/extension/build:/shared namada-keychain cp -r /app/apps/extension/build/. /shared/
```

4. The resulting extension is the ZIP file in `apps/extension/build/firefox`.

[ [Table of Contents](#table-of-contents) ]

## Notes

### Environment

This build was produced using the following environment:

- Ubuntu 24.04 LTS (Desktop edition)
- 10GB of system memory (RAM)
- 6 cores of vCPU
- 35GB of storage
- Docker version 27+ installed and running

Please ensure that this matches your environment!

[ [Table of Contents](#table-of-contents) ]

### Installing Docker

If Docker is not currently installed in your environment, please refer to the [instructions of the official Docker documentation](https://docs.docker.com/engine/install/ubuntu/).

[ [Table of Contents](#table-of-contents) ]

### Source code

The main extension source code is located in `apps/extension/src`. We also use
several local packages; their sources are in:

- `packages/chains/src`
- `packages/components/src`
- `packages/hooks/src`
- `packages/sdk/src`
- `packages/storage/src`
- `packages/types/src`
- `packages/utils/src`
- `packages/shared/lib` (shared package Rust code compiled to WebAssembly)
- `packages/shared/src` (shared package TypeScript glue code)
- `packages/crypto/lib` (crypto package Rust code compiled to WebAssembly)
- `packages/crypto/src` (crypto package TypeScript glue code)

[ [Table of Contents](#table-of-contents) ]
