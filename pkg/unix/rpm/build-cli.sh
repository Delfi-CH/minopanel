#!/usr/bin/env bash

mkdir -p BUILD BUILDROOT RPMS SRPMS SOURCES SPECS

mkdir -p minoctl-0.0.1/dist

cp ../minoctl minoctl-0.0.1

cp ../../../dist/minoctl.cjs minoctl-0.0.1/dist

cp ../../../LICENSE minoctl-0.0.1

cp ../../../README.md minoctl-0.0.1

tar czf minoctl-0.0.1.tar.gz minoctl-0.0.1

mv minoctl-0.0.1.tar.gz SOURCES

rpmbuild --define "_topdir $(pwd)" --define "_debugsource_packages 0" --define "debug_package %{nil}" -bb SPECS/minoctl.spec