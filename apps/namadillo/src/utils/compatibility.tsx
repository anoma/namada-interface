import { routes } from "App/routes";
import compatibilty from "compatibility.json";
import { wallets } from "integrations";
import { Link } from "react-router-dom";
import semverSatisfies from "semver/functions/satisfies";
import semverLtr from "semver/ranges/ltr";
import { isFirefox } from "./etc";

enum CompatibilityOutput {
  IncompatibleVersion = -1,
  Compatible = 0,
  InterfaceOutdated = 1,
}

// Checks if the versions are compatible using semantic versioning (semver).
// Returns true if the versions are compatible, -1 if the version is outdated,
// or 1 if a required version is lower than the version provided.
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

export const checkIndexerCompatibilityErrors = (
  indexerVersion: string
): React.ReactNode => {
  const requiredVersion = compatibilty.indexer;
  const checkResult = checkVersionsCompatible(indexerVersion, requiredVersion);

  if (checkResult === CompatibilityOutput.IncompatibleVersion) {
    return (
      <>
        You&apos;re using an outdated version of Namada Indexer. Please update
        your indexer URL in the{" "}
        <Link to={routes.settingsAdvanced}>Advanced Settings</Link> section.
      </>
    );
  }

  if (checkResult === CompatibilityOutput.InterfaceOutdated) {
    return (
      <>
        Your Namadillo version is not compatible with the current Namada
        Indexer. Please upgrade your web interface or pick a different one from
        the <a href="https://namada.net/apps#interfaces">Namada Apps</a> list.
      </>
    );
  }

  return "";
};

export const checkKeychainCompatibilityError = (
  keychainVersion: string
): React.ReactNode => {
  const targetKeychainVersion = compatibilty.keychain;
  const checkResult = checkVersionsCompatible(
    keychainVersion,
    targetKeychainVersion
  );

  if (checkResult === CompatibilityOutput.IncompatibleVersion) {
    return (
      <>
        Your Namada Keychain version is outdated. Please upgrade it using{" "}
        {isFirefox() ?
          <a
            href={wallets.namada.downloadUrl.firefox}
            target="_blank"
            rel="nofollow noreferrer"
          >
            Firefox addons
          </a>
        : <a
            href={wallets.namada.downloadUrl.chrome}
            target="_blank"
            rel="nofollow noreferrer"
          >
            Chrome store
          </a>
        }{" "}
        or websites.
      </>
    );
  }

  if (checkResult === CompatibilityOutput.InterfaceOutdated) {
    return (
      <>
        Your Namadillo version is not compatible with the keychain installed.
        Please upgrade your web interface or pick a different one from the{" "}
        <a href="https://namada.net/apps#interfaces">Namada Apps</a> list.
      </>
    );
  }

  return "";
};
