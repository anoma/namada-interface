import * as E from "fp-ts/Either";
import * as t from "io-ts";

import { Vault as VaultV1 } from "./VaultSchemaV1";
import { Vault as VaultV2 } from "./VaultSchemaV2";

type VaultV1Type = t.TypeOf<typeof VaultV1>;
type VaultV2Type = t.TypeOf<typeof VaultV2>;

export const v1toV2 = (data: VaultV1Type): VaultV2Type => {
  const dataV2 = {
    ...data,
    data: {
      "key-store": data.data["key-store"].map((ks) => ({
        ...ks,
        // we set source to "imported" because "generated" with timestamp 0 does not make sense
        public: { ...ks.public, source: "imported", timestamp: 0 },
      })),
    },
  };

  const decodedDataV2 = VaultV2.decode(dataV2);
  if (E.isLeft(decodedDataV2)) {
    throw new Error("Can't decode data after migration from v1 to v2");
  }

  return decodedDataV2.right;
};
