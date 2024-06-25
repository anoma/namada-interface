Namadillo release procedure
===========================

TODO: These docs won't be correct until we have defined a process for adding
CHANGELOG entries. For now this is loosely based on the namada process.

1. Build the changelog
  - Run the command TODO to generate the CHANGELOG.md
  - Check the Unreleased section of CHANGELOG.md to make sure there is nothing
    missing. It is fine to manually edit CHANGELOG.md if there are errors
  - Leave the "Unreleased" header as it will be automatically replaced with the
    version number later
  - Commit CHANGELOG.md and push

2. Run the "Create Namadillo draft release" workflow on GitHub actions
  - <https://github.com/anoma/namada-interface/actions/workflows/release-namadillo.yml>
  - This will build and package Namadillo, create a new tag and release commit,
    and create a draft release on GitHub

3. Publish the release
  - <https://github.com/anoma/namada-interface/releases>
  - Check the draft release is correct, including:
    - Namadillo is attached as a zipped asset
    - The version and tag are correct
    - The release text includes the changelog entry for this release
  - Click edit and "Publish release"

That's it! A new version of Namadillo has been released.
