#!/usr/bin/env bash

type node &> /dev/null
status=$?

if [ "$status" != 0 ]; then
    echo "NodeJS wasnt found in \$PATH!"
    echo "Aborting..."
    exit 1
fi

echo "Downloading Installer..."
curl -L -o /tmp/minopanel-installer.cjs https://github.com/Delfi-CH/minopanel/releases/download/rolling/minopanel-installer.cjs &> /dev/null
clear 
node /tmp/minopanel-installer.cjs