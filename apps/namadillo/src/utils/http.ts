export const isError404 = (e: unknown): boolean =>
  typeof e === "object" && e !== null && "status" in e && e.status === 404;
