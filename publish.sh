#!/bin/sh

set -euo pipefail

build_dir=build_tmp
pub_dir=assets

rm -rf $build_dir
mkdir $build_dir
npm run build | tee /dev/stderr | awk 'NR > 6 {print $1}' | xargs -I {} cp -v {} $build_dir

git checkout gh-pages
rm -rf $pub_dir && mv -v $build_dir $pub_dir
replace="s/(href|src)=\"\//\1=\"\/$pub_dir\//g"
sed -E $replace $pub_dir/index.html > index.html
rm $pub_dir/index.html

git diff --quiet
if [ $? -ne 0 ] ; then
	git add $pub_dir index.html
	#git commit -m 'publish site'
	#git push
else
	echo 'No changes to publish'
fi
#git checkout master
