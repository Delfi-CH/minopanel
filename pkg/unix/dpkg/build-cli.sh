#!/usr/bin/env bash

mkdir -p ./cli/var/lib/minopanel/bin
mkdir -p ./cli/etc/minopanel.d
mkdir -p ./cli/usr/bin


cp ../minoctl ./cli/usr/bin

cp ../../../dist/minoctl.cjs ./cli/var/lib/minopanel/bin

dpkg-deb --root-owner-group -b cli ../../../dist/minoctl.deb