Name:           minoctl
Version:        0.0.1
Release:        1%{?dist}
Summary:        minopanel cli

License:        AGPL
BuildArch:      x86_64

Source0:        %{name}-%{version}.tar.gz

Requires:       bash
Requires:       nodejs

%description
minopanel cli

%prep
%setup -q

%install
rm -rf %{buildroot}

mkdir -p %{buildroot}%{_bindir}
mkdir -p %{buildroot}%{_localstatedir}/lib/minopanel/bin
mkdir -p %{buildroot}%{_sysconfdir}/minopanel.d
mkdir -p %{buildroot}%{_sysconfdir}/bash_completion.d
mkdir -p %{buildroot}%{_datadir}/zsh/site-functions
mkdir -p %{buildroot}%{_datadir}/fish/vendor_completions.d

install -m 755 minoctl \
    %{buildroot}%{_bindir}/minoctl

install -m 755 dist/minoctl.cjs \
    %{buildroot}%{_localstatedir}/lib/minopanel/bin/minoctl.cjs

# Generate completions
node dist/minoctl.cjs complete bash \
    > %{buildroot}%{_sysconfdir}/bash_completion.d/minoctl

sed -i \
's|requestComp=".*complete --|requestComp="minoctl complete --|g' \
%{buildroot}%{_sysconfdir}/bash_completion.d/minoctl

node dist/minoctl.cjs complete zsh \
    > %{buildroot}%{_datadir}/zsh/site-functions/_minoctl

sed -i \
's|requestComp=".*complete --|requestComp="minoctl complete --|g' \
%{buildroot}%{_datadir}/zsh/site-functions/_minoctl

node dist/minoctl.cjs complete fish \
    > %{buildroot}%{_datadir}/fish/vendor_completions.d/minoctl.fish

sed -i \
's|set -l requestComp ".*|set -l requestComp "minoctl complete -- (string join '\'' '\'' -- (string escape -- $args[2..-1])) $lastArg"|g' \
%{buildroot}%{_datadir}/fish/vendor_completions.d/minoctl.fish

chmod -R 777 %{buildroot}%{_localstatedir}/lib/minopanel
chmod -R 777 %{buildroot}%{_sysconfdir}/minopanel.d

%files
%license LICENSE*
%doc README*

%{_bindir}/minoctl
%dir %{_localstatedir}/lib/minopanel
%dir %{_localstatedir}/lib/minopanel/bin
%{_localstatedir}/lib/minopanel/bin/minoctl.cjs

%dir %{_sysconfdir}/minopanel.d

%{_sysconfdir}/bash_completion.d/minoctl
%{_datadir}/zsh/site-functions/_minoctl
%{_datadir}/fish/vendor_completions.d/minoctl.fish

%changelog
* Tue Jun 30 2026 Your Name <you@example.com> - 0.0.1-1
- Initial package