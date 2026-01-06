# Routes Tambahan untuk POS Bengkel Motor

Tambahkan routes berikut ke dalam file `routes/web.php` di dalam group `Route::group(['prefix' => 'dashboard', 'middleware' => ['auth']])`

Letakkan setelah route `customers` dan sebelum route `mechanics management`:

```php
    // Service Categories
    Route::resource('service-categories', \App\Http\Controllers\Apps\ServiceCategoryController::class)
        ->middlewareFor(['index', 'show'], 'permission:service-categories-access')
        ->middlewareFor(['create', 'store'], 'permission:service-categories-create')
        ->middlewareFor(['edit', 'update'], 'permission:service-categories-edit')
        ->middlewareFor('destroy', 'permission:service-categories-delete');
    
    // Part Categories
    Route::resource('part-categories', \App\Http\Controllers\Apps\PartCategoryController::class)
        ->middlewareFor(['index', 'show'], 'permission:part-categories-access')
        ->middlewareFor(['create', 'store'], 'permission:part-categories-create')
        ->middlewareFor(['edit', 'update'], 'permission:part-categories-edit')
        ->middlewareFor('destroy', 'permission:part-categories-delete');
    
    // Services Management
    Route::resource('services', \App\Http\Controllers\Apps\ServiceController::class)
        ->middlewareFor(['index', 'show'], 'permission:services-access')
        ->middlewareFor(['create', 'store'], 'permission:services-create')
        ->middlewareFor(['edit', 'update'], 'permission:services-edit')
        ->middlewareFor('destroy', 'permission:services-delete');
```

## Tambahan Use Statements

Tambahkan juga di bagian atas file (setelah use statements yang ada):

```php
use App\Http\Controllers\Apps\ServiceCategoryController;
use App\Http\Controllers\Apps\PartCategoryController;
use App\Http\Controllers\Apps\ServiceController;
```

## Lokasi Tepat

Insert setelah baris ini:
```php
    Route::resource('customers', CustomerController::class)
        ->middlewareFor(['index', 'show'], 'permission:customers-access')
        ->middlewareFor(['create', 'store'], 'permission:customers-create')
        ->middlewareFor(['edit', 'update'], 'permission:customers-edit')
        ->middlewareFor('destroy', 'permission:customers-delete');
```

Dan sebelum baris ini:
```php
    // mechanics management
    Route::get('/mechanics', ...
```
