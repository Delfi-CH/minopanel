#!/usr/bin/env bash

MINOPANEL_VERSION=0.0.1

mkdir -p BUILD BUILDROOT RPMS SRPMS SOURCES SPECS

mkdir -p minowebd-$MINOPANEL_VERSION/dist

mkdir -p minowebd-$MINOPANEL_VERSION/build

cp ../minowebd minowebd-$MINOPANEL_VERSION

cp ../../../dist/minowebd.cjs minowebd-$MINOPANEL_VERSION/dist

cp -r ../../../build/* minowebd-$MINOPANEL_VERSION/build

cp ../../../LICENSE minowebd-$MINOPANEL_VERSION

cp ../../../README.md minowebd-$MINOPANEL_VERSION
tar czf minowebd-$MINOPANEL_VERSION.tar.gz minowebd-$MINOPANEL_VERSION

mv minowebd-$MINOPANEL_VERSION.tar.gz SOURCES

rpmbuild --define "_topdir $(pwd)" --define "_debugsource_packages 0" --define "debug_package %{nil}" -bb SPECS/minowebd.spec

sleep 3s

mv RPMS/x86_64/minowebd-$MINOPANEL_VERSION-1.x86_64.rpm ../../../dist/minowebd-$DISTRIBUTION-$MINOPANEL_VERSION-1.x86_64.rpm