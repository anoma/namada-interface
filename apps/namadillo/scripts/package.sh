#!/usr/bin/env bash
#  Creates a ZIP file of Namadillo for publishing.
#  Usage:
#      ./scripts/package.sh <version>

set -e

if [[ -z "$1" ]]
then
    echo "no version string specified"
    exit 1
fi

VERSION="$1"
DIR="namadillo-$VERSION"
README="$DIR/README.md"

echo "Copying files"
mkdir $DIR
cp -r dist $DIR
cp README-dist.md $README
cp CHANGELOG.md $DIR

echo "Adding build information to README"
BUILD_INFO="
Build information
-----------------

Version: $VERSION"
echo "$BUILD_INFO" >> $README

echo "Zipping"
zip -r "$DIR.zip" $DIR
