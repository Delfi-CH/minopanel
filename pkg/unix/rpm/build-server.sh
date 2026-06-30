#!/usr/bin/env bash

MINOPANEL_VERSION=0.0.1

mkdir -p BUILD BUILDROOT RPMS SRPMS SOURCES SPECS

mkdir -p minopaneld-$MINOPANEL_VERSION/dist

cp ../minopaneld minopaneld-$MINOPANEL_VERSION

cp ../../../dist/minopaneld.cjs minopaneld-$MINOPANEL_VERSION/dist

cp -r ../../../node_modules minopaneld-$MINOPANEL_VERSION

cp ../../../LICENSE minopaneld-$MINOPANEL_VERSION

cp ../../../README.md minopaneld-$MINOPANEL_VERSION

javac ../../../src/lib/jvm/SelfTest.java

cp ../../../src/lib/jvm/SelfTest.class minopaneld-$MINOPANEL_VERSION

tar czf minopaneld-$MINOPANEL_VERSION.tar.gz minopaneld-$MINOPANEL_VERSION

rm -rf minopaneld-$MINOPANEL_VERSION

mv minopaneld-$MINOPANEL_VERSION.tar.gz SOURCES

rpmbuild --define "_topdir $(pwd)" --define "_debugsource_packages 0" --define "debug_package %{nil}" -bb SPECS/minopaneld.spec

mv RPMS/x86_64/minopaneld-$MINOPANEL_VERSION-1.x86_64.rpm ../../../dist/minopaneld-$DISTRIBUTION-$MINOPANEL_VERSION-1.x86_64.rpm