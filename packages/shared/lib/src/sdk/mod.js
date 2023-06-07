export const PREFIX = "Anoma::SDK";

export async function getMaspParams(params) {
  const stored = await get(params);
  let data;

  if (!stored) {
    data = await fetchParams(params);
    await set(params, data);
  } else {
    data = await get(params);
  }

  return data;
}

export async function hasMaspParams(params) {
  return await has(params);
}

async function fetchParams(params) {
  return fetch(
    `https://github.com/anoma/masp-mpc/releases/download/namada-trusted-setup/${params}`
  )
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

async function get(key) {
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

async function has(key) {
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

async function set(key, data) {
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
