# Client Application

## React Web Application - Technical details

- Built with TypeScript
- State-management with Redux Toolkit (`@reduxjs/toolkit`)
- Styled-Componenents for all application/component styling
- `webpack` build with `webpack-dev-server`

## Overview

The purpose of Namada Interface is to provide the front-end web application to Namada, integration with the `browser-extension` for key-management and SDK integration, and to support IBC and Ethereum Bridge transactions.
The interface will not only integrate with our browser extension, but will also support both Keplr and Metamask integration for loading accounts from those wallets, signing with those accounts, and submitting inter-blockchain
transfers from the Cosmos-ecosystem and Ethereum into Namada.

For more information, see the following specs:

- [IBC](./ibc.md)
- [RPC](./rpc.md)
- [Shielded Transfers](./shielded-transfers.md)
- [Transparent Transfers](./transparent-transactions.md)
- [Extension Integration API](../browser-extension/integration.md)
