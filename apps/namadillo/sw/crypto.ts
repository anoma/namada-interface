const sha256Hash = async (msg: Uint8Array): Promise<string> => {
  const hashBuffer = await crypto.subtle.digest("SHA-256", msg);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  // Return hash as hex
  return hashArray.map((byte) => byte.toString(16).padStart(2, "0")).join("");
};
