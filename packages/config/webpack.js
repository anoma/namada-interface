/**
 * Selects a subset of environment variables from process.env.
 *
 * @param {string} prefix - All env vars starting with this prefix are added
 * @param {string[]} extras - Other env vars that should be added
 * @returns {object} An object containing only the allowed env vars
 */
const getProcessEnv = (prefix, extras) => {
  const prefixedEntries = Object.entries(process.env)
    .filter(([key, value]) => key.startsWith(`${prefix}_`));

  const extraEntries = extras.map(key => [key, process.env[key]]);

  return prefixedEntries.concat(extraEntries).reduce(
    (acc, [key, value]) => ({ [key]: value, ...acc }),
    {}
  );
};

module.exports = {
  getProcessEnv,
};
