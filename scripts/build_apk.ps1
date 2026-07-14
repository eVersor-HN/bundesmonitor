# Baut die Bundesmonitor-Android-APK (Debug) und installiert sie optional aufs
# per USB verbundene Testgeraet. Voraussetzung: Android SDK, JDK 21, Node.
#
#   powershell -ExecutionPolicy Bypass -File scripts\build_apk.ps1 [-Ip 192.168.x.x] [-Port 8000]
#
# Die -Ip ist die LAN-Adresse des PCs, unter der die API laeuft. Sie wird als
# Standard in die App gebaut und ist spaeter in den Einstellungen aenderbar.
param([string]$Ip, [int]$Port = 8000)
$ErrorActionPreference = "Stop"
$repo = Split-Path -Parent $PSScriptRoot
Set-Location $repo

if (-not $Ip) {
    $Ip = (Get-NetIPAddress -AddressFamily IPv4 |
        Where-Object { $_.PrefixOrigin -in @('Dhcp', 'Manual') -and $_.IPAddress -notlike '169.*' -and $_.IPAddress -ne '127.0.0.1' } |
        Select-Object -First 1).IPAddress
}
$api = "http://${Ip}:${Port}"
Write-Host "API-Standardadresse der App: $api  (in der App unter Einstellungen aenderbar)" -ForegroundColor Cyan

# Toolchain
$sdk = if ($env:ANDROID_HOME) { $env:ANDROID_HOME } else { "$env:LOCALAPPDATA\Android\Sdk" }
if (-not (Test-Path $sdk)) { throw "Android SDK nicht gefunden ($sdk). Android Studio installieren." }
$env:ANDROID_HOME = $sdk; $env:ANDROID_SDK_ROOT = $sdk
if (-not $env:JAVA_HOME) {
    $java = (Get-Command java -ErrorAction SilentlyContinue).Source
    if ($java) { $env:JAVA_HOME = (Get-Item $java).Directory.Parent.FullName }
}

# 1) Statischen Web-Export mit der API-Adresse bauen
if (-not (Test-Path node_modules)) { npm install --no-audit --no-fund }
$env:BUILD_TARGET = "export"
$env:NEXT_PUBLIC_API_BASE_URL = $api
npm run build --workspace "@bundesmonitor/web"
$env:BUILD_TARGET = $null

# 2) Android-Projekt anlegen (einmalig) und Web-Assets synchronisieren
if (-not (Test-Path "android")) { npx cap add android } else { npx cap sync android }
$sdkFwd = $sdk -replace '\\', '/'
"sdk.dir=$sdkFwd" | Out-File -Encoding ascii "android\local.properties"

# 3) APK bauen
Set-Location "$repo\android"
.\gradlew.bat :app:assembleDebug --no-daemon --console=plain
Set-Location $repo
$apk = Join-Path $repo "android\app\build\outputs\apk\debug\app-debug.apk"
Write-Host "APK: $apk" -ForegroundColor Green

# 4) Installieren, wenn ein autorisiertes Geraet verbunden ist
$adb = Join-Path $sdk "platform-tools\adb.exe"
$devices = & $adb devices | Select-String "device$"
if ($devices) {
    & $adb install -r $apk
    Write-Host "Auf dem Geraet installiert. App 'Bundesmonitor' im App-Drawer oeffnen." -ForegroundColor Green
} else {
    Write-Host "Kein autorisiertes Geraet. Am Handy USB-Debugging bestaetigen, dann:" -ForegroundColor Yellow
    Write-Host "  adb install -r `"$apk`""
}
