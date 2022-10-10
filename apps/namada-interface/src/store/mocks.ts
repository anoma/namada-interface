import { RootState } from "./store";
import { TransferType } from "slices/transfers";

export const mockAppState: RootState = {
  accounts: {
    derived: {
      "anoma-masp-1.5.32ccad5356012a7": {
        "12RF8L": {
          id: "12RF8L",
          isInitial: true,
          chainId: "anoma-masp-1.5.32ccad5356012a7",
          alias: "Namada",
          tokenType: "NAM",
          address: "KwjdSzkCdzzsF983n8CgHnqcztVSQVLo3LJMUvkFzaAF3acar8e7",
          publicKey:
            "267ab5211a716883f630ac294cb30fd97fba9eb122b31b4bd3b72944931b307a",
          signingKey:
            "0f64215638e63f8f687b12ba11824763e700536b95ed7e58a3ec11598f1e9342",
          balance: 0,
          establishedAddress:
            "atest1v4ehgw36xqcyz3zrxsenzd3kxsunsvzzxymyywpkg4zrjv2pxepyyd3cgse5gwzxgsm5x3zrkf2pwp",
          isInitializing: false,
        },
      },
      "anoma-test.1e670ba91369ec891fc": {
        "39UL18": {
          id: "39UL18",
          isInitial: true,
          chainId: "anoma-test.1e670ba91369ec891fc",
          alias: "Namada",
          tokenType: "NAM",
          address: "L3iUoUYZ8NN3dBBAQeJbtJem4FoAznRvGvNLEuGGcKFMRnr4FbKj",
          publicKey:
            "6138f3a79b14854a2c69c64c8029d6eed1460bbfe4995f26185fa538740cb3dc",
          signingKey:
            "c1d30a9b550581cf14a4db3db9d7abeeebcb06d81737ef19b772f082d5b96c02",
        },
      },
      "anoma-test.89060614ce340f4baae": {
        "2MLGVA": {
          id: "2MLGVA",
          isInitial: true,
          chainId: "anoma-test.89060614ce340f4baae",
          alias: "Namada",
          tokenType: "NAM",
          address: "L1qDtV8TRwYLSHdMDW518hgRw9nWnRjFTenkcBYNJruyYoLjaj8F",
          publicKey:
            "17f47ab28c162729425dd01baebccadeb536c81ccd2c145a046239a9588eeef5",
          signingKey:
            "899e4dc8dac72c65dd3c61678b013ddd9a93f6f9f8626bce3c6f3ffc267f322e",
        },
      },
    },
    shieldedAccounts: {
      "anoma-test.89060614ce340f4baae": {
        "30e4d7e8-ba39-459e-86cd-305249ddc169": {
          chainId: "anoma-test.89060614ce340f4baae",
          shieldedKeysAndPaymentAddress: {
            viewingKey:
              "xfvktest1qqqqqqqqqqqqqqzs4yx750l0n9sw7c9vsyl3ftrmhxgyxpz4l6v4jafvwlhkrj5y0x6fvvsp2krqkgpec7m9ayf9464ns69lwtfh8ukd0lqqtruwrjnsq24takm2jx9d4r6af3lc03e8y3vle23wepsfjxq85z903s2j0dx8wznwxjstqqc2pan27ggkhw86rg5ehug4s564m6hk6y0j7y3psq6y30zvlsr48nd239epjzq6czn39hst03awp3ppfgl440waautac8chmge4a",
            spendingKey:
              "xsktest1qqqqqqqqqqqqqqzs4yx750l0n9sw7c9vsyl3ftrmhxgyxpz4l6v4jafvwlhkrj5y09fxdrasqyk6q8w7r9mt340m3mjqtuveutg6kmfcgh7u72yyneksusxkzm58p484x0mufldsukq7l7kaj0lej2cnaqylpkn8eukecls9wznwxjstqqc2pan27ggkhw86rg5ehug4s564m6hk6y0j7y3psq6y30zvlsr48nd239epjzq6czn39hst03awp3ppfgl440waautac8ck65jc0",
            paymentAddress:
              "patest1merkqqffspqakum38hz2z9ghhmv4fhpunn0pt9vpwwpdcyqr7adq9xjjcfw84wuldy7sjqyh03u",
          },
          isShielded: true,
          alias: "Namada",
          balance: 0,
          address: "this_should_be_the_current_masp_address",
          tokenType: "NAM",
          signingKey: "signingKey",
          publicKey: "publicKey",
          id: "30e4d7e8-ba39-459e-86cd-305249ddc169",
        },
      },
      "anoma-masp-1.5.32ccad5356012a7": {
        "11ce9d8b-414a-43dc-a6c5-dc0d2a0ef42b": {
          chainId: "anoma-masp-1.5.32ccad5356012a7",
          shieldedKeysAndPaymentAddress: {
            viewingKey:
              "xfvktest1qqqqqqqqqqqqqqqjknf8hm5ckx50eqzdmupgesqa7laf7e73nwcyez5yxsqlpgpdl34ucymtftg7v8ae57s4szzta9wpj83vyf6mjjehm8nvvvuchf0acxj8luey9ufd9zwccta0fvhw7e6595htc3w06yanae9t7dqj0npmrzkgfq95rtu3ekfpxc3vfnfwzfxgtqffyhpzjxfqnsh2dnu5t65uhha7gljymdurrykja7yk2l4tq0lsnww8z60szzkea6heugsptac0zna9f",
            spendingKey:
              "xsktest1qqqqqqqqqqqqqqqjknf8hm5ckx50eqzdmupgesqa7laf7e73nwcyez5yxsqlpgpdljx3qxkg60j0cpmva987rpw6nf2pja8p9p9jjuk4wg58g8h9ca7snmr5nuxt7fj83mypk3wfjmjf320uvnk6jy8hv0ylf6lykh70q8sgrzkgfq95rtu3ekfpxc3vfnfwzfxgtqffyhpzjxfqnsh2dnu5t65uhha7gljymdurrykja7yk2l4tq0lsnww8z60szzkea6heugsptac9elefp",
            paymentAddress:
              "patest1cswh6hx6zkw6pyhrf53rxespamutnj0l428q5qevkq9h680s6qlr85tw6hpme0ttzqhhywaul3u",
          },
          isShielded: true,
          alias: "Namada",
          balance: 0,
          address: "this_should_be_the_current_masp_address",
          tokenType: "NAM",
          signingKey: "signingKey",
          publicKey: "publicKey",
          id: "11ce9d8b-414a-43dc-a6c5-dc0d2a0ef42b",
        },
      },
      "anoma-test.1e670ba91369ec891fc": {
        "81dc5a0f-1840-4f26-86fa-62b755eb6c4e": {
          chainId: "anoma-test.1e670ba91369ec891fc",
          shieldedKeysAndPaymentAddress: {
            viewingKey:
              "xfvktest1qqqqqqqqqqqqqqqvcs6945a2saw582e4fgddpu962ud89q9g6f9kyhn4mcn8z7cht4jx8zryykr59efqy0w2g0fnn7sh40dcqa76r9vs8ne6z2rk4tzhr8wwmdzue9us2sx3rqkvtj5u8wpaplttmjn89gjy56n98hcmaprqzznfzxylnk4j4mvahu3047u8k2jegwpmpx4khu30nrxdner5mztqjq2tx2pm2lclzewdwkhjyqqxznvfxgpr5zx0g9ph6a7jqhfjdysktf7e9",
            spendingKey:
              "xsktest1qqqqqqqqqqqqqqqvcs6945a2saw582e4fgddpu962ud89q9g6f9kyhn4mcn8z7chtkrlqwes36jgfpe6x0fk9x5xdul4s8k8030l24e9ujuvx0ngw2wqhkf7jg2xgzfdwkv3y2tgsv0642xwjkvclhsth7w6vwejpd5l2tcfzznfzxylnk4j4mvahu3047u8k2jegwpmpx4khu30nrxdner5mztqjq2tx2pm2lclzewdwkhjyqqxznvfxgpr5zx0g9ph6a7jqhfjdysagtpg6",
            paymentAddress:
              "patest1804lh5v73k0e75n0sdyu0799e8hrz3zpnlxdc5e6wfdkpk4t7525llvdf2gf9ul03h8sj85v79r",
          },
          isShielded: true,
          alias: "Namada",
          balance: 0,
          address: "this_should_be_the_current_masp_address",
          tokenType: "NAM",
          signingKey: "signingKey",
          publicKey: "publicKey",
          id: "81dc5a0f-1840-4f26-86fa-62b755eb6c4e",
        },
      },
    },
    isAddingAccountInReduxState: false,
  },
  balances: {
    "anoma-masp-1.5.32ccad5356012a7": {
      "12RF8L": {
        NAM: 1000,
        ATOM: 1000,
        ETH: 1000,
        DOT: 0,
        BTC: 1000,
      },
    },
  },
  transfers: {
    transactions: [
      {
        chainId: "anoma-masp-1.5.32ccad5356012a7",
        source:
          "atest1v4ehgw36gc6yxvpjxccyzvphxycrxw2xxsuyydesxgcnjs3cg9znwv3cxgmnj32yxy6rssf5tcqjm3",
        target:
          "atest1v4ehgw36xqcyz3zrxsenzd3kxsunsvzzxymyywpkg4zrjv2pxepyyd3cgse5gwzxgsm5x3zrkf2pwp",
        appliedHash:
          "C90CE1D0FBF4562A01207C9C126A401C64D9CC6D2203A8D219E6A9EF645F9F0E",
        tokenType: "NAM",
        amount: 1000,
        memo: "Initial funds",
        gas: 1.232945,
        height: 226619,
        timestamp: 1659444390179,
        type: TransferType.NonShielded,
      },
      {
        chainId: "anoma-masp-1.5.32ccad5356012a7",
        source:
          "atest1v4ehgw36gc6yxvpjxccyzvphxycrxw2xxsuyydesxgcnjs3cg9znwv3cxgmnj32yxy6rssf5tcqjm3",
        target:
          "atest1v4ehgw36xqcyz3zrxsenzd3kxsunsvzzxymyywpkg4zrjv2pxepyyd3cgse5gwzxgsm5x3zrkf2pwp",
        appliedHash:
          "C90CE1D0FBF4562A01207C9C126A401C64D9CC6D2203A8D219E6A9EF645F9F0E",
        tokenType: "ETH",
        amount: 1000,
        memo: "Initial funds",
        gas: 1.232945,
        height: 226619,
        timestamp: 1659444390683,
        type: TransferType.NonShielded,
      },
      {
        chainId: "anoma-masp-1.5.32ccad5356012a7",
        source:
          "atest1v4ehgw36gc6yxvpjxccyzvphxycrxw2xxsuyydesxgcnjs3cg9znwv3cxgmnj32yxy6rssf5tcqjm3",
        target:
          "atest1v4ehgw36xqcyz3zrxsenzd3kxsunsvzzxymyywpkg4zrjv2pxepyyd3cgse5gwzxgsm5x3zrkf2pwp",
        appliedHash:
          "C90CE1D0FBF4562A01207C9C126A401C64D9CC6D2203A8D219E6A9EF645F9F0E",
        tokenType: "ATOM",
        amount: 1000,
        memo: "Initial funds",
        gas: 1.232945,
        height: 226619,
        timestamp: 1659444390845,
        type: TransferType.NonShielded,
      },
      {
        chainId: "anoma-masp-1.5.32ccad5356012a7",
        source:
          "atest1v4ehgw36gc6yxvpjxccyzvphxycrxw2xxsuyydesxgcnjs3cg9znwv3cxgmnj32yxy6rssf5tcqjm3",
        target:
          "atest1v4ehgw36xqcyz3zrxsenzd3kxsunsvzzxymyywpkg4zrjv2pxepyyd3cgse5gwzxgsm5x3zrkf2pwp",
        appliedHash:
          "C90CE1D0FBF4562A01207C9C126A401C64D9CC6D2203A8D219E6A9EF645F9F0E",
        tokenType: "BTC",
        amount: 1000,
        memo: "Initial funds",
        gas: 1.232945,
        height: 226619,
        timestamp: 1659444391098,
        type: TransferType.NonShielded,
      },
    ],
    isTransferSubmitting: false,
    isIbcTransferSubmitting: false,
    transferError:
      "Async actions timed out when submitting Token Transfer after 20 seconds",
  },
  channels: {
    channelsByChain: {
      "anoma-test.1e670ba91369ec891fc": {
        "anoma-test.89060614ce340f4baae": ["channel-0"],
      },
      "anoma-test.89060614ce340f4baae": {
        "anoma-test.1e670ba91369ec891fc": ["channel-0"],
      },
    },
  },
  settings: {
    fiatCurrency: "USD",
    chainId: "anoma-masp-1.5.32ccad5356012a7",
  },
  coins: {
    rates: {},
  },
  stakingAndGovernance: {
    myBalances: [],
    validators: [],
    myValidators: [],
    myStakingPositions: [],
  },
  notifications: {
    toasts: {} 
  }
};
