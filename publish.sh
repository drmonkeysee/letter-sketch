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

set +e
git diff --quiet
has_diff=$?
set -e
if [ $has_diff -ne 0 ] ; then
	git add $pub_dir index.html && git status
	set +e
	read -q 'cont?Publish changes? [y/N]'
	set -e
	if [ "$cont" == "y" ] ; then
		echo 'Published'
		#git commit -m 'publish site'
		#git push
	else
		echo 'Publish cancelled'
	fi
else
	echo 'No changes to publish'
fi
git checkout master
