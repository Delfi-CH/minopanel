#!/usr/bin/env bash

mkdir -p BUILD BUILDROOT RPMS SRPMS SOURCES SPECS

mkdir -p minowebd-0.0.1/dist

mkdir -p minowebd-0.0.1/build

cp ../minowebd minowebd-0.0.1

cp ../../../dist/minowebd.cjs minowebd-0.0.1/dist

cp -r ../../../build/* minowebd-0.0.1/build

cp ../../../LICENSE minowebd-0.0.1

cp ../../../README.md minowebd-0.0.1
tar czf minowebd-0.0.1.tar.gz minowebd-0.0.1

mv minowebd-0.0.1.tar.gz SOURCES

rpmbuild --define "_topdir $(pwd)" --define "_debugsource_packages 0" --define "debug_package %{nil}" -bb SPECS/minowebd.spec

mv RPMS/x86_64/*.rpm ../../../dist