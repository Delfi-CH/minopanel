#!/usr/bin/env bash

mkdir -p BUILD BUILDROOT RPMS SRPMS SOURCES SPECS

mkdir -p minopaneld-0.0.1/dist

cp ../minopaneld minopaneld-0.0.1

cp ../../../dist/minopaneld.cjs minopaneld-0.0.1/dist

cp -r ../../../node_modules minopaneld-0.0.1

cp ../../../LICENSE minopaneld-0.0.1

cp ../../../README.md minopaneld-0.0.1

javac ../../../src/lib/jvm/SelfTest.java

cp ../../../src/lib/jvm/SelfTest.class minopaneld-0.0.1

tar czf minopaneld-0.0.1.tar.gz minopaneld-0.0.1

rm -rf minopaneld-0.0.1

mv minopaneld-0.0.1.tar.gz SOURCES

rpmbuild --define "_topdir $(pwd)" --define "_debugsource_packages 0" --define "debug_package %{nil}" -bb SPECS/minopaneld.spec