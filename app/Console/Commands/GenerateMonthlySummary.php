<?php

namespace App\Console\Commands;

use App\Services\MonthlySummaryService;
use Illuminate\Console\Command;

class GenerateMonthlySummary extends Command
{
    protected $signature = 'summary:generate';

    protected $description =
        'Generate monthly passenger summaries';

    public function handle(
        MonthlySummaryService $service
    ) {

        $currentYear = now()->year;
        $currentMonth = now()->month;

        for ($year = 2024; $year <= $currentYear; $year++) {

            $lastMonth = 12;

            if ($year == $currentYear) {
                $lastMonth = $currentMonth;
            }

            for ($month = 1; $month <= $lastMonth; $month++) {

                $service->generate(
                    $month,
                    $year
                );
            }
        }

        $this->info(
            'Monthly summary generation completed.'
        );

        return Command::SUCCESS;
    }
}
