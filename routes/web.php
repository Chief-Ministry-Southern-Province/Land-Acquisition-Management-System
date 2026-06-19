<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return auth()->check()
        ? redirect()->route('dashboard')
        : redirect()->route('login');
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Projects
    Route::get('/projects', function () {
        return Inertia::render('projects/ProjectList');
    })->name('projects.index');

    Route::get('/projects/new', function () {
        return Inertia::render('projects/AddProject');
    })->name('projects.create');

    Route::get('/projects/{id}', function (string $id) {
        return Inertia::render('projects/ProjectDetails', ['id' => $id]);
    })->name('projects.show');

    // Land Parcels
    Route::get('/land-parcels', function () {
        return Inertia::render('land_parcels/LandParcelList');
    })->name('land-parcels.index');

    Route::get('/land-parcels/new', function () {
        return Inertia::render('land_parcels/AddLandParcel');
    })->name('land-parcels.create');

    Route::get('/land-parcels/{id}', function (string $id) {
        return Inertia::render('land_parcels/LandParcelDetails', ['id' => $id]);
    })->name('land-parcels.show');

    // Land Owners
    Route::get('/land-owners', function () {
        return Inertia::render('land_owners/LandOwnerList');
    })->name('land-owners.index');

    Route::get('/land-owners/{id}', function (string $id) {
        return Inertia::render('land_owners/LandOwnerDetails', ['id' => $id]);
    })->name('land-owners.show');

    // Compensation
    Route::get('/compensation', function () {
        return Inertia::render('compensation/CompensationDashboard');
    })->name('compensation.index');

    Route::get('/compensation/calculate', function () {
        return Inertia::render('compensation/CalculateCompensation');
    })->name('compensation.calculate');

    Route::get('/compensation/payments', function () {
        return Inertia::render('compensation/ViewAllPayments');
    })->name('compensation.payments');

    // Acquisition Workflow
    Route::get('/acquisition-workflow', function () {
        return Inertia::render('AcquisitionWorkflow');
    })->name('acquisition-workflow.index');

    // Documents
    Route::get('/documents', function () {
        return Inertia::render('DocumentList');
    })->name('documents.index');

    // GIS Maps
    Route::get('/gis-maps', function () {
        return Inertia::render('GisMapList');
    })->name('gis-maps.index');

    // Approval Workflow
    Route::get('/approval-workflow', function () {
        return Inertia::render('ApprovalWorkflow');
    })->name('approval-workflow.index');

    // Reports
    Route::get('/reports', function () {
        return Inertia::render('Reports');
    })->name('reports.index');

    // User Management
    Route::get('/user-management', function () {
        return Inertia::render('admin/UserManagement');
    })->name('user-management.index');

    Route::get('/user-management/add', function () {
        return Inertia::render('admin/AddUserForm');
    })->name('user-management/add');

    // Audit Log
    Route::get('/audit-log', function () {
        return Inertia::render('AuditLog');
    })->name('audit-log.index');

    // Notifications
    Route::get('/notifications', function () {
        return Inertia::render('Notifications');
    })->name('notifications.index');

    // Settings
    Route::get('/settings', function () {
        return Inertia::render('Settings');
    })->name('settings.index');
});

Route::get('/lang/{locale}', function (string $locale) {
    if (in_array($locale, ['en', 'si'])) {
        session(['locale' => $locale]);
        app()->setLocale($locale);
    }

    return redirect()->back();
})->name('lang.switch');

require __DIR__.'/auth.php';
