<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\User;

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
        $user = User::find($id, ['*']);

        if (! $user) {
            return response()->json([
                'message' => 'User not found',
            ], 404);
        }

        $user->delete($id);
        return response()->json([
            'message' => 'User deleted successfully',
        ], 204);
    }

    /*
    * Edit user
    */
    public function updateUser(string $id, Request $request)
    {
        /** @var User|null $user */
        $user = User::find($id, ['*']);

        if (! $user) {
            return response()->json([
                'message' => 'User not found',
            ], 404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|max:255|unique:users,email,' . $id,
            'role_id' => 'required|integer',
            'department_id' => 'required|integer',
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'User updated successfully',
            'user' => $user,
        ], 200);
    }
}
