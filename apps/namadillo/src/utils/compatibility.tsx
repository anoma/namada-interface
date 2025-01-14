import { routes } from "App/routes";
import compatibility from "compatibility.json";
import { wallets } from "integrations";
import { Link } from "react-router-dom";
import semver from "semver";
import semverSatisfies from "semver/functions/satisfies";
import semverLtr from "semver/ranges/ltr";
import { version as interfaceVersion } from "../../package.json";
import { isFirefox } from "./etc";

const fetchRequiredInterfaceVersion = async (): Promise<string> => {
  try {
    const response = await fetch(
      "https://raw.githubusercontent.com/anoma/namada-interface/refs/heads/main/apps/namadillo/package.json"
    );
    const data = await response.json();
    return data.version || "";
  } catch (error) {
    console.error("Failed to fetch required interface version:", error);
    return "";
  }
};

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

export const checkIndexerCompatibilityErrors = (
  indexerVersion: string
): React.ReactNode => {
  const requiredVersion = compatibility.indexer;
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
  const targetKeychainVersion = compatibility.keychain;
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

const normalizeToMinor = (version: string): string => {
  const parsed = semver.parse(version);
  if (!parsed) return "";
  return `${parsed.major}.${parsed.minor}.0`;
};

export const checkInterfaceCompatibilityError =
  async (): Promise<React.ReactNode> => {
    const requiredInterfaceVersion = await fetchRequiredInterfaceVersion();
    const normalizedCurrent = normalizeToMinor(interfaceVersion);
    const normalizedRequired = normalizeToMinor(requiredInterfaceVersion);

    if (!normalizedCurrent || !normalizedRequired) {
      return "";
    }

    if (semver.gt(normalizedRequired, normalizedCurrent)) {
      return (
        <>
          Namadillo is running an outdated version and some features may not
          work as intended. Please wait for the operator to update to{" "}
          <strong>{requiredInterfaceVersion}</strong>. More on{" "}
          <a href="https://namada.net/apps#interfaces">Namada Apps</a>.
        </>
      );
    }

    return "";
  };
