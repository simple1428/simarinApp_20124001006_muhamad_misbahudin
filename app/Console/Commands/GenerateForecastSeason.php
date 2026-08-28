<?php

namespace App\Console\Commands;

use App\Services\ForecastSeasonService;
use Illuminate\Console\Command;

class GenerateForecastSeason extends Command
{
    protected $signature =
        'forecast:season';

    protected $description =
        'Generate forecast season';

    public function handle(
        ForecastSeasonService $service
    ) {

        $service->generate();

        $this->info(
            'Forecast season berhasil dibuat'
        );
    }
}
