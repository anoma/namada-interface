export const PREFIX = "Anoma::SDK";

async function fetchParams(params) {
  //TODO: pass env
  return fetch(`http://localhost:3000/assets/${params}`)
    .then((response) => response.arrayBuffer())
    .then((ab) => new Uint8Array(ab));
}

export async function fetchAndStore(params) {
  const stored = await get(params);
  let data;

  if (!stored) {
    data = await fetchParams(params);
    await set(params, data);
  } else {
    data = await get(params);
  }

  console.log(params);
  return data;
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
