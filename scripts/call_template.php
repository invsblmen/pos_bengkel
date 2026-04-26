<?php

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

try {
    $controller = $app->make(App\Http\Controllers\Apps\DataImportController::class);
    $response = $controller->template('mechanics');

    echo get_class($response) . PHP_EOL;
    echo 'Status: ' . $response->getStatusCode() . PHP_EOL;

    foreach ($response->headers->all() as $key => $values) {
        foreach ($values as $value) {
            echo $key . ': ' . $value . PHP_EOL;
        }
    }
} catch (\Throwable $e) {
    echo 'ERROR: ' . $e->getMessage() . PHP_EOL;
}
