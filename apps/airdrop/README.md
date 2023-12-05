# Airdrop Website

## Table of Contents

- [Setup](#setup)
- [Local Development](#local-development)
- [Proxying Requests](#proxying-requests)
- [Building the Project](#building-the-project)
- [Notes](#notes)

## Setup

To install dependencies, from the root `namada-interface` folder, run the following:

```bash
yarn
```

Then, look at the potential variables you may override in [.env.sample](./.env.sample) in `apps/airdrop`. You can copy these variables into a `.env` file,
and they will be used when the application is built.

As an example, if all you want to override the API url and a GitHub app ID, you can override the following default values in a `.env`:

```bash
# Faucet API Endpoint override
NAMADA_INTERFACE_AIRDROP_BACKEND_SERVICE_URL=http://localhost:5000

# Github app ID override
NAMADA_INTERFACE_GITHUB_CLIENT_ID=Iv1.dbd15f7e1b50c0d7
```

Each token address used in this form may be overridden via values specified in `.env` (see [.env.sample](./.env.sample)).

[ [Table of Contents](#table-of-contents) ]

## Local Development

In `apps/airdrop`, you can run the following scripts to test locally:

```bash
yarn dev
```

The app will be accessible at `http://localhost:8081`.

[ [Table of Contents](#table-of-contents) ]

## Proxying Requests

If you are experiencing request failures due to CORS origin problems (e.g., if you are connecting to a remote server from a local dev instance),
you can launch the local CORS proxy via the following:

```bash
yarn dev:proxy
```

This will proxy the `NAMADA_INTERFACE_AIRDROP_BACKEND_SERVICE_URL` (or default URL if this is unspecified) via a Node server, which should resolve the issue.

[ [Table of Contents](#table-of-contents) ]

## Building the project

To build the final, static HTML version of this app, simply run the following:

```bash
yarn build
```

This will build the production version of the app, and the resulting bundle will be available in `apps/airdrop/build`. This contents of this folder can be served on a web host
as a static HTML website.

[ [Table of Contents](#table-of-contents) ]
