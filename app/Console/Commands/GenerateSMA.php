<?php

namespace App\Console\Commands;

use App\Services\SmaService;
use Illuminate\Console\Command;

class GenerateSMA extends Command
{
    protected $signature =
        'sma:generate';

    protected $description =
        'Generate SMA 12 bulan';

    public function handle(
        SmaService $service
    ) {

        $result =
            $service->generate();

        if (! $result['status']) {

            $this->error(
                $result['message']
            );

            return;
        }

        $this->info(
            'SMA berhasil dibuat'
        );
    }
}
