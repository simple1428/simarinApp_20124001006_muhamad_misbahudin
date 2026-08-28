<?php

namespace App\Console\Commands;

use App\Services\HoltWintersService;
use Illuminate\Console\Command;

class GenerateHoltForecast extends Command
{
    protected $signature =
        'forecast:holt';

    protected $description =
        'Generate Holt-Winters forecast';

    public function handle(
        HoltWintersService $service
    ) {

        $result =
        $service->generate();

        if ($result['status']) {

            $this->info(
                'Forecast berhasil dibuat'
            );

        } else {

            $this->error(
                'Forecast gagal'
            );

        }

    }
}
