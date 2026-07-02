Name:           minopaneld
Version:        0.8.0
Release:        1
Summary:        Minopanel server

License:        AGPL-3.0-or-later
Source0:        %{name}-%{version}.tar.gz

BuildArch:      x86_64

Requires:       bash
Requires:       nodejs
Requires:       java-1.8.0-openjdk

%global debug_package %{nil}
%global __brp_strip %{nil}

%description
Minopanel server daemon.

%prep
%autosetup

%build

%install
rm -rf %{buildroot}

install -d %{buildroot}%{_bindir}

install -d %{buildroot}%{_localstatedir}/lib/minopanel
install -d %{buildroot}%{_localstatedir}/lib/minopanel/bin
install -d %{buildroot}%{_localstatedir}/lib/minopanel/bin/servers
install -d %{buildroot}%{_localstatedir}/lib/minopanel/bin/java

install -d %{buildroot}%{_localstatedir}/lib/minopanel/data
install -d %{buildroot}%{_localstatedir}/lib/minopanel/data/java
install -d %{buildroot}%{_localstatedir}/lib/minopanel/data/servers

install -d %{buildroot}%{_sysconfdir}/minopanel.d

install -m755 minopaneld \
    %{buildroot}%{_bindir}/minopaneld

install -m644 SelfTest.class \
    %{buildroot}%{_localstatedir}/lib/minopanel/data/java/

install -m644 dist/minopaneld.cjs \
    %{buildroot}%{_localstatedir}/lib/minopanel/bin/

cp -a node_modules \
    %{buildroot}%{_localstatedir}/lib/minopanel/bin/

find %{buildroot}%{_localstatedir}/lib/minopanel -type d -exec chmod 755 {} \;
find %{buildroot}%{_localstatedir}/lib/minopanel -type f -exec chmod 644 {} \;

chmod 755 %{buildroot}%{_bindir}/minopaneld
chmod 644 %{buildroot}%{_localstatedir}/lib/minopanel/bin/minopaneld.cjs

%files
%license LICENSE
%doc README.md

%{_bindir}/minopaneld

%dir %{_localstatedir}/lib/minopanel
%dir %{_localstatedir}/lib/minopanel/bin
%dir %{_localstatedir}/lib/minopanel/bin/servers
%dir %{_localstatedir}/lib/minopanel/bin/java

%dir %{_localstatedir}/lib/minopanel/data
%dir %{_localstatedir}/lib/minopanel/data/java
%dir %{_localstatedir}/lib/minopanel/data/servers

%{_localstatedir}/lib/minopanel/bin/minopaneld.cjs
%{_localstatedir}/lib/minopanel/bin/node_modules
%{_localstatedir}/lib/minopanel/data/java/SelfTest.class

%dir %{_sysconfdir}/minopanel.d

%changelog
* Tue Jun 30 2026 Delfi-CH <delfi@delfi.dev> - 0.8.0-1
- Initial package