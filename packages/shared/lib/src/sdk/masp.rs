use borsh::{BorshDeserialize, BorshSerialize};
use masp_proofs::prover::LocalTxProver;
use namada::ledger::masp::{ShieldedContext, ShieldedUtils};

use crate::rpc_client::HttpClient;

#[derive(Default, Debug, BorshSerialize, BorshDeserialize, Clone)]
pub struct WebShieldedUtils {}

impl ShieldedUtils for WebShieldedUtils {
    type C = HttpClient;

    fn local_tx_prover(&self) -> LocalTxProver {
        todo!()
    }

    fn load(self) -> std::io::Result<ShieldedContext<Self>> {
        todo!()
    }

    fn save(&self, _ctx: &ShieldedContext<Self>) -> std::io::Result<()> {
        todo!()
    }
}
