# NOTICE FOR FIREFOX ADD-ON REVIEWERS

This is the monorepo which contains the source code for Namada Extension. Please follow the instructions
exactly as they are described below.

## Table of Contents

- [Build Instructions](#build-instructions)
- [Notes](#notes)
  - [Installing Docker](#installing-docker)
  - [Source Code](#source-code)

## Build instructions

**NOTE** The add-on submission was built in the following environment:

- Ubuntu Desktop 24.04 LTS **ARM64** - Please ensure your environment matches this to produce an identical build!
- Docker version 27.x

Follow these instructions to build with Docker:

1. Verify that Docker 27+ is installed in your system before proceeding with the build:

```bash
docker --version
```

2. From the **source code root**, build the Docker image:

```bash
docker build . --target firefox -t namada-keychain-firefox -f docker/extension/Dockerfile
```

3. Wait for the build to complete, and then copy the files from the container by executing the following command in the **source code root**:

```bash
docker run --rm -v ./apps/extension/build:/shared namada-keychain-firefox cp -r /app/apps/extension/build/. /shared/
```

4. The resulting extension is the ZIP file in `apps/extension/build/firefox`.

[ [Table of Contents](#table-of-contents) ]

## Notes

### Installing Docker

If Docker is not currently installed in your environment, please refer to the [instructions of the official Docker documentation](https://docs.docker.com/engine/install/ubuntu/).

The steps we took to install Docker on Ubuntu Desktop 24.04 ARM64 are as follows:

1. Remove any pre-existing Docker-related packages:

```bash
for pkg in docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc; do sudo apt-get remove $pkg; done
```

2. Setup Docker repository and install keyring

```bash
# Add Docker's official GPG key:
sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
```

3. Install Docker packages:

```bash
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

4. Post-install - Add `docker` group to user:

```bash
# If docker group doesn't currently exist:
sudo groupadd docker

# Add current user to docker group:
sudo usermod -aG docker $USER
```

5. Log out, then log back in for group to take effect! This is to ensure that you don't need to run our Docker commands as root via `sudo`.

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
