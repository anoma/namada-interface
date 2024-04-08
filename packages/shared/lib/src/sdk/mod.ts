const PREFIX = "Namada::SDK";

export async function hasMaspParams(): Promise<boolean> {
  return (
    (await has("masp-spend.params")) &&
    (await has("masp-output.params")) &&
    (await has("masp-convert.params"))
  );
}

export async function fetchAndStoreMaspParams(): Promise<[void, void, void]> {
  return Promise.all([
    fetchAndStore("masp-spend.params"),
    fetchAndStore("masp-output.params"),
    fetchAndStore("masp-convert.params"),
  ]);
}

export async function getMaspParams(): Promise<[unknown, unknown, unknown]> {
  return Promise.all([
    get("masp-spend.params"),
    get("masp-output.params"),
    get("masp-convert.params"),
  ]);
}

export async function fetchAndStore(params: string): Promise<void> {
  const data = await fetchParams(params);
  await set(params, data);
}

export async function fetchParams(params: string): Promise<Uint8Array> {
  const path =
    process.env.NAMADA_INTERFACE_MASP_PARAMS_PATH ||
    "https://github.com/anoma/masp-mpc/releases/download/namada-trusted-setup/";

  return fetch(`${path}${params}`)
    .then((response) => response.arrayBuffer())
    .then((ab) => new Uint8Array(ab));
}

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(PREFIX);
    request.onerror = (event) => {
      event.stopPropagation();
      reject(event.target);
    };

    request.onupgradeneeded = (event) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = (event.target as any).result;

      db.createObjectStore(PREFIX, { keyPath: "key" });
    };

    request.onsuccess = () => {
      resolve(request.result);
    };
  });
}

export async function get(key: string): Promise<unknown> {
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

export async function has(key: string): Promise<boolean> {
  const tx = (await getDB()).transaction(PREFIX, "readonly");
  const store = tx.objectStore(PREFIX);

  return new Promise((resolve, reject) => {
    const request = store.openCursor(key);
    request.onerror = (event) => {
      event.stopPropagation();

      reject(event.target);
    };
    request.onsuccess = (e) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cursor = (e.target as any).result;
      resolve(!!cursor);
    };
  });
}

export async function set(key: string, data: unknown): Promise<void> {
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
