#!/bin/sh

set -euo pipefail

pub_dir=assets

rm -rf $pub_dir
mkdir $pub_dir
npm run build | tee /dev/stderr | awk 'NR > 6 {print $1}' | xargs -I {} cp -v {} $pub_dir

git checkout gh-pages
replace="s/(href|src)=\"\//\1=\"\/$pub_dir\//g"
sed -E $replace $pub_dir/index.html > index.html
rm $pub_dir/index.html

git add $pub_dir index.html
#git commit -m 'publish site'
#git push
#git checkout master
