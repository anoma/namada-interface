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
    "znam1umjfq8d8s5n3chelg8xgv6cf5kh53cjkgclzuhnnp9nl548gmpjaajyuywla88xlpn0cuvcs86f",
  spendingKey:
    "zsknam1qwwdw6q4qqqqpqy6qves7kzmv7lnul54ven0hw835smj5gu9zsac42gc7cagzlwauaf06exmuhw3dwxlfw5fdle3j6qdj9h5f5eu3r8nyr46jhsad5jqksresavcxffs5f7vhs8dflc70apu22kckyp24znapt2f0vpp4lgtfy98a35kd2rgydfrr25cuwf9xw9emfs6z3rvap87dprehwmwylz4glne2d3pqe8dds6h8ssczx8n6ps9zdeqe08fs3adm07uw5q83rqgtv7fq",
  viewingKey:
    "zvknam1qwwdw6q4qqqqpqy6qves7kzmv7lnul54ven0hw835smj5gu9zsac42gc7cagzlwau7x9csywszmdj4fxhadd5464cxqt3p5kzqerkl8s7g4y48s4xs3t7gett2e8g32k2enh587ne7mwzmvetjtukpd9mwh8wlfckw4t5qyzfy98a35kd2rgydfrr25cuwf9xw9emfs6z3rvap87dprehwmwylz4glne2d3pqe8dds6h8ssczx8n6ps9zdeqe08fs3adm07uw5q83rq23y79r",
  path: { account: 0 },
};

export const SHIELDED_ACCOUNT_2 = {
  paymentAddress:
    "znam1surgreuttyc0g3pjyh09hld5vfkmcxf5l6rfdhx4zl23sx9mg4p2venfdpevfj03yjyxzchyakk",
  spendingKey:
    "zsknam1qv4e0uyzqyqqpqyflphwkdus6je2er4vxdlmt4kd0eqt3afsp4r8ua7dc2c4gpau0x7km40uct3ve73a93mum75ldyvtq3g87ykh4rflpe0m8035qpzs9y996dmnc9t9x6a5mj0wl7xcdzfeczar3kttfhu9dl6m49gd7cgr9vka8cldpmkpvvlc4pvuzujg6r8q6nrzle2808mv0am6jg36lx9dat6z5pf7284dg7x8kgujuw5gvuaxfvj7q2h3eaj30rn3sek9trcssww6u",
  viewingKey:
    "zvknam1qv4e0uyzqyqqpqyflphwkdus6je2er4vxdlmt4kd0eqt3afsp4r8ua7dc2c4gpau0y9a8ac5cchspzm5w8cuepcxpdd0l0t5cttlx775tqlsh2ft9te60g4spv7fgzgrtk0kqtlk07vp3qj3qnvanu2jgeqyrgunc5y2uw2j9vka8cldpmkpvvlc4pvuzujg6r8q6nrzle2808mv0am6jg36lx9dat6z5pf7284dg7x8kgujuw5gvuaxfvj7q2h3eaj30rn3sek9trcuumrdf",
  path: { account: 1 },
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
