#!/usr/bin/env bash
set -euo pipefail

MINOPANEL_VERSION=0.0.1

TOPDIR="$(pwd)"

rm -rf BUILD BUILDROOT RPMS SRPMS SOURCES
mkdir -p BUILD BUILDROOT RPMS SRPMS SOURCES SPECS

PKGDIR="minopaneld-${MINOPANEL_VERSION}"

rm -rf "$PKGDIR"
mkdir "$PKGDIR"
mkdir "$PKGDIR/dist"

cp ../minopaneld "$PKGDIR/"
cp ../../../dist/minopaneld.cjs "$PKGDIR/dist/"

# Runtime dependencies only
pnpm prune --prod

cp -a ../../../node_modules "$PKGDIR/"

cp ../../../LICENSE "$PKGDIR/"
cp ../../../README.md "$PKGDIR/"

javac ../../../src/lib/jvm/SelfTest.java
cp ../../../src/lib/jvm/SelfTest.class "$PKGDIR/"

tar czf "${PKGDIR}.tar.gz" "$PKGDIR"

mv "${PKGDIR}.tar.gz" SOURCES/

rm -rf "$PKGDIR"

rpmbuild \
    --define "_topdir ${TOPDIR}" \
    --define "_debugsource_packages 0" \
    --define "debug_package %{nil}" \
    -bb SPECS/minopaneld.spec

mv RPMS/x86_64/minopaneld-${MINOPANEL_VERSION}-1.x86_64.rpm \
   ../../../dist/minopaneld-${DISTRIBUTION}-${MINOPANEL_VERSION}-1.x86_64.rpm