//! *Zcash circuits and proofs.*
//!
//! `zcash_proofs` contains the zk-SNARK circuits used by Zcash, and the APIs for creating
//! and verifying proofs.

#![cfg_attr(docsrs, feature(doc_cfg))]
// Catch documentation errors caused by code changes.
#![deny(broken_intra_doc_links)]
// Temporary until we have addressed all Result<T, ()> cases.
#![allow(clippy::result_unit_err)]

use bellman::groth16::{prepare_verifying_key, Parameters, PreparedVerifyingKey};
use bls12_381::Bls12;
use std::fs::File;
use std::io::{self, BufReader};
use std::path::Path;

#[cfg(feature = "directories")]
use directories::BaseDirs;
#[cfg(feature = "directories")]
use std::path::PathBuf;

pub mod circuit;
mod constants;
pub mod hashreader;
pub mod sapling;

#[cfg(any(feature = "local-prover", feature = "bundled-prover"))]
#[cfg_attr(
    docsrs,
    doc(cfg(any(feature = "local-prover", feature = "bundled-prover")))
)]
pub mod prover;

// Circuit names
#[cfg(feature = "local-prover")]
const MASP_SPEND_NAME: &str = "masp-spend.params";
#[cfg(feature = "local-prover")]
const MASP_OUTPUT_NAME: &str = "masp-output.params";

// Circuit hashes
const MASP_SPEND_HASH: &str = "5523057113d7daa078714f9859ea03da3c959f4fe3756a0ace4eb25f7cf41d1e21099dac768c2e0045400fee03c1f8bc14eeac2190c3f282e0092419d3b967e5";
const MASP_OUTPUT_HASH: &str = "89fe551ad6c0281aebb857eb203dbf35854979503d374c83b12512dcd737e12a255869a34e3ff0f6609b78accc81ea5f5e94202e124a590730494eeeee86e755";

#[cfg(feature = "download-params")]
const DOWNLOAD_URL: &str = "https://github.com/anoma/masp/blob/test_parameters";

/// Returns the default folder that the MASP proving parameters are located in.
#[cfg(feature = "directories")]
#[cfg_attr(docsrs, doc(cfg(feature = "directories")))]
pub fn default_params_folder() -> Option<PathBuf> {
    BaseDirs::new().map(|base_dirs| {
        if cfg!(any(windows, target_os = "macos")) {
            base_dirs.data_dir().join("MASPParams")
        } else {
            base_dirs.home_dir().join(".masp-params")
        }
    })
}

/// Download the MASP Sapling parameters, storing them in the default location.
///
/// This mirrors the behaviour of the `fetch-params.sh` script from `zcashd`.
#[cfg(feature = "download-params")]
#[cfg_attr(docsrs, doc(cfg(feature = "download-params")))]
pub fn download_parameters() -> Result<(), minreq::Error> {
    // Ensure that the default MASP parameters location exists.
    let params_dir = default_params_folder().ok_or_else(|| {
        io::Error::new(io::ErrorKind::Other, "Could not load default params folder")
    })?;
    std::fs::create_dir_all(&params_dir)?;

    let fetch_params = |name: &str, expected_hash: &str| -> Result<(), minreq::Error> {
        use std::io::Write;

        // Download the parts directly (Sapling parameters are small enough for this).
        let params = minreq::get(format!("{}/{}?raw=true", DOWNLOAD_URL, name)).send()?;

        // Verify parameter file hash.
        let hash = blake2b_simd::State::new()
            .update(params.as_bytes())
            .finalize()
            .to_hex();
        if &hash != expected_hash {
            return Err(io::Error::new(
                io::ErrorKind::InvalidData,
                format!(
                    "{} failed validation (expected: {}, actual: {}, fetched {} bytes)",
                    name,
                    expected_hash,
                    hash,
                    params.as_bytes().len()
                ),
            )
            .into());
        }

        // Write parameter file.
        let mut f = File::create(params_dir.join(name))?;
        f.write_all(params.as_bytes())?;
        Ok(())
    };

    fetch_params(MASP_SPEND_NAME, MASP_SPEND_HASH)?;
    fetch_params(MASP_OUTPUT_NAME, MASP_OUTPUT_HASH)?;

    Ok(())
}

#[allow(clippy::upper_case_acronyms)]
pub struct MASPParameters {
    pub spend_params: Parameters<Bls12>,
    pub spend_vk: PreparedVerifyingKey<Bls12>,
    pub output_params: Parameters<Bls12>,
    pub output_vk: PreparedVerifyingKey<Bls12>,
}
pub fn load_parameters(spend_path: &Path, output_path: &Path) -> MASPParameters {
    // Load from each of the paths
    let spend_fs = File::open(spend_path).expect("couldn't load Sapling spend parameters file");
    let output_fs = File::open(output_path).expect("couldn't load Sapling output parameters file");

    parse_parameters(
        BufReader::with_capacity(1024 * 1024, spend_fs),
        BufReader::with_capacity(1024 * 1024, output_fs),
    )
}

/// Parse Bls12 keys from bytes as serialized by [`Parameters::write`].
///
/// This function will panic if it encounters unparseable data.
pub fn parse_parameters<R: io::Read>(spend_fs: R, output_fs: R) -> MASPParameters {
    let mut spend_fs = hashreader::HashReader::new(spend_fs);
    let mut output_fs = hashreader::HashReader::new(output_fs);

    // Deserialize params
    let spend_params = Parameters::<Bls12>::read(&mut spend_fs, false)
        .expect("couldn't deserialize Sapling spend parameters file");
    let output_params = Parameters::<Bls12>::read(&mut output_fs, false)
        .expect("couldn't deserialize Sapling spend parameters file");

    // There is extra stuff (the transcript) at the end of the parameter file which is
    // used to verify the parameter validity, but we're not interested in that. We do
    // want to read it, though, so that the BLAKE2b computed afterward is consistent
    // with `b2sum` on the files.
    let mut sink = io::sink();
    io::copy(&mut spend_fs, &mut sink)
        .expect("couldn't finish reading Sapling spend parameter file");
    io::copy(&mut output_fs, &mut sink)
        .expect("couldn't finish reading Sapling output parameter file");

    if spend_fs.into_hash() != MASP_SPEND_HASH {
        panic!("MASP spend parameter file is not correct, please clean your `~/.masp-params/` and re-run `fetch-params`.");
    }

    if output_fs.into_hash() != MASP_OUTPUT_HASH {
        panic!("MASP output parameter file is not correct, please clean your `~/.masp-params/` and re-run `fetch-params`.");
    }

    // Prepare verifying keys
    let spend_vk = prepare_verifying_key(&spend_params.vk);
    let output_vk = prepare_verifying_key(&output_params.vk);

    MASPParameters {
        spend_params,
        spend_vk,
        output_params,
        output_vk,
    }
}
