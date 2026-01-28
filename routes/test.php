<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;

Route::get('/test-permissions', function () {
    if (!Auth::check()) {
        return 'User not authenticated';
    }

    $user = Auth::user();
    $permissions = $user->getAllPermissions()->pluck('name');

    return [
        'user' => $user->name,
        'role' => $user->roles->pluck('name'),
        'permissions_count' => $permissions->count(),
        'permissions' => $permissions->sort()->values(),
    ];
})->middleware('auth');
