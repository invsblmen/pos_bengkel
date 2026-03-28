<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('warranty_registrations', function (Blueprint $table) {
            $table->id();

            $table->string('warrantable_type');
            $table->unsignedBigInteger('warrantable_id');

            $table->string('source_type');
            $table->unsignedBigInteger('source_id');
            $table->unsignedBigInteger('source_detail_id')->nullable();

            $table->foreignId('customer_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('vehicle_id')->nullable()->constrained()->nullOnDelete();

            $table->unsignedInteger('warranty_period_days')->default(0);
            $table->date('warranty_start_date');
            $table->date('warranty_end_date');

            $table->enum('status', ['active', 'expiring', 'expired', 'claimed', 'void'])->default('active');
            $table->timestamp('claimed_at')->nullable();
            $table->foreignId('claimed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('claim_notes')->nullable();
            $table->json('metadata')->nullable();

            $table->timestamps();

            $table->index(['warrantable_type', 'warrantable_id'], 'warranty_registrations_warrantable_idx');
            $table->index(['source_type', 'source_id'], 'warranty_registrations_source_idx');
            $table->index(['source_type', 'source_id', 'source_detail_id'], 'warranty_registrations_source_detail_idx');
            $table->index(['status', 'warranty_end_date'], 'warranty_registrations_status_end_idx');
            $table->index(['customer_id', 'warranty_end_date'], 'warranty_registrations_customer_end_idx');

            $table->unique(['source_type', 'source_id', 'source_detail_id'], 'warranty_registrations_source_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('warranty_registrations');
    }
};
