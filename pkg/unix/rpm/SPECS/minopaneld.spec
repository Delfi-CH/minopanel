Name:           minopaneld
Version:        0.0.1
Release:        1
Summary:        minopanel server
BuildArch:      x86_64

License:        AGPL
Source0:        %{name}-%{version}.tar.gz

Requires:       bash
Requires:       nodejs

%description
minopanel server

%prep
%setup -q

%install
rm -rf %{buildroot}

mkdir -p %{buildroot}%{_bindir}
mkdir -p %{buildroot}%{_localstatedir}/lib/minopanel/bin
mkdir -p %{buildroot}%{_localstatedir}/lib/minopanel/bin/servers
mkdir -p %{buildroot}%{_localstatedir}/lib/minopanel/bin/java
mkdir -p %{buildroot}%{_localstatedir}/lib/minopanel/data/servers
mkdir -p %{buildroot}%{_localstatedir}/lib/minopanel/data/java
mkdir -p %{buildroot}%{_sysconfdir}/minopanel.d

install -m 755 minopaneld \
    %{buildroot}%{_bindir}/minopaneld

install -m 755 dist/minopaneld.cjs \
    %{buildroot}%{_localstatedir}/lib/minopanel/bin/minopaneld.cjs

cp SelfTest.class %{buildroot}%{_localstatedir}/lib/minopanel/data/java

cp -r node_modules %{buildroot}%{_localstatedir}/lib/minopanel/bin

chmod -R 777 %{buildroot}%{_localstatedir}/lib/minopanel
chmod -R 777 %{buildroot}%{_sysconfdir}/minopanel.d

%files
%license LICENSE*
%doc README*

%{_bindir}/minopaneld
%dir %{_localstatedir}/lib/minopanel
%{_localstatedir}/lib/minopanel/bin/*
%dir %{_localstatedir}/lib/minopanel/data/servers
%dir %{_localstatedir}/lib/minopanel/data/java
%{_localstatedir}/lib/minopanel/data/java/SelfTest.class

%dir %{_sysconfdir}/minopanel.d

%changelog
* Tue Jun 30 2026 Your Name <you@example.com> - 0.0.1-1
- Initial package