<?php

namespace App\Services;

use App\Models\Voucher;
use App\Models\VoucherUsage;
use Illuminate\Support\Arr;
use Illuminate\Validation\ValidationException;

class VoucherService
{
    public function validateForTransaction(?string $voucherCode, array $context): array
    {
        $code = strtoupper(trim((string) $voucherCode));
        if ($code === '') {
            return [
                'voucher' => null,
                'discount_amount' => 0,
            ];
        }

        $voucher = Voucher::query()->with('eligibilities')->where('code', $code)->first();
        if (!$voucher) {
            throw ValidationException::withMessages([
                'voucher_code' => 'Kode voucher tidak ditemukan.',
            ]);
        }

        if (!$voucher->is_active) {
            throw ValidationException::withMessages([
                'voucher_code' => 'Voucher tidak aktif.',
            ]);
        }

        $now = now();
        if ($voucher->starts_at && $now->lt($voucher->starts_at)) {
            throw ValidationException::withMessages([
                'voucher_code' => 'Voucher belum memasuki periode aktif.',
            ]);
        }

        if ($voucher->ends_at && $now->gt($voucher->ends_at)) {
            throw ValidationException::withMessages([
                'voucher_code' => 'Voucher sudah kedaluwarsa.',
            ]);
        }

        if (!is_null($voucher->quota_total) && (int) $voucher->quota_used >= (int) $voucher->quota_total) {
            throw ValidationException::withMessages([
                'voucher_code' => 'Kuota voucher sudah habis.',
            ]);
        }

        $subtotal = max(0, (int) ($context['subtotal'] ?? 0));
        if ($subtotal <= 0) {
            throw ValidationException::withMessages([
                'voucher_code' => 'Voucher tidak dapat diterapkan pada transaksi kosong.',
            ]);
        }

        if ((int) $voucher->min_purchase > $subtotal) {
            throw ValidationException::withMessages([
                'voucher_code' => 'Minimal transaksi untuk voucher ini belum terpenuhi.',
            ]);
        }

        $partIds = $this->normalizeIntArray($context['part_ids'] ?? []);
        $partCategoryIds = $this->normalizeIntArray($context['part_category_ids'] ?? []);
        $serviceIds = $this->normalizeIntArray($context['service_ids'] ?? []);
        $serviceCategoryIds = $this->normalizeIntArray($context['service_category_ids'] ?? []);

        if ($voucher->scope === 'item_part' && empty($partIds)) {
            throw ValidationException::withMessages([
                'voucher_code' => 'Voucher ini hanya berlaku untuk item sparepart.',
            ]);
        }

        if ($voucher->scope === 'item_service' && empty($serviceIds)) {
            throw ValidationException::withMessages([
                'voucher_code' => 'Voucher ini hanya berlaku untuk item layanan.',
            ]);
        }

        if (!$this->isEligibilityMatched($voucher, $partIds, $partCategoryIds, $serviceIds, $serviceCategoryIds)) {
            throw ValidationException::withMessages([
                'voucher_code' => 'Voucher tidak memenuhi kriteria item/kategori pada transaksi ini.',
            ]);
        }

        $customerId = isset($context['customer_id']) ? (int) $context['customer_id'] : null;
        if ($voucher->limit_per_customer && $voucher->limit_per_customer > 0 && $customerId) {
            $usageCount = VoucherUsage::query()
                ->where('voucher_id', $voucher->id)
                ->where('customer_id', $customerId)
                ->count();

            if ($usageCount >= (int) $voucher->limit_per_customer) {
                throw ValidationException::withMessages([
                    'voucher_code' => 'Batas penggunaan voucher untuk pelanggan ini sudah tercapai.',
                ]);
            }
        }

        $transactionDiscountType = (string) ($context['transaction_discount_type'] ?? 'none');
        $transactionDiscountValue = (float) ($context['transaction_discount_value'] ?? 0);
        if (!$voucher->can_combine_with_discount && $transactionDiscountType !== 'none' && $transactionDiscountValue > 0) {
            throw ValidationException::withMessages([
                'voucher_code' => 'Voucher ini tidak bisa digabung dengan diskon transaksi manual.',
            ]);
        }

        $discountAmount = $this->calculateDiscountAmount($voucher, $subtotal);

        return [
            'voucher' => $voucher,
            'discount_amount' => $discountAmount,
        ];
    }

