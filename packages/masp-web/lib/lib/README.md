![MASP Logo](https://github.com/anoma/masp/blob/main/docs/logo.png)

# MASP Rust crates

This repository contains a (work-in-progress) set of Rust crates for
working with the Multi Asset Shielded Pool extensions of the Sapling circuits from Zcash.

## MASP Description

Using the original Sapling circuits for user defined assets, each asset or token type must have a separate shielded pool and asset type is transparent for all transactions. 

Using the MASP circuits, MASP notes can have shielded type, multiple assets can share the same shielded pool, and the asset types in a transaction can be shielded (except where there is transparent balance change)

The MASP is based on proposed multi-asset extensions to the Zcash protocol:

* https://github.com/zcash/zips/pull/269
* https://github.com/zcash/zcash/issues/830
* https://github.com/zcash/zcash/issues/2277#issuecomment-321106819 
* https://github.com/str4d/librustzcash/tree/funweek-uda-demo

The MASP attempts to keep most of the security, feature, and performance properties of the original Sapling circuits.

## Additional Components

This Rust repository, by itself, is not a complete implementation of the MASP, as it only includes circuits and some other functionality (transaction balancing, etc) while other functionality (notes, etc) is implemented elsewhere.

## Repository Structure

The `masp_proofs` crate contains the modified Spend and Output circuits to support multiple assets.

Much of the code that supports the original Sapling circuits can be shared and reused with the MASP circuits. Therefore, the Zcash code is reused in two ways:

1. Some code can be reused unmodified from `zcash_primitives` and `zcash_proofs` crates  from`librustzcash`, but Rust import visibility rules don't allow direct import of some private functions. Therefore the crates are copied here and some private fields have been changed to public. 
2. Code from `zcash_primitives` and `zcash_proofs` that cannot be reused without modifications is placed in `masp_primitives` and `masp_proofs`. 

New code related to asset types is included in `masp_primitives`. 

Zcash code that is not relevant to the circuits (e.g. protocol, transaction, consensus, blockchain code) has been removed.

The `masp` crate contains the C language bindings for accessing the circuits.

The `docs` folder includes technical documentation about the circuit changes.

## Asset Identifiers

The major difference between MASP and original Sapling is the use of asset identifiers to identify distinct asset types. An asset identifier is an internal 32 byte string that uniquely identifies each asset in the circuits. 

The asset identifier is independent of a specific token standard. 

There are certain requirements for deriving asset identifiers. The `AssetType` struct in `masp_primitives` (also via the C bindings) gives functions to derive asset identifiers.

## Trusted Setup

The Zcash Sapling trusted setup parameters cannot be completely reused for the MASP. Parameter location and hashes must be added to `masp_proofs` following a suitable MPC ceremony. 
## Security Warnings

These libraries are currently under development and have not been fully-reviewed.

## License

All code in this workspace is licensed under either of

 * Apache License, Version 2.0, ([LICENSE-APACHE](LICENSE-APACHE) or http://www.apache.org/licenses/LICENSE-2.0)
 * MIT license ([LICENSE-MIT](LICENSE-MIT) or http://opensource.org/licenses/MIT)

at your option.

### Contribution

Unless you explicitly state otherwise, any contribution intentionally
submitted for inclusion in the work by you, as defined in the Apache-2.0
license, shall be dual licensed as above, without any additional terms or
conditions.
