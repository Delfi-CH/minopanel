#!/usr/bin/env bash

mkdir -p minowebd/usr/bin
mkdir -p minowebd/etc/minopanel.d
mkdir -p minowebd/var/lib/minopanel/bin
mkdir -p minowebd/var/lib/minopanel/web

chmod -R 777 minowebd/etc/minopanel.d
chmod -R 777 minowebd/var/lib/minopanel/bin
chmod -R 777 minowebd/var/lib/minopanel/web

cp ../../../README.md ./minowebd
cp ../../../LICENSE ./minowebd

cp -r ../../../build/ ./minowebd/var/lib/minopanel/web
cp ../minowebd ./minowebd/usr/bin
cp ../../../dist/minowebd.cjs ./minowebd/var/lib/minopanel/bin

tar czf ../../../dist/minowebd-amd64.tar.gz ./minowebd
tar cjf ../../../dist/minowebd-amd64.tar.xz ./minowebd