    public function markUsed(Voucher $voucher, string $sourceType, int $sourceId, ?int $customerId, int $discountAmount, array $metadata = []): void
    {
        $this->clearUsageBySource($sourceType, $sourceId);

        VoucherUsage::query()->create([
            'voucher_id' => $voucher->id,
            'customer_id' => $customerId,
            'source_type' => $sourceType,
            'source_id' => $sourceId,
            'discount_amount' => max(0, $discountAmount),
            'used_at' => now(),
            'metadata' => $metadata,
        ]);

        $this->syncQuotaUsed($voucher->id);
    }

    public function clearUsageBySource(string $sourceType, int $sourceId): void
    {
        $existing = VoucherUsage::query()
            ->where('source_type', $sourceType)
            ->where('source_id', $sourceId)
            ->first();

        if (!$existing) {
            return;
        }

        $voucherId = (int) $existing->voucher_id;
        $existing->delete();
        $this->syncQuotaUsed($voucherId);
    }

    private function syncQuotaUsed(int $voucherId): void
    {
        $used = VoucherUsage::query()->where('voucher_id', $voucherId)->count();
        Voucher::query()->where('id', $voucherId)->update(['quota_used' => $used]);
    }

    private function calculateDiscountAmount(Voucher $voucher, int $subtotal): int
    {
        if ($subtotal <= 0) {
            return 0;
        }

        $discountAmount = 0;
        if ($voucher->discount_type === 'percent') {
            $discountAmount = (int) round($subtotal * ((float) $voucher->discount_value / 100));
        } else {
            $discountAmount = (int) round((float) $voucher->discount_value);
        }

        if (!is_null($voucher->max_discount)) {
            $discountAmount = min($discountAmount, (int) $voucher->max_discount);
        }

        return max(0, min($subtotal, $discountAmount));
    }

    private function isEligibilityMatched(Voucher $voucher, array $partIds, array $partCategoryIds, array $serviceIds, array $serviceCategoryIds): bool
    {
        if ($voucher->eligibilities->isEmpty()) {
            return true;
        }

        $partEligible = $voucher->eligibilities
            ->whereIn('eligible_type', ['part', 'part_category'])
            ->contains(function ($row) use ($partIds, $partCategoryIds) {
                if ($row->eligible_type === 'part') {
                    return in_array((int) $row->eligible_id, $partIds, true);
                }

                if ($row->eligible_type === 'part_category') {
                    return in_array((int) $row->eligible_id, $partCategoryIds, true);
                }

                return false;
            });

        $serviceEligible = $voucher->eligibilities
            ->whereIn('eligible_type', ['service', 'service_category'])
            ->contains(function ($row) use ($serviceIds, $serviceCategoryIds) {
                if ($row->eligible_type === 'service') {
                    return in_array((int) $row->eligible_id, $serviceIds, true);
                }

                if ($row->eligible_type === 'service_category') {
                    return in_array((int) $row->eligible_id, $serviceCategoryIds, true);
                }

                return false;
            });

        if ($voucher->scope === 'item_part') {
            return $partEligible;
        }

        if ($voucher->scope === 'item_service') {
            return $serviceEligible;
        }

        return $partEligible || $serviceEligible;
    }

    private function normalizeIntArray($value): array
    {
        return collect(Arr::wrap($value))
            ->map(fn ($id) => (int) $id)
            ->filter(fn ($id) => $id > 0)
            ->unique()
            ->values()
            ->all();
    }
}
