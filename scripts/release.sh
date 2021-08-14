#!/bin/bash

function usage {
  echo "$0 [current version] [release version]"
  echo -e "\te.g. $0 1.1.7 1.1.8"
}

if [ $# -ne 2 ]; then
  usage
  exit
fi

CURVER=$1
NEWVER=$2

echo $CURVER | grep -q -E "^v"
if [ $? -eq 0 ]; then
  usage
  exit
fi

echo $NEWVER | grep -q -E "^v"
if [ $? -eq 0 ]; then
  usage
  exit
fi

./scripts/changelog.sh v$CURVER v$NEWVER
sed -e "s/^\(.*$CURVER.*\)$/\1\n\1/" README.md | sed -e "0,/$CURVER/s//$NEWVER/g" | sed -e "s/\($NEWVER.md)<\/b> \)([^)]*)/\1($(date +"%b %d, %Y"))/" > README.md
sed -i -e "$(grep -n -E "v[0-9]+\.[0-9]+\.[0-9]+\.md" README.md | tail -n 1 | cut -d ':' -f 1)d" README.md
sed -i -e "0,/^\s*\"version/{s/^\(\s*\"version\": \).*$/\1\"$NEWVER\",/}" package.json client/package.json
cat << EOF > release_notes/v$NEWVER.md
<!-- (SPDX-License-Identifier: CC-BY-4.0) -->  <!-- Ensure there is a newline before, and after, this line -->

## New Features

$(git log "v$CURVER..HEAD"  --oneline | grep -v Merge | cut -d ' ' -f 2- | sed -e 's/^/* /')

## Bug Fixes and Updates

* 

## Known Vulnerabilities

package-lock.json
\`\`\`
$(npm audit | grep -E "Severity: critical" -B2 -A10)
\`\`\`

client/package-lock.json
\`\`\`
$(cd client; npm audit | grep -E "Severity: critical" -B2 -A10)
\`\`\`
EOF