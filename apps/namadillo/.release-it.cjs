module.exports = {
  hooks: {
    "after:git:release": "scripts/package.sh ${version}"
  },
  git: {
    commitMessage: "chore: release namadillo v${version}",
    tagName: "namadillo-${version}",
    tagAnnotation: "Release namadillo ${version}",
  },
  github: {
    release: true,
    draft: true,
    releaseName: "Namadillo ${version}",
    assets: ["namadillo-*.zip"],
  },
  npm: {
    publish: false
  },
  plugins: {
    "@release-it/keep-a-changelog": {
      strictLatest: false, // TODO: remove after initial release
      addVersionUrl: true
    }
  }
};
