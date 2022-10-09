use crate::types::tx::Tx;
use namada::{proto, types::{key, transaction, token, storage, address}};
use namada::types::key::common::SecretKey;
use borsh::BorshSerialize;
use std::str::FromStr;

pub struct WrapperTx(pub(crate) transaction::WrapperTx);

impl WrapperTx {
    pub fn new(wrapper_tx: transaction::WrapperTx) -> Self {
        Self(wrapper_tx)
    }

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
