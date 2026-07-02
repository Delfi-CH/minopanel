Name:           minowebd
Version:        0.8.0
Release:        1
Summary:        minopanel webui
BuildArch:      x86_64

License:        AGPL
Source0:        %{name}-%{version}.tar.gz

Requires:       bash
Requires:       nodejs

%description
minopanel webui

%prep
%setup -q

%install
rm -rf %{buildroot}

mkdir -p %{buildroot}%{_bindir}
mkdir -p %{buildroot}%{_localstatedir}/lib/minopanel/bin
mkdir -p %{buildroot}%{_localstatedir}/lib/minopanel/web
mkdir -p %{buildroot}%{_sysconfdir}/minopanel.d

install -m 755 minowebd \
    %{buildroot}%{_bindir}/minowebd

install -m 755 dist/minowebd.cjs \
    %{buildroot}%{_localstatedir}/lib/minopanel/bin/minowebd.cjs

cp -r build/* %{buildroot}%{_localstatedir}/lib/minopanel/web

chmod -R 777 %{buildroot}%{_localstatedir}/lib/minopanel
chmod -R 777 %{buildroot}%{_sysconfdir}/minopanel.d

%files
%license LICENSE*
%doc README*

%{_bindir}/minowebd
%dir %{_localstatedir}/lib/minopanel
%dir %{_localstatedir}/lib/minopanel/bin
%dir %{_localstatedir}/lib/minopanel/web
%{_localstatedir}/lib/minopanel/bin/minowebd.cjs
%{_localstatedir}/lib/minopanel/web/*

%dir %{_sysconfdir}/minopanel.d

%changelog
* Tue Jun 30 2026 Delfi-CH <delfi@delfi.dev> - 0.8.0-1
- Initial package