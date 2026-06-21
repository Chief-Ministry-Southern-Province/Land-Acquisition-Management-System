<?php

use Illuminate\Support\Facades\Route;

Route::get('/lang/{locale}', function ($locale) {
    if (in_array($locale, ['en', 'si'])) {
        session()->put('locale', $locale);
    }

    return redirect()->back();
})->name('lang.switch');

Route::inertia('/', 'LoginScreen')->name('home');
Route::inertia('/dashboard', 'Dashboard')->name('dashboard');
Route::inertia('/settings', 'Settings')->name('settings');
Route::inertia('/notifications', 'Notifications')->name('notifications');
Route::inertia('/user-management', 'admin/UserManagement')->name('user-management');
Route::inertia('/user-management/add', 'admin/AddUserForm')->name('user-management.add');
Route::inertia('/audit-log', 'AuditLog')->name('audit-log');

// Land Parcels routes
Route::inertia('/land-parcels', 'land_parcels/LandParcelList')->name('land-parcels');
Route::inertia('/land-parcels/create', 'land_parcels/AddLandParcel')->name('add-land-parcel');
Route::inertia('/land-parcels/{id}', 'land_parcels/LandParcelDetails')->name('land-parcel-details');

// Land Owners routes
Route::inertia('/land-owners', 'land_owners/LandOwnerList')->name('land-owners');
Route::inertia('/land-owners/{id}', 'land_owners/LandOwnerDetails')->name('land-owner-details');

// Documents routes
Route::inertia('/documents', 'DocumentList')->name('documents');

// GIS/Maps routes
Route::inertia('/gis-maps', 'GisMapList')->name('gis-maps');

// Reports routes
Route::inertia('/reports', 'Reports')->name('reports');

// Workflow routes
Route::inertia('/acquisition-workflow', 'AcquisitionWorkflow')->name('acquisition-workflow');
Route::inertia('/approval-workflow', 'ApprovalWorkflow')->name('approval-workflow');

// Projects routes
Route::inertia('/projects', 'projects/ProjectList')->name('projects');
Route::inertia('/projects/new', 'projects/AddProject')->name('add-project');
Route::inertia('/projects/{id}', 'projects/ProjectDetails')->name('project-details');

// Compensation routes
Route::inertia('/compensation', 'compensation/CompensationDashboard')->name('compensation-dashboard');
Route::inertia('/compensation/all', 'compensation/ViewAllPayments')->name('compensation-payments');
Route::inertia('/compensation/calculate', 'compensation/CalculateCompensation')->name('compensation-calculate');
