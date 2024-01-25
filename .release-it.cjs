const config = {
  git: {
    requireCleanWorkingDir: false,
    tagName: "namada-${version}",
    tagArgs: "--force",
    commitMessage: "chore: release v${version}",
    tagAnnotation: "Release  ${version}",
  },
  npm: {
    publish: false,
  },
  plugins: {
    "@release-it/conventional-changelog": {
      preset: {
        name: "conventionalcommits",
      },
      infile: false,
    },
  },
};

module.exports = config;
