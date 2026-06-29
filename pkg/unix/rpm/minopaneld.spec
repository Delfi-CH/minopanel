Name:           minopaneld
Version:        0.0.1
Release:        1%{?dist}
Summary:        A simple hello world script
BuildArch:      noarch

License:        AGPL
Source0:        %{name}-%{version}.tar.gz

Requires:       bash nodejs

%description
A demo RPM build

%prep
%setup -q

%install
rm -rf $RPM_BUILD_ROOT
mkdir -p $RPM_BUILD_ROOT/%{_bindir}
cp %{name}.sh $RPM_BUILD_ROOT/%{_bindir}

%clean
rm -rf $RPM_BUILD_ROOT

%files
%{_bindir}/%{name}.sh

%changelog
* Sun Nov  18 2020 Valentin Bajrami <valentin.bajrami@slimmer.ai> - 0.0.1
- First version being packaged