# NPM Publish

## Publish procedure

To publish packages run `yarn release` in the root of the monorepo.
This will release packages as specified in the `.release-it.cjs` files.

## Steps

- yarn will detect workspaces that have `release` script available
- yarn will iterate over workspaces in topological order and run `release` script
- each package `release` will:
  - build the package
  - create the changelog with changes to the package since last `namada-${version}` tag
  - bump the version in `package.json` based on the detected changes
  - bump the versions in `package.json` of the other local packages if needed
  - publish the package to the NPM **if** `.release-it.cjs` has `npm.publish` flag set to `true`
- at the end `yarn` will run `release-it` cmd in the root of the monorepo, which will:
  - bump the version in `package.json` based on the detected changes
  - generate tag and commit with all the changelog and `package.json` changes
  - push the changes to the current branch

The outcome is:

- new changelog entry for every package(no changelog for root of the monorepo)
- new version for every package(packages can have different versions)
- one tag for all packages

## Testing

To test run either:

- `yarn release:dry-run` this will not generate changelogs or new `package.json` files
- `yarn release:no-npm` this will skip npm publish step and will prompt you for commit/tag information. It can be treated as semi-automatic release. To do so, run `yarn release:no-npm`, go to the specific packages you wish to publish to the `NPM` and run `yarn publish`

## Future improvements

- run tests for each workspace before publishing
- add github publish configuration for workspaces like `extension`
- add `release` script to CI
