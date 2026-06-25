<?php

namespace App\Http\Controllers;

use App\Models\Roles;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json([
            'message' => 'Roles fetched successfully',
            'roles' => Roles::all(),
        ], 200);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $role = Roles::find($id, ['*']);

        if ($role) {
            return response()->json([
                'message' => 'Role fetched successfully',
                'role' => $role,
            ], 200);
        } else {
            return response()->json([
                'message' => 'Role not found',
            ], 404);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'role_name' => 'required|string|max:255|unique:roles',
            'description' => 'required|string|max:255',
        ]);

        $role = Roles::create($validated);

        return response()->json([
            'message' => 'Role created successfully',
            'role' => $role,
        ], 201);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'role_name' => 'required|string|max:255',
            'description' => 'required|string|max:255',
        ]);

        /** @var Roles|null $role */
        $role = Roles::find($id, ['*']);

        if (!$role) {
            return response()->json([
                'message' => 'Role not found',
            ], 404);
        }

        $role->update($validated);

        return response()->json([
            'message' => 'Role updated successfully',
            'role' => $role,
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        /** @var Roles|null $role */
        $role = Roles::find($id, ['*']);

        if (!$role) {
            return response()->json([
                'message' => 'Role not found',
            ], 404);
        }

        $role->delete($id);

        return response()->json([
            'message' => 'Role deleted successfully',
        ], 204);
    }


    /**
     * Show the form for creating a new resource.
     */
    // public function create()
    // {
    //     //
    // }

    /**
     * Show the form for editing the specified resource.
     */
    // public function edit(string $id)
    // {
    //     //
    // }
}
