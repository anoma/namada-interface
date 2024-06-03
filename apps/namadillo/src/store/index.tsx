import { QueryClient } from "@tanstack/react-query";
import {
  PersistQueryClientProvider,
  PersistedClient,
  Persister,
} from "@tanstack/react-query-persist-client";
import BigNumber from "bignumber.js";
import { del, get, set } from "idb-keyval";
import traverse, { TraverseContext } from "traverse";

/**
 * Objects lose their prototype when stored in Indexed DB, so in order to store
 * and retrieve BigNumbers we traverse the object being stored and write/read the
 * `_isBigNumber` property.
 */
const fixBigNumbers = (
  client: PersistedClient,
  traverseCallback: (this: TraverseContext, value: unknown) => void
): void => {
  const { queries, mutations } = client.clientState;
  [...queries, ...mutations].forEach((query) =>
    traverse(query.state.data).forEach(traverseCallback)
  );
};

/**
 * Creates an Indexed DB persister
 * @see https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
 *
 * Taken from https://tanstack.com/query/latest/docs/framework/react/plugins/persistQueryClient#building-a-persister
 */
const createIDBPersister = (
  idbValidKey: IDBValidKey = "reactQuery"
): Persister => ({
  persistClient: async (client: PersistedClient) => {
    fixBigNumbers(client, function (value) {
      if (BigNumber.isBigNumber(value)) {
        this.update({ ...value, _isBigNumber: true }, true);
      }
    });

    await set(idbValidKey, client);
  },
  restoreClient: async () => {
    const client = await get<PersistedClient>(idbValidKey);

    if (typeof client !== "undefined") {
      fixBigNumbers(client, function (value) {
        if (
          typeof value === "object" &&
          value !== null &&
          "_isBigNumber" in value &&
          value._isBigNumber
        ) {
          this.update(BigNumber(value as unknown as BigNumber.Value), true);
        }
      });
    }

    return client;
  },
  removeClient: async () => {
    await del(idbValidKey);
  },
});

export const queryClient = new QueryClient();

const persister = createIDBPersister();

export const StoreProvider: React.FC = ({ children }) => {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        dehydrateOptions: {
          // only persist queries that set the meta.persist flag
          shouldDehydrateQuery: (query) => Boolean(query.meta?.persist),
        },
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
};
