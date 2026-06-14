<?php

use Illuminate\Support\Facades\Route;

Route::inertia('/', 'LoginScreen')->name('home');
Route::inertia('/dashboard', 'Dashboard')->name('dashboard');
Route::inertia('/settings', 'Settings')->name('settings');
Route::inertia('/notifications', 'Notifications')->name('notifications');
Route::inertia('/user-management', 'admin/UserManagement')->name('user-management');
Route::inertia('/audit-log', 'AuditLog')->name('audit-log');

// Land Parcels routes
Route::inertia('/land-parcels', 'land_parcels/LandParcelList')->name('land-parcels');
Route::inertia('/land-parcels/create', 'land_parcels/AddLandParcel')->name('add-land-parcel');
Route::inertia('/land-parcels/{id}', 'land_parcels/LandParcelDetails')->name('land-parcel-details');