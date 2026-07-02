#!/usr/bin/env bash

MINOPANEL_VERSION=0.8.0

mkdir -p ./web/var/lib/minopanel/web
mkdir -p ./web/var/lib/minopanel/bin
mkdir -p ./web/etc/minopanel.d
mkdir -p ./web/usr/bin

cp ../minowebd ./web/usr/bin

cp ../../../dist/minowebd.cjs ./web/var/lib/minopanel/bin

cp -r ../../../build/* ./web/var/lib/minopanel/web/

chmod -R 777 ./web/var/lib/minopanel
chmod -R 777 ./web/etc/minopanel.d

dpkg-deb --root-owner-group -Zxz -z6 -b web ../../../dist/minowebd-$MINOPANEL_VERSION-amd64.deb