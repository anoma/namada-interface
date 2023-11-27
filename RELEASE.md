Release procedure
=================

Extension
---------
1. Bump the version in `apps/extension/package.json`. Version changes should
   follow [semantic versioning][1].

2. Update `apps/extension/CHANGELOG.md` with any changes missing from the
   changelog since the last release. There are good guidelines for writing a
   changelog [here][3] and [here][4].

2. Commit the changes with a message like:

   chore: Release extension v0.1.1

3. Go to the [Deploy interface and release extension][2] workflow on GitHub
   Actions and run the workflow. This will create a new release on GitHub and
   create a tag for the release commit.

4. Download the Firefox and Chrome extension zip files from the "Assets" section
   of the GitHub release page and submit them to the Chrome and Firefox stores
   for review.

[1]: https://semver.org/
[2]: https://github.com/anoma/namada-interface/actions/workflows/release-wallet.yml
[3]: https://common-changelog.org/
[4]: https://keepachangelog.com/en/1.1.0/
