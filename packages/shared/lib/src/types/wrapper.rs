use crate::types::tx::Tx;
use namada::{proto, types::{key, transaction, token, storage, address}};
use namada::types::key::common::SecretKey;
use borsh::BorshSerialize;
use std::str::FromStr;

pub struct WrapperTx(pub(crate) transaction::WrapperTx);

impl WrapperTx {
    pub fn wrap(
        token: address::Address,
        fee_amount: u64,
        secret: &str,
        epoch: u64,
        gas_limit: u64,
        tx: proto::Tx,
    ) -> Result<transaction::WrapperTx, String> {
        let gas_limit = transaction::GasLimit::from(gas_limit);
        let amount = token::Amount::from(fee_amount);
        let signing_key = SecretKey::Ed25519(
            key::ed25519::SecretKey::from_str(secret)
                .map_err(|err| err.to_string())?
        );
        let encryption_key = transaction::EncryptionKey::default();

        Ok(transaction::WrapperTx::new(
            transaction::Fee {
                amount,
                token,
            },
            &signing_key,
            storage::Epoch(epoch),
            gas_limit,
            tx,
            encryption_key,
        ))
    }

    pub fn sign(
        wrapper_tx: transaction::WrapperTx,
        secret: String,
    ) -> Result<proto::Tx, String> {
        let keypair = SecretKey::Ed25519(
            key::ed25519::SecretKey::from_str(&secret)
                .map_err(|err| err.to_string())?
            );
        let wrapped_tx = transaction::TxType::Wrapper(wrapper_tx)
                .try_to_vec()
                .map_err(|err| err.to_string())?;

        Ok((Tx::to_proto(
            vec![],
            &wrapped_tx,
        )).sign(&keypair))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use namada::types::{address, key};
    use wasm_bindgen_test::*;

    #[wasm_bindgen_test]
    fn can_generate_a_wrapper_tx() {
        let secret = "1498b5467a63dffa2dc9d9e069caf075d16fc33fdd4c3b01bfadae6433767d93";
        let expected_fee_payer = "atest1d9khqw36x5cnvvjpgfzyxsjpgfqnqwf5xpq5zv34gvunswp4g3znww2yxqursdpnxdz5yw2ypna253";
        let token = address::Address::from_str("atest1v4ehgw36x3prswzxggunzv6pxqmnvdj9xvcyzvpsggeyvs3cg9qnywf589qnwvfsg5erg3fkl09rg5")
            .expect("Should create address from string slice");
        let epoch: u64 = 5;
        let fee_amount: u64 = 1000;
        let gas_limit: u64 = 1_000_000;
        let tx_code = vec![];
        let tx_data = vec![];
        let secret_key = SecretKey::Ed25519(
            key::ed25519::SecretKey::from_str(secret)
                .expect("Should encode ed25519 from secret")
        );

        let tx = Tx::to_proto(
            tx_code,
            &tx_data,
        ).sign(&secret_key);

        let wrapper_tx = WrapperTx::wrap(
            token,
            fee_amount,
            secret,
            epoch,
            gas_limit,
            tx,
        ).expect("Creating WrapperTx should not fail");

        // Verify that we can call methods native to namada::types::transaction::WrapperTx
        let bytes = wrapper_tx.try_to_vec().unwrap();
        assert_eq!(bytes.len(), 370);

        let is_valid_ciphertext = wrapper_tx.validate_ciphertext();
        assert!(is_valid_ciphertext);

        let fee_payer = wrapper_tx.fee_payer();
        assert_eq!(fee_payer.to_string(), expected_fee_payer);
    }
}
