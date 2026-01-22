<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('vehicles', function (Blueprint $table) {
            // Drop existing foreign key constraint first
            $table->dropForeign(['customer_id']);

            // Make customer_id required (not nullable)
            $table->unsignedBigInteger('customer_id')->nullable(false)->change();

            // Re-add foreign key constraint with proper cascade behavior
            $table->foreign('customer_id')->references('id')->on('customers')->onDelete('cascade');

            // Add STNK fields if they don't exist
            if (!Schema::hasColumn('vehicles', 'chassis_number')) {
                $table->string('chassis_number')->nullable()->comment('Nomor Rangka');
            }
            if (!Schema::hasColumn('vehicles', 'engine_number')) {
                $table->string('engine_number')->nullable()->comment('Nomor Mesin');
            }
            if (!Schema::hasColumn('vehicles', 'manufacture_year')) {
                $table->integer('manufacture_year')->nullable()->comment('Tahun Pembuatan');
            }
            if (!Schema::hasColumn('vehicles', 'registration_number')) {
                $table->string('registration_number')->nullable()->unique()->comment('Nomor Registrasi STNK');
            }
            if (!Schema::hasColumn('vehicles', 'registration_date')) {
                $table->date('registration_date')->nullable()->comment('Tanggal Registrasi');
            }
            if (!Schema::hasColumn('vehicles', 'stnk_expiry_date')) {
                $table->date('stnk_expiry_date')->nullable()->comment('Tanggal Berakhir STNK');
            }
            if (!Schema::hasColumn('vehicles', 'previous_owner')) {
                $table->string('previous_owner')->nullable()->comment('Pemilik Sebelumnya');
            }
        });
    }

    public function down()
    {
        Schema::table('vehicles', function (Blueprint $table) {
            // Revert customer_id to nullable
            $table->unsignedBigInteger('customer_id')->nullable()->change();

            // Drop STNK fields if they exist
            if (Schema::hasColumn('vehicles', 'chassis_number')) {
                $table->dropColumn('chassis_number');
            }
            if (Schema::hasColumn('vehicles', 'engine_number')) {
                $table->dropColumn('engine_number');
            }
            if (Schema::hasColumn('vehicles', 'manufacture_year')) {
                $table->dropColumn('manufacture_year');
            }
            if (Schema::hasColumn('vehicles', 'registration_number')) {
                $table->dropColumn('registration_number');
            }
            if (Schema::hasColumn('vehicles', 'registration_date')) {
                $table->dropColumn('registration_date');
            }
            if (Schema::hasColumn('vehicles', 'stnk_expiry_date')) {
                $table->dropColumn('stnk_expiry_date');
            }
            if (Schema::hasColumn('vehicles', 'previous_owner')) {
                $table->dropColumn('previous_owner');
            }
        });
    }
};
