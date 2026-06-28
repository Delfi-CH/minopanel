if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "NodeJS wasn't found in `$PATH!"
    Write-Host "Aborting..."
    exit 1
}

Write-Host "Downloading Installer..."

$installerPath = Join-Path $env:TEMP "minopanel-installer.cjs"
$url = "https://github.com/Delfi-CH/minopanel/releases/download/rolling-nightly/minopanel-installer.cjs"

try {
    Invoke-WebRequest -Uri $url -OutFile $installerPath -UseBasicParsing
}
catch {
    Write-Host "Failed to download installer."
    Write-Host $_.Exception.Message
    exit 1
}

Clear-Host

& node $installerPath