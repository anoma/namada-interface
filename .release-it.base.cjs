const config = {
  git: {
    commit: false,
    tag: false,
    push: false,
    requireCleanWorkingDir: false,
    tagName: "namada-${version}",
  },
  npm: {
    publish: false,
    versionArgs: ["--workspaces-update=false"],
  },
  plugins: {
    "@release-it/conventional-changelog": {
      preset: {
        name: "conventionalcommits",
      },
      infile: "CHANGELOG.md",
      gitRawCommitsOpts: {
        path: ".",
      },
    },
  },
};

module.exports = config;
