<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\AuditLogService;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /*
    * Get all users
    */
    public function getAllUsers(): JsonResponse
    {
        $users = User::with(['role', 'department'])->get();

        return response()->json([
            'message' => 'Users fetched successfully',
            'users' => $users,
        ], 200);
    }

    /*
    * Delete users
    */
    public function deleteUser(string $id)
    {
        /** @var User|null $user */
        $user = User::find($id);

        if (! $user) {
            return response()->json([
                'message' => 'User not found',
            ], 404);
        }

        $admin = auth()->user();
        $userName = $user->name;

        try {
            $user->tokens()->delete();
            $user->delete();
            $detail = "Deleted user: {$userName}";
        } catch (QueryException $e) {
            // Foreign key constraint prevents deletion; deactivate user instead
            $user->update(['status' => 'inactive']);
            $user->tokens()->delete();
            $detail = "Deactivated user due to existing records: {$userName}";
        }

        if ($admin) {
            AuditLogService::log($admin->id, $admin->name, 'Delete', 'User Management', $detail);
        }

        return response()->json([
            'message' => 'User deleted successfully',
        ], 200);
    }

    /*
    * Edit user
    */
    public function updateUser(string $id, Request $request)
    {
        /** @var User|null $user */
        $user = User::find($id);

        if (! $user) {
            return response()->json([
                'message' => 'User not found',
            ], 404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|max:255|unique:users,email,'.$id,
            'phone' => 'nullable|string|max:255',
            'notification_preference' => 'nullable|string|in:email,sms,both,none',
            'role_id' => 'required|integer',
            'department_id' => 'required|integer',
            'status' => 'nullable|string|in:active,inactive,Active,Inactive',
        ]);

        if (isset($validated['status'])) {
            $validated['status'] = strtolower($validated['status']);
            if ($validated['status'] === 'inactive') {
                $user->tokens()->delete();
            }
        }

        $user->update($validated);

        if ($admin = auth()->user()) {
            AuditLogService::log($admin->id, $admin->name, 'Update', 'User Management', "Updated user details for {$user->name}");
        }

        return response()->json([
            'message' => 'User updated successfully',
            'user' => $user->fresh(['role', 'department']),
        ], 200);
    }
}
