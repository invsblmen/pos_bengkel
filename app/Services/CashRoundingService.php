<?php

namespace App\Services;

class CashRoundingService
{
    public const DEFAULT_DENOMINATION = 100;

    public static function roundToCashDenomination(int|float $amount, int $denomination = self::DEFAULT_DENOMINATION): array
    {
        $amount = (int) round($amount);
        $denomination = max(1, $denomination);

        if ($amount <= 0) {
            return [
                'raw_total' => 0,
                'rounding_adjustment' => 0,
                'grand_total' => 0,
            ];
        }

        $roundedTotal = (int) (round($amount / $denomination) * $denomination);

        return [
            'raw_total' => $amount,
            'rounding_adjustment' => $roundedTotal - $amount,
            'grand_total' => $roundedTotal,
        ];
    }
}
