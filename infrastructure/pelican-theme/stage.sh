#!/usr/bin/env bash
# Stage the ESN Official Theme in an existing Pelican installation.
# The script does not install/activate the theme, edit core files or expose credentials.
set -Eeuo pipefail
cd /var/www/pelican
theme='plugins/esn-official-theme'
test -f "$theme/plugin.json" || { echo 'ESN theme scaffold missing'; exit 1; }
base='https://raw.githubusercontent.com/sheldonrocks2022-cmyk/ESN-Website/main/infrastructure/pelican-theme'
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
curl --fail --location --silent --show-error --retry 3 "$base/src/ESNOfficialThemePlugin.php" -o "$tmp/theme.php"
curl --fail --location --silent --show-error --retry 3 "$base/src/Providers/ESNOfficialThemePluginProvider.php" -o "$tmp/provider.php"
curl --fail --location --silent --show-error --retry 3 "$base/resources/css/theme.css" -o "$tmp/theme.css"
php -l "$tmp/theme.php"
php -l "$tmp/provider.php"
grep -q 'fi-simple-main' "$tmp/theme.css" || { echo 'Stylesheet validation failed'; exit 1; }
backup="/root/esn-theme-backups/$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$backup" "$theme/resources/css"
cp -a "$theme/plugin.json" "$theme/src" "$backup/"
test ! -f "$theme/resources/css/theme.css" || cp -a "$theme/resources/css/theme.css" "$backup/theme.css"
install -m 0644 "$tmp/theme.php" "$theme/src/ESNOfficialThemePlugin.php"
install -m 0644 "$tmp/provider.php" "$theme/src/Providers/ESNOfficialThemePluginProvider.php"
install -m 0644 "$tmp/theme.css" "$theme/resources/css/theme.css"
echo 'ESN Official Theme files staged. Nothing activated yet.'
echo "Backup: $backup"
echo 'Next: install the theme from Pelican before publishing the assets.'
