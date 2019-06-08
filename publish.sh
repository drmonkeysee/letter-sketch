#!/bin/sh

set -euo pipefail

pub_dir=pub

rm -rf $pub_dir
mkdir $pub_dir
npm run build | tee /dev/stderr | awk 'NR > 6 {print $1}' | xargs -I {} mv -v {} $pub_dir
#git checkout gh-pages
sed -E 's/(href|src)="\//\1="\/pub\//g' $pub_dir/index.html > index.html
rm $pub_dir/index.html
#git add -am 'publish site'
#git push
#git checkout master
