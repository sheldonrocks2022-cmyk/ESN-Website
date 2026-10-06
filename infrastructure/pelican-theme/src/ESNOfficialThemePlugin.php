<?php

namespace ESNStudios\ESNOfficialTheme;

use Filament\Contracts\Plugin;
use Filament\Panel;
use Filament\Support\Colors\Color;

class ESNOfficialThemePlugin implements Plugin
{
    public function getId(): string
    {
        return 'esn-official-theme';
    }

    public function register(Panel $panel): void
    {
        // Preserve existing Pelican pages, actions, user permissions, and authentication.
        $panel->brandName('ESN HOSTING')
            ->colors([
                'primary' => Color::hex('#5aa7ff'),
                'info' => Color::hex('#62f1ff'),
                'secondary' => Color::hex('#9d7cff'),
                'success' => Color::hex('#6cecb0'),
                'warning' => Color::hex('#ffd179'),
                'danger' => Color::hex('#ff718b'),
            ]);
    }

    public function boot(Panel $panel): void
    {
        // CSS is loaded via Filament's supported asset pipeline in our service provider.
    }
}
