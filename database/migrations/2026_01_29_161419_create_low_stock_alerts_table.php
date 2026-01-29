<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('low_stock_alerts', function (Blueprint $table) {
            $table->id();
                        $table->foreignId('part_id')->constrained('parts')->onDelete('cascade');
                        $table->integer('current_stock');
                        $table->integer('minimal_stock');
                        $table->boolean('is_read')->default(false);
            $table->timestamps();

                    // Prevent duplicate alerts for the same part
                    $table->unique('part_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('low_stock_alerts');
    }
};
