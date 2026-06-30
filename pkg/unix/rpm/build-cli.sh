#!/usr/bin/env bash

MINOPANEL_VERSION=0.0.1

mkdir -p BUILD BUILDROOT RPMS SRPMS SOURCES SPECS

mkdir -p minoctl-$MINOPANEL_VERSION/dist

cp ../minoctl minoctl-$MINOPANEL_VERSION

cp ../../../dist/minoctl.cjs minoctl-$MINOPANEL_VERSION/dist

cp ../../../LICENSE minoctl-$MINOPANEL_VERSION

cp ../../../README.md minoctl-$MINOPANEL_VERSION

tar czf minoctl-$MINOPANEL_VERSION.tar.gz minoctl-$MINOPANEL_VERSION

mv minoctl-$MINOPANEL_VERSION.tar.gz SOURCES

rpmbuild --define "_topdir $(pwd)" --define "_debugsource_packages 0" --define "debug_package %{nil}" -bb SPECS/minoctl.spec

mv RPMS/x86_64/minoctl-$MINOPANEL_VERSION-1.x86_64.rpm ../../../dist/minoctl-$DISTRIBUTION-$MINOPANEL_VERSION-1.x86_64.rpm