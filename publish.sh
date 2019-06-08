#!/bin/sh

set -euo pipefail

rm -rf build_tmp
mkdir build_tmp
npm run build | tee /dev/stderr | awk 'NR > 6 {print $1}' | xargs -I {} mv -v {} build_tmp
#git checkout gh-pages
npm run clean
mv -v build_tmp dist
sed -E 's/(href|src)="\//\1="\/dist\//g' dist/index.html > index.html
rm dist/index.html
#git add -am 'publish site'
#git push
#git checkout master
