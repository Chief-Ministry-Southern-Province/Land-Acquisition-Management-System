<?php

namespace App\Http\Middleware;

use App\Services\AuditLogService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuditLogFailedCreations
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if ($request->isMethod('POST') && $response->getStatusCode() >= 400) {
            $route = $request->route();
            if ($route) {
                $action = $route->getActionName();
                $module = null;
                $actionName = 'Create';
                $detail = null;

                if (str_contains($action, 'AuthController@register')) {
                    $module = 'Authentication';
                    $actionName = 'Register';
                    $name = $request->input('name') ?? 'Unknown';
                    $detail = "Failed registration for user: {$name}";
                } elseif (str_contains($action, 'ProjectsController@store')) {
                    $module = 'Projects';
                    $name = $request->input('name') ?? 'Unknown';
                    $detail = "Failed to create project {$name}";
                } elseif (str_contains($action, 'LandParcelController@store')) {
                    $module = 'Land Parcels';
                    $parcelId = $request->input('parcel_id') ?? 'Unknown';
                    $detail = "Failed to create land parcel {$parcelId}";
                } elseif (str_contains($action, 'PropertyOwnerController@store')) {
                    $module = 'Property Owners';
                    $name = $request->input('name') ?? 'Unknown';
                    $detail = "Failed to create property owner {$name}";
                } elseif (str_contains($action, 'CompensationController@store')) {
                    $module = 'Compensation';
                    $compensationId = $request->input('compensation_id') ?? 'Unknown';
                    $detail = "Failed to create compensation {$compensationId}";
                } elseif (str_contains($action, 'DocumentsController@store')) {
                    $module = 'Documents';
                    $name = $request->input('name') ?? 'Unknown';
                    $detail = "Failed to create document {$name}";
                } elseif (str_contains($action, 'DepartmentController@store')) {
                    $module = 'Departments';
                    $depName = $request->input('department_name') ?? 'Unknown';
                    $detail = "Failed to create department {$depName}";
                } elseif (str_contains($action, 'RoleController@store')) {
                    $module = 'Roles';
                    $roleName = $request->input('role_name') ?? 'Unknown';
                    $detail = "Failed to create role {$roleName}";
                }

                if ($module && $user = auth()->user()) {
                    AuditLogService::log($user->id, $user->name, $actionName, $module, $detail);
                }
            }
        }

        return $response;
    }
}
