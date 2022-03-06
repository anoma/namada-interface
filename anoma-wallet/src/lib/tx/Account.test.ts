import fetchMock, { enableFetchMocks } from "jest-fetch-mock";
enableFetchMocks();

import Account from "./Account";

const TOKEN =
  "atest1v4ehgw36xdzryve5gsc52veeg5cnsv2yx5eygvp38qcrvd29xy6rys6p8yc5xvp4xfpy2v694wgwcp";
const PRIVATE_KEY =
  "73BF20F71265056A1ACB3091272929C4FCBEF5DE60D1222428D6A99CEB4EBC21";
const PUBLIC_KEY =
  "A57281E1DD9FD39EC3E8A162A1643CA7C836C0F2DAE3BEF1412A3A61A2FDE1A7";

beforeEach(() => {
  fetchMock.resetMocks();
});

test("Account initialization should return a byte array and a hash", async () => {
  const client = await new Account().init();

  fetchMock.mockResponseOnce(() => {
    return Promise.resolve(
      JSON.stringify({
        arrayBuffer: Buffer.from(new Uint8Array([])),
      })
    );
  });

  const { hash, bytes } = await client.initialize({
    epoch: 1,
    privateKey: PRIVATE_KEY,
    publicKey: PUBLIC_KEY,
    token: TOKEN,
  });

  expect(hash.length).toBe(64);
  expect(bytes.length).toBe(501);
});
