## Packages in namada-interface

Both applications under `apps` (`extension` and `namada-interface`) make use of shared packages defined in `packages`. These are "public" packages
with shared functionality across these two apps.

### Overview

Contents of `packages/` (_This is a WIP_):

- `chains` - Configurations for all supported chains (Namada, Cosmos, Osmosis, Ethereum, etc.)
- `components` - Shared React components
- `crypto` (Rust) - Cryptography related functionality
- `integrations` - Integration support for Namada extension, Keplr, and Metamask
- `masp-web` - (Rust) MASP functionality
- `rpc` - RPC client and types (_NOTE_ This will be removed)
- `shared` (Rust) - Functionality and types pulled from `namada` (_NOTE_ this will be replaced by the SDK integration)
- `storage` - Types and functionality related to storage (`localStorage`, `indexedDB`, etc.)
- `types` - TypeScript types and constants shared between apps
- `utils` - Common helper utilities
