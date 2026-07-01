#!/usr/bin/env bash

mkdir -p ./server/var/lib/minopanel/bin
mkdir -p ./server/var/lib/minopanel/bin/java
mkdir -p ./server/var/lib/minopanel/bin/servers
mkdir -p ./server/var/lib/minopanel/data/java
mkdir -p ./server/var/lib/minopanel/data/servers
mkdir -p ./server/etc/minopanel.d
mkdir -p ./server/usr/bin

cp ../minopaneld ./server/usr/bin

cp ../../../dist/minopaneld.cjs ./server/var/lib/minopanel/bin

pnpm prune --prod

cp -r ../../../node_modules ./server/var/lib/minopanel/bin

javac ../../../src/lib/jvm/SelfTest.java

cp ../../../src/lib/jvm/SelfTest.class ./server/var/lib/minopanel/data/java

chmod -R 777 ./server/var/lib/minopanel
chmod -R 777 ./server/etc/minopanel.d

dpkg-deb --root-owner-group -Zxz -z6 -b server ../../../dist/minopaneld-amd64.deb