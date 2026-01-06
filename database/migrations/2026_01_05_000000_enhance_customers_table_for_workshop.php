<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('customers', function (Blueprint $table) {
            if (!Schema::hasColumn('customers', 'gender')) {
                $table->enum('gender', ['male', 'female'])->nullable()->after('name');
            }
            if (!Schema::hasColumn('customers', 'birth_date')) {
                $table->date('birth_date')->nullable()->after('gender');
            }
            // Tambah kolom phone atau rename no_telp -> phone bila sudah ada
            if (!Schema::hasColumn('customers', 'phone')) {
                if (Schema::hasColumn('customers', 'no_telp')) {
                    $table->renameColumn('no_telp', 'phone');
                } else {
                    $table->string('phone')->nullable()->after('name');
                }
            }
            if (!Schema::hasColumn('customers', 'identity_type')) {
                $table->enum('identity_type', ['KTP', 'SIM', 'Passport'])->nullable()->after('phone');
            }
            if (!Schema::hasColumn('customers', 'identity_number')) {
                $table->string('identity_number')->nullable()->unique()->after('identity_type');
            }
            if (!Schema::hasColumn('customers', 'city')) {
                $table->string('city')->nullable()->after('address');
            }
            if (!Schema::hasColumn('customers', 'postal_code')) {
                $table->string('postal_code')->nullable()->after('city');
            }
        });
    }

    public function down()
    {
        Schema::table('customers', function (Blueprint $table) {
            $columns_to_drop = [];
            if (Schema::hasColumn('customers', 'gender')) {
                $columns_to_drop[] = 'gender';
            }
            if (Schema::hasColumn('customers', 'birth_date')) {
                $columns_to_drop[] = 'birth_date';
            }
            if (Schema::hasColumn('customers', 'identity_type')) {
                $columns_to_drop[] = 'identity_type';
            }
            if (Schema::hasColumn('customers', 'identity_number')) {
                $table->dropUnique(['identity_number']);
                $columns_to_drop[] = 'identity_number';
            }
            if (Schema::hasColumn('customers', 'city')) {
                $columns_to_drop[] = 'city';
            }
            if (Schema::hasColumn('customers', 'postal_code')) {
                $columns_to_drop[] = 'postal_code';
            }

            // Kembalikan phone menjadi no_telp jika sebelumnya di-rename
            if (Schema::hasColumn('customers', 'phone') && !Schema::hasColumn('customers', 'no_telp')) {
                $table->renameColumn('phone', 'no_telp');
            }

            if (!empty($columns_to_drop)) {
                $table->dropColumn($columns_to_drop);
            }
        });
    }
};
