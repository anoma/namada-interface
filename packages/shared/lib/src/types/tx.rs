use crate::utils;
use namada::proto;

pub struct Tx(pub(crate) proto::Tx);

impl Tx {
    pub fn to_proto(tx_code: Vec<u8>, data: &Vec<u8>) -> proto::Tx {
        proto::Tx {
            code: tx_code,
            data: Some(data.to_owned()),
            timestamp: utils::get_timestamp(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use wasm_bindgen_test::*;

    #[wasm_bindgen_test]
    fn can_generate_a_proto_tx() {
        let tx_code = vec![];
        let tx_data = vec![];

        // Verify that we can call methods native to namada::proto::Tx
        let tx_proto = Tx::to_proto(tx_code, &tx_data);
        let bytes = tx_proto.to_bytes();
        let hash = tx_proto.hash();

        assert_eq!(bytes.len(), 10);
        assert_eq!(hash.len(), 32);
    }
}
