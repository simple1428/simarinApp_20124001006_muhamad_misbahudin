<?php

namespace App\Console\Commands;

use App\Services\SmaEvaluationService;
use Illuminate\Console\Command;

class GenerateSmaEvaluation extends Command
{
    protected $signature =
        ' sma:evaluate';

    protected $description =
        'Generate SMA evaluation';

    public function handle(
        SmaEvaluationService $service
    ) {

        $service->generate();

        $this->info(
            'Evaluasi SMA berhasil dibuat'
        );

    }
}
