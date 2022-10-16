export const Argon2Config = {
  // Number of memory blocks
  // Max: 268_435_455
  // Min: 8
  m_cost: 4096,
  // Number of iterations (time)
  // Max: 4_294_967_29
  // Min: 1
  t_cost: 3,
  // Number of threads (degree of parallelism)
  // Max: 16_777_215
  // Min: 1
  p_cost: 1,
};
