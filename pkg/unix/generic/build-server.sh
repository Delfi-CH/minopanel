#!/usr/bin/env bash

mkdir -p minopaneld/usr/bin
mkdir -p minopaneld/etc/minopanel.d
mkdir -p minopaneld/var/lib/minopanel/bin/servers
mkdir -p minopaneld/var/lib/minopanel/bin/java
mkdir -p minopaneld/var/lib/minopanel/data/servers
mkdir -p minopaneld/var/lib/minopanel/data/java

chmod -R 776 minopaneld/etc/minopanel.d
chmod -R 776 minopaneld/var/lib/minopanel/bin
chmod -R 776 minopaneld/var/lib/minopanel/bin/servers
chmod -R 776 minopaneld/var/lib/minopanel/bin/java
chmod -R 776 minopaneld/var/lib/minopanel/data/servers
chmod -R 776 minopaneld/var/lib/minopanel/data/java

cp ../../../README.md ./minopaneld
cp ../../../LICENSE ./minopaneld

cp -r ../../../node_modules ./minopaneld/var/lib/minopanel/bin
cp ../minopaneld ./minopaneld/usr/bin
javac ../../../src/lib/jvm/SelfTest.java
cp ../../../src/lib/jvm/SelfTest.class ./minopaneld/var/lib/minopanel/data/java
cp ../../../dist/minopaneld.cjs ./minopaneld/var/lib/minopanel/bin

tar czf ../../../dist/minopaneld-amd64.tar.gz ./minopaneld
tar cjf ../../../dist/minopaneld-amd64.tar.xz ./minopaneld