export async function call(url, method, body) {
  const res = await fetch(url, {
    method,
    body,
  });
  return res;
}
