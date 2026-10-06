<?php

namespace ESNStudios\ESNOfficialTheme\Providers;

use Filament\Support\Assets\Css;
use Filament\Support\Facades\FilamentAsset;
use Illuminate\Support\ServiceProvider;

class ESNOfficialThemePluginProvider extends ServiceProvider
{
    public function register(): void
    {
    }

    public function boot(): void
    {
        FilamentAsset::register([
            Css::make('esn-official-style', __DIR__ . '/../../resources/css/theme.css'),
        ], package: 'esn-official-theme');
    }
}
