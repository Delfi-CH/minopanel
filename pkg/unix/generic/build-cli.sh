#!/usr/bin/env bash

mkdir -p minoctl/usr/bin
mkdir -p minoctl/etc/minopanel.d
mkdir -p minoctl/var/lib/minopanel/bin

chmod -R 777 minoctl/etc/minopanel.d
chmod -R 777 minoctl/var/lib/minopanel/bin

cp ../../../README.md ./minoctl
cp ../../../LICENSE ./minoctl

cp ../minoctl ./minoctl/usr/bin
cp ../../../dist/minoctl.cjs ./minoctl/var/lib/minopanel/bin

tar czf ../../../dist/minoctl-amd64.tar.gz ./minoctl
tar cjf ../../../dist/minoctl-amd64.tar.xz ./minoctl