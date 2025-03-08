import semverSatisfies from "semver/functions/satisfies";
import semverLtr from "semver/ranges/ltr";

enum CompatibilityOutput {
  IncompatibleVersion = -1,
  Compatible = 0,
  InterfaceOutdated = 1,
}

const checkVersionsCompatible = (
  currentVersion: string,
  requiredVersion: string
): CompatibilityOutput => {
  if (semverSatisfies(currentVersion, requiredVersion)) {
    return CompatibilityOutput.Compatible;
  }
  return semverLtr(currentVersion, requiredVersion) ?
      CompatibilityOutput.IncompatibleVersion
    : CompatibilityOutput.InterfaceOutdated;
};

/**
 * On keychain version 0.4.0, the keychain changed the way it generates shielded keys to
 * support modified-zip32. This function checks if the keychain has a compatible version with this change.
 */
export const checkKeychainCompatibleWithMasp = (
  keychainVersion: string
): boolean =>
  checkVersionsCompatible(keychainVersion, ">=0.4.0") ===
  CompatibilityOutput.Compatible;
