<?php

use Illuminate\Support\Facades\Route;

Route::get('/test-permissions', function () {
    if (!auth()->check()) {
        return 'User not authenticated';
    }

    $user = auth()->user();
    $permissions = $user->getAllPermissions()->pluck('name');

    return [
        'user' => $user->name,
        'role' => $user->roles->pluck('name'),
        'permissions_count' => $permissions->count(),
        'permissions' => $permissions->sort()->values(),
    ];
})->middleware('auth');
