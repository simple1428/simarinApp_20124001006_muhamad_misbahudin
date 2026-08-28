<?php

namespace App\Console\Commands;

use App\Services\SeasonClassificationService;
use Illuminate\Console\Command;

class GenerateSeasonClassification extends Command
{
    protected $signature =
        'season:generate';

    protected $description =
        'Generate season classification';

    public function handle(
        SeasonClassificationService $service
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
            'Season berhasil dibuat'
        );

        $this->info(
            'Mean : '.
                round($result['mean'], 2)
        );

        $this->info(
            'Batas High : '.
                round($result['batas_atas'], 2)
        );

        $this->info(
            'Batas Low : '.
                round($result['batas_bawah'], 2)
        );
    }
}
