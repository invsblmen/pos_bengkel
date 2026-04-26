<?php

require __DIR__ . '/../vendor/autoload.php';

try {
    $m = new App\Services\Import\WorkshopImportManager();
    $s = $m->buildTemplate('mechanics');
    echo get_class($s) . PHP_EOL;
} catch (Throwable $e) {
    echo 'ERROR: ' . $e->getMessage() . PHP_EOL;
}
