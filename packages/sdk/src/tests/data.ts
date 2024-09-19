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
    "znam1t5y7e7n6l9n3wfdq8j973lu9n8s086et6snmcmvu3lues59d5qlg085u25grflkr87ktwuhvd4y",
  spendingKey:
    "zsknam1qdjyja2zqqqqpqpxsekqx3tg8qz727cyqqhujj7c74xglmzk5lk0e2gej2s2e6c4vthhegtlxuulu4g4d3dqfc08fg0xunw4q22xdhac46t7empalaeq3czx7nfx456w7dqdm3tldwu83jjcc9dees3cefpkv23jnra5c3cwsy092ahrtpm7zv34sj8dy72zwpzwjja69pw6lacdd655j0zaxdjk6ej387njquecyqm2hzv3kps76wrv2y5xk634kkcc05tdrvwyhhq9p5gcy",
  viewingKey:
    "zvknam1qdjyja2zqqqqpqpxsekqx3tg8qz727cyqqhujj7c74xglmzk5lk0e2gej2s2e6c4vgxlamnryqz6ytms0wflzthg264m4qxucgsxf8en6unm9l33sc3qs9duecssuxah0hw267uu7nr9qym763v8qup2t3upxungmc0cqggvsy092ahrtpm7zv34sj8dy72zwpzwjja69pw6lacdd655j0zaxdjk6ej387njquecyqm2hzv3kps76wrv2y5xk634kkcc05tdrvwyhhqukwe9z",
};

export const SHIELDED_ACCOUNT_2 = {
  paymentAddress:
    "znam1u5nehkhgys5hdxzx6un9j2lfyx2e9fpzluaq7pedhkzxn9dm2wtfs8kywh45wc96yh63grkpw54",
  spendingKey:
    "zsknam1q0yp502jqqqqpqpf0vcvm20gadwfl2xt4gaqc5nwrdvl2ky3upvwja6uryucvmw5r7jxu2tuujuapqa5ud9cvuh9x4lkgy7sn7xlzm2kapqjl6y8zq4qwkl3vaye5z5gwe4yrmy5nh0a5zrlj8we947n2c4kmqm0t47gldgz8r58w2kwuee0edafdqmvvgtalpqyvanhzcvmglcufmu6g3jhr3kjayfhdfjefnsr8yhd3ah6xwpslgzy5s3xnhehzrsr2lqq0wfzacgrptw09",
  viewingKey:
    "zvknam1q0yp502jqqqqpqpf0vcvm20gadwfl2xt4gaqc5nwrdvl2ky3upvwja6uryucvmw5r7p9ddjvw86ma4qy57vzcqqqwa5efmvj2cnhgqgnktuffgz7zscd3fx776pul3f4df5ve3tef0htzwm7wv702t432m6fv9q2kepazvf78r58w2kwuee0edafdqmvvgtalpqyvanhzcvmglcufmu6g3jhr3kjayfhdfjefnsr8yhd3ah6xwpslgzy5s3xnhehzrsr2lqq0wfzacgx2s96s",
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
