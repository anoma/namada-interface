export const PREFIX = "Anoma::SDK";

export async function fetchParams(params) {
  return fetch(`http://localhost:3000/assets/${params}`)
    .then((response) => response.blob())
    .then((blob) => blob.arrayBuffer())
    .then((ab) => new Uint8Array(ab))
    .then((a) => {
      console.log("done", a.length);
      return a;
    });
}

export async function fetchAndStore(params) {
  const stored = await get(params);

  if (!stored) {
    const data = await fetchParams(params);
    await set(params, data);
  }
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
