import { CryptoRecord, KdfType } from "../crypto";

export const RPC_URL = "http://localhost:27657";
export const NATIVE_TOKEN = "tnam1qxvg64psvhwumv3mwrrjfcz0h3t3274hwggyzcee";
export const CHAIN_ID = "localnet.a905b497170d585eb67fd";

export const MNEMONIC_1 =
  "liar bird install win wool venue observe maid flock clap bullet myth illness trip bread fresh polar smart use lunar tired embody come deer";

export const MNEMONIC_2 =
  "resist mystery settle ask saddle great kite tragic leaf improve ticket admit analyst tomorrow tobacco aim desk melt wheel despair patch ketchup calm winner";

export const ACCOUNT_1 = {
  address: "tnam1qz4sdx5jlh909j44uz46pf29ty0ztftfzc98s8dx",
  publicKey:
    "tpknam1qptrn64myunqr4847yq4cn0uwek5ecwc7eeexjfc5npmd5kmg6ex563n5as",
  privateKey:
    "59f0d21f1c7375697275d8fe6ef58b06505f5a073aeca5c5b05e0dda24bd6324",
};

export const ACCOUNT_2 = {
  address: "tnam1qry3lnk03j965y92np6e25jvadk3kw9u7cvwjclp",
  publicKey:
    "tpknam1qrxzmeyka3v43jnrhep9stnj3jhtgzq96ku3u6lk8hy8xqmjqgjtw8qu274",
};

export const SHIELDED_ACCOUNT_1 = {
  paymentAddress:
    "znam1wzrkk8tcz8zxxv0j3ssckjnantguzj2gnzypvvmg0xwy6k45w4glvv2s9yhl8magw8dx7kz0u4h",
  spendingKey:
    "zsknam1qwhq8dchqqqqpq9kgajamqucsjt0gy8h9hdel8ga3ugynqs8lewj4ayqdnlk2reuf50h324g5rky8kqmy9u8v3306q03fa2ad32hdq8uacwrtzmn67gsz22vfw06r86vxyr9kk8ajr2n3ds5hsx0ks8fuuespr9y2v4ah9grz7snc33jhqgscvn7vwzpxplq5jwsmw5v6sew55er3y0s2mjw7q388w9xg8hdjfkd0n0hqdm32dl9mjvxkes5djmvq60u3dgka4jsyfgpxafgg",
  viewingKey:
    "zvknam1qwhq8dchqqqqpq9kgajamqucsjt0gy8h9hdel8ga3ugynqs8lewj4ayqdnlk2reufkyrsyfej5ez98ejnhuefnq6udfjadlvhwkqhkq0w447j088hkqqd6mg6k7wt363yslyqdx6cd6c8zavf4mwmwa6gn4wj0483dh6kzsaz7snc33jhqgscvn7vwzpxplq5jwsmw5v6sew55er3y0s2mjw7q388w9xg8hdjfkd0n0hqdm32dl9mjvxkes5djmvq60u3dgka4jsyfgeprxuv",
};

export const SHIELDED_ACCOUNT_2 = {
  paymentAddress:
    "znam1rhgw9dmx2tm2dht8yaskftf90rgmz9vutadmvk2hsqsgg3uyze956qgjwl2rltvjrf9uwhp8ad6",
  spendingKey:
    "zsknam1q0xzadt6qqqqpqr4h7htj8zwx52puekwckglcqf86yc0klku6vmntvjfqa7tnh5rsx3ntacx3mftkg5qc9fj3vjzj5v22y9k94hypuefy96qc798w9psn9a5jg00ljqv7udxj2u08yphnndr8y2fujrdagef7kfhgunv9zs803mlmuwuzdt4mygldzjxkkqqnj0al8x75093gxmynhy7egap5mxxttn3z3x05zt3qngd3sajmhaawn2qzwfjwtxa8hrnzw0mnnplf8cehs9kz",
  viewingKey:
    "zvknam1q0xzadt6qqqqpqr4h7htj8zwx52puekwckglcqf86yc0klku6vmntvjfqa7tnh5rs9n3zp7f8dc7zutxdat068sd0m8qgs0fpm0dq4sjcr839p87d72mxwamvk4ev7tcdnq0xjzhw3hhes5vayem8ayuvvmr0y60llc59kqr03mlmuwuzdt4mygldzjxkkqqnj0al8x75093gxmynhy7egap5mxxttn3z3x05zt3qngd3sajmhaawn2qzwfjwtxa8hrnzw0mnnplf8ctxj0vu",
};

export const SIG_VALID = {
  publicKey:
    "tpknam1qptrn64myunqr4847yq4cn0uwek5ecwc7eeexjfc5npmd5kmg6ex563n5as",
  hash: "3e80b3778b3b03766e7be993131c0af2ad05630c5d96fb7fa132d05b77336e04",
  signature:
    "0042da84d595df74f83e55e8688055055bed0ec9bd6aee0d27f8464a12d598453bf65f980af1cbf444c81374ec903eef05ee43b5f7f69aea698c7d19d7929e8108",
};

export const SIG_INVALID = {
  publicKey:
    "tpknam1qptrn64myunqr4847yq4cn0uwek5ecwc7eeexjfc5npmd5kmg6ex563n5as",
  hash: "3e80b3778b3b03766e7be993131c0af2ad05630c5d96fb7fa132d05b77331234",
  signature:
    "0042da84d595df74f83e55e8688055055bed0ec9bd6aee0d27f8464a12d598453bf65f980af1cbf444c81374ec903eef05ee43b5f7f69aea698c7d19d7929e8108",
};

export const CRYPTO_RECORD: CryptoRecord = {
  cipher: {
    type: "aes-256-gcm",
    iv: new Uint8Array([
      212, 166, 231, 90, 131, 247, 196, 207, 66, 71, 201, 168,
    ]),
    text: new Uint8Array([
      213, 100, 25, 62, 43, 192, 91, 100, 221, 131, 57, 212, 134, 120, 145, 164,
      22, 83, 154, 4, 239, 216, 234, 151, 221, 18, 200, 109, 147, 239, 20, 42,
      129, 253, 82, 158, 151, 235,
    ]),
  },
  kdf: {
    type: KdfType.Argon2,
    params: {
      m_cost: 65536,
      t_cost: 3,
      p_cost: 1,
      salt: "xwPSE+/sF+hIR4nE+Zl7MQ",
    },
  },
};
