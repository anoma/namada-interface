importScripts("indexedDb.js");
importScripts("constants.js");

const store = new IndexedDBKVStore(STORAGE_PREFIX);

console.log({
  store,
  STORAGE_PREFIX,
  TRUSTED_SETUP_URL,
  MaspParams,
});

(async () => {
  await store.set("test", "delete me");
  const test = await store.get("test");
  console.log({ test });
  await store.set("test", null);
  console.log(await store.get("test"));
})();
