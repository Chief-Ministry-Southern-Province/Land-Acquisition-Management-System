<?php

namespace App\Providers;

use App\Models\Compensation;
use App\Models\Departments;
use App\Models\Documents;
use App\Models\LandParcel;
use App\Models\Projects;
use App\Models\PropertyOwner;
use App\Models\Roles;
use App\Models\User;
use App\Observers\CompensationObserver;
use App\Observers\DepartmentsObserver;
use App\Observers\DocumentsObserver;
use App\Observers\LandParcelObserver;
use App\Observers\ProjectsObserver;
use App\Observers\PropertyOwnerObserver;
use App\Observers\RoleObserver;
use App\Observers\UserObserver;
use Carbon\CarbonImmutable;
use Illuminate\Support\DateFactory;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        User::observe(UserObserver::class);
        Departments::observe(DepartmentsObserver::class);
        Projects::observe(ProjectsObserver::class);
        LandParcel::observe(LandParcelObserver::class);
        PropertyOwner::observe(PropertyOwnerObserver::class);
        Compensation::observe(CompensationObserver::class);
        Documents::observe(DocumentsObserver::class);
        Roles::observe(RoleObserver::class);
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(
            fn (): ?Password => app()->isProduction()
                ? Password::min(12)
                    ->mixedCase()
                    ->letters()
                    ->numbers()
                    ->symbols()
                    ->uncompromised()
                : null,
        );
    }
}
