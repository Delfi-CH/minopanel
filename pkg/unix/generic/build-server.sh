#!/usr/bin/env bash

MINOPANEL_VERSION=0.8.0


mkdir -p minopaneld/usr/bin
mkdir -p minopaneld/etc/minopanel.d
mkdir -p minopaneld/var/lib/minopanel/bin/servers
mkdir -p minopaneld/var/lib/minopanel/bin/java
mkdir -p minopaneld/var/lib/minopanel/data/servers
mkdir -p minopaneld/var/lib/minopanel/data/java

chmod -R 777 minopaneld/etc/minopanel.d
chmod -R 777 minopaneld/var/lib/minopanel/bin
chmod -R 777 minopaneld/var/lib/minopanel/bin/servers
chmod -R 777 minopaneld/var/lib/minopanel/bin/java
chmod -R 777 minopaneld/var/lib/minopanel/data/servers
chmod -R 777 minopaneld/var/lib/minopanel/data/java

cp ../../../README.md ./minopaneld
cp ../../../LICENSE ./minopaneld

pnpm prune --prod

cp -r ../../../node_modules ./minopaneld/var/lib/minopanel/bin
cp ../minopaneld ./minopaneld/usr/bin
javac ../../../src/lib/jvm/SelfTest.java
cp ../../../src/lib/jvm/SelfTest.class ./minopaneld/var/lib/minopanel/data/java
cp ../../../dist/minopaneld.cjs ./minopaneld/var/lib/minopanel/bin

tar czf ../../../dist/minopaneld-$MINOPANEL_VERSION-amd64.tar.gz ./minopaneld
tar cjf ../../../dist/minopaneld-$MINOPANEL_VERSION-amd64.tar.xz ./minopaneld