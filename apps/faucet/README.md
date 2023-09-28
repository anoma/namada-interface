# faucet

This is a front-end app to the [namada-faucet](https://github.com/heliaxdev/namada-faucet) server.

## Setup

To install dependencies, from the root `namada-interface` folder, run the following:

```bash
yarn
```

Then, look at the potential variables you may override in [.env.sample](./.env.sample) in `apps/faucet`. You can copy these variables into a `.env` file,
and they will be used when the application is built.

As an example, if all you want to override the the API url and faucet limit, you can enter the following in a `.env`:

```bash
# Faucet API Endpoint override
REACT_APP_FAUCET_API_URL=http://127.0.0.1:5000
REACT_APP_FAUCET_API_ENDPOINT=/api/v1/faucet

# Faucet limit, as defined in genesis toml
REACT_APP_FAUCET_LIMIT=1000
```

Each token address used in this form may be overridden via values specified in `.env` (see [.env.sample](./.env.sample)).

## Local development

In `apps/faucet`, you can run the following scripts to test locally:

```bash
yarn dev
```

The app will be accessible at `http://localhost:8081`.

### Note

If you are experiencing request failures due to CORS origin problems, you can launch the local CORS proxy via the following:

```bash
yarn dev:proxy
```

This will proxy the `REACT_APP_FAUCET_API_ENDPOINT` via a Node server, which should fix the issue.

## Build the project

To build the final, static HTML version of this app, simply run the following:

```bash
yarn build
```

This will output the project bundle in `apps/faucet/build`, which can be served on a web host.

## Notes

The logic for the API calls, as well as validating POW solutions can be found in [utils/index.ts](./src/utils/index.ts).

The UI for the form where these calls are invoked is located in [Faucet.tsx](./src/App/Faucet.tsx).

The default Token address definitions can be found in [tokens.ts](./src/config/tokens.ts).
