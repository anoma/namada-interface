import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as t from "io-ts";
import { PathReporter } from "io-ts/PathReporter";
import { Entity } from "./Entity";

enum AccountType {
  Mnemonic = "mnemonic",
  PrivateKey = "private-key",
  ShieldedKeys = "shielded-keys",
  Ledger = "ledger",
}

const Bip44Path = t.type({
  account: t.number,
  change: t.number,
  index: t.number,
});

const Schema = t.exact(
  t.intersection([
    t.type({
      id: t.string,
      alias: t.string,
      address: t.string,
      owner: t.string,
      path: Bip44Path,
      type: t.keyof({
        [AccountType.Mnemonic]: null,
        [AccountType.PrivateKey]: null,
        [AccountType.ShieldedKeys]: null,
        [AccountType.Ledger]: null,
      }),
    }),
    t.partial({
      publicKey: t.string,
      parentId: t.string,
    }),
  ])
);

export type AccountEntityType = t.TypeOf<typeof Schema>;

const schemas = [Schema];
type Schemas = (typeof schemas)[number];

const getVersion = (data: unknown): { decodedData?: unknown; idx: number } => {
  const findVersion = A.findFirstMap((schema: Schemas) => {
    const decoded = schema.decode(data);
    if (E.isLeft(decoded)) {
      console.warn(PathReporter.report(decoded));
    }

    return pipe(
      O.fromEither(decoded),
      O.map((d) => ({ decodedData: d, idx: schemas.indexOf(schema) }))
    );
  });

  return pipe(
    schemas,
    findVersion,
    O.getOrElse(() => ({ idx: -1 }))
  );
};

const migrations = [t.identity];

export const migrate = (data: unknown): O.Option<AccountEntityType> => {
  const { idx, decodedData } = getVersion(data);

  //TODO: use fp-ts
  return idx !== -1
    ? O.some(
        migrations
          .slice(idx)
          .reduce(
            (acc, migration) => migration(acc),
            decodedData
          ) as AccountEntityType
      )
    : O.none;
};

export const AccountEntity: Entity<AccountEntityType, typeof Schema> = {
  schema: Schema,
  migration: migrate,
};
