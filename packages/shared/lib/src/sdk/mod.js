/* eslint-disable @typescript-eslint/explicit-function-return-type */
const PREFIX = "Namada::SDK";

export async function hasMaspParams() {
  return (
    (await has("masp-spend.params")) &&
    (await has("masp-output.params")) &&
    (await has("masp-convert.params"))
  );
}

export async function fetchAndStoreMaspParams() {
  return Promise.all([
    fetchAndStore("masp-spend.params"),
    fetchAndStore("masp-output.params"),
    fetchAndStore("masp-convert.params"),
  ]);
}

export async function getMaspParams() {
  return Promise.all([
    get("masp-spend.params"),
    get("masp-output.params"),
    get("masp-convert.params"),
  ]);
}

export async function fetchAndStore(params) {
  const data = await fetchParams(params);
  await set(params, data);
}

export async function fetchParams(params) {
  const path =
    process.env.NAMADA_INTERFACE_MASP_PARAMS_PATH ||
    "https://github.com/anoma/masp-mpc/releases/download/namada-trusted-setup/";

  return fetch(`${path}${params}`)
    .then((response) => response.arrayBuffer())
    .then((ab) => new Uint8Array(ab));
}

function getDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(PREFIX);
    request.onerror = (event) => {
      event.stopPropagation();
      reject(event.target);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      db.createObjectStore(PREFIX, { keyPath: "key" });
    };

    request.onsuccess = () => {
      resolve(request.result);
    };
  });
}

export async function get(key) {
  const tx = (await getDB()).transaction(PREFIX, "readonly");
  const store = tx.objectStore(PREFIX);

  return new Promise((resolve, reject) => {
    const request = store.get(key);
    request.onerror = (event) => {
      event.stopPropagation();

      reject(event.target);
    };
    request.onsuccess = () => {
      if (!request.result) {
        resolve(undefined);
      } else {
        resolve(request.result.data);
      }
    };
  });
}

export async function has(key) {
  const tx = (await getDB()).transaction(PREFIX, "readonly");
  const store = tx.objectStore(PREFIX);

  return new Promise((resolve, reject) => {
    const request = store.openCursor(key);
    request.onerror = (event) => {
      event.stopPropagation();

      reject(event.target);
    };
    request.onsuccess = (e) => {
      const cursor = e.target.result;
      resolve(!!cursor);
    };
  });
}

export async function set(key, data) {
  const tx = (await getDB()).transaction(PREFIX, "readwrite");
  const store = tx.objectStore(PREFIX);

  return new Promise((resolve, reject) => {
    const request = store.put({
      key,
      data,
    });
    request.onerror = (event) => {
      event.stopPropagation();

      reject(event.target);
    };
    request.onsuccess = () => {
      resolve();
    };
  });
}
