#!/usr/bin/env bash

mkdir -p ./cli/var/lib/minopanel/bin
mkdir -p ./cli/etc/minopanel.d
mkdir -p ./cli/etc/bash_completion.d
mkdir -p ./cli/usr/bin
mkdir -p ./cli/usr/share/zsh/site-functions/
mkdir -p ./cli/usr/share/fish/completions/

MINOPANEL_VERSION=0.0.1

cp ../minoctl ./cli/usr/bin

cp ../../../dist/minoctl.cjs ./cli/var/lib/minopanel/bin

node ./cli/var/lib/minopanel/bin/minoctl.cjs complete bash > ./cli/etc/bash_completion.d/minoctl
sed -i \
  's|requestComp=".*complete --|requestComp="minoctl complete --|g' \
  ./cli/etc/bash_completion.d/minoctl

node ./cli/var/lib/minopanel/bin/minoctl.cjs complete zsh > ./cli/usr/share/zsh/site-functions/_minoctl
sed -i \
  's|requestComp=".*complete --|requestComp="minoctl complete --|g' \
  ./cli/usr/share/zsh/site-functions/_minoctl

node ./cli/var/lib/minopanel/bin/minoctl.cjs complete fish > ./cli/usr/share/fish/completions/minoctl.fish
sed -i \
  's|set -l requestComp ".*|set -l requestComp "minoctl complete -- (string join '"'"' '"'"' -- (string escape -- $args[2..-1])) $lastArg"|g' \
  ./cli/usr/share/fish/completions/minoctl.fish

chmod -R 777 ./cli/var/lib/minopanel
chmod -R 777 ./cli/etc/minopanel.d

dpkg-deb --root-owner-group -Zxz -z6 -b cli ../../../dist/minoctl-$MINOPANEL_VERSION-amd64.deb