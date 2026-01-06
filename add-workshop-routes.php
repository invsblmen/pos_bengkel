#!/usr/bin/env php
<?php

/**
 * Script untuk menambahkan routes workshop ke web.php
 * Jalankan: php add-workshop-routes.php
 */

$webRoutesPath = __DIR__ . '/routes/web.php';

if (!file_exists($webRoutesPath)) {
    die("Error: File routes/web.php tidak ditemukan!\n");
}

$content = file_get_contents($webRoutesPath);

// 1. Tambahkan use statements jika belum ada
$useStatements = [
    "use App\\Http\\Controllers\\Apps\\ServiceCategoryController;",
    "use App\\Http\\Controllers\\Apps\\PartCategoryController;",
    "use App\\Http\\Controllers\\Apps\\ServiceController;",
];

$lastUseLine = "use Inertia\\Inertia;";
$useInsertPosition = strpos($content, $lastUseLine) + strlen($lastUseLine);

foreach ($useStatements as $use) {
    if (strpos($content, $use) === false) {
        $content = substr_replace($content, "\n" . $use, $useInsertPosition, 0);
        $useInsertPosition += strlen("\n" . $use);
    }
}

// 2. Tambahkan routes setelah Route::resource('customers'...)
$customerRouteEnd = "        ->middlewareFor('destroy', 'permission:customers-delete');";
$insertAfter = strpos($content, $customerRouteEnd);

if ($insertAfter === false) {
    die("Error: Tidak menemukan routes customers untuk insert point!\n");
}

$insertAfter += strlen($customerRouteEnd);

$newRoutes = <<<'ROUTES'


    // Service Categories
    Route::resource('service-categories', ServiceCategoryController::class)
        ->middlewareFor(['index', 'show'], 'permission:service-categories-access')
        ->middlewareFor(['create', 'store'], 'permission:service-categories-create')
        ->middlewareFor(['edit', 'update'], 'permission:service-categories-edit')
        ->middlewareFor('destroy', 'permission:service-categories-delete');

    // Part Categories
    Route::resource('part-categories', PartCategoryController::class)
        ->middlewareFor(['index', 'show'], 'permission:part-categories-access')
        ->middlewareFor(['create', 'store'], 'permission:part-categories-create')
        ->middlewareFor(['edit', 'update'], 'permission:part-categories-edit')
        ->middlewareFor('destroy', 'permission:part-categories-delete');

    // Services Management
    Route::resource('services', ServiceController::class)
        ->middlewareFor(['index', 'show'], 'permission:services-access')
        ->middlewareFor(['create', 'store'], 'permission:services-create')
        ->middlewareFor(['edit', 'update'], 'permission:services-edit')
        ->middlewareFor('destroy', 'permission:services-delete');
ROUTES;

// Cek apakah routes sudah ada
if (strpos($content, 'service-categories') !== false) {
    echo "Routes workshop sudah ada di web.php, skip...\n";
} else {
    $content = substr_replace($content, $newRoutes, $insertAfter, 0);
    file_put_contents($webRoutesPath, $content);
    echo "✓ Routes workshop berhasil ditambahkan ke web.php!\n";
}

echo "\nSelesai! Silakan cek routes/web.php\n";
