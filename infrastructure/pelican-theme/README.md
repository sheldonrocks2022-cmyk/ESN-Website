# ESN Official Theme for Pelican
Built for Pelican 1.0.0-beta38 / Filament, based on the real ESN website's `src/styles.css` color palette and surface patterns. This is a first styling pass, not a wholesale replacement of Pelican.
## Scope
The CSS changes only presentation: dark radial background, glass cards, primary action gradient, blue/cyan/violet accents, typography, sidebar, dashboard, login and server controls. Authentication, role permissions, server console, file manager and Filament routes remain Pelican's. It is safe to test on the current node, but **backup first**. Review layout on mobile and desktop before customer use.
## Installation on the existing Pelican VPS
1. Create the theme using `php artisan p:plugin:make`, as already done.
2. Stage from this repository (the helper downloads only the 3 theme files into the existing plugin and first saves a backup):
```bash
curl -fsSL https://raw.githubusercontent.com/sheldonrocks2022-cmyk/ESN-Website/main/infrastructure/pelican-theme/stage.sh -o /tmp/esn-theme-stage.sh
bash /tmp/esn-theme-stage.sh
```
3. Run `cd /var/www/pelican && php artisan p:plugin:install` and select `ESN Official Theme`.
4. Run `php artisan filament:assets && php artisan optimize:clear`, then verify the login, dashboard and an account with no admin permission.
5. If needed, use the backup directory printed by the script, then clear caches/publish assets again.
Do not paste keys, env files or authorization tokens into support screenshots. Do not claim live operation until these steps are verified.
