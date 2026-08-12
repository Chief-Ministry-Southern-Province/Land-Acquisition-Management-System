<?php

namespace App\Http\Controllers;

use App\Models\Departments;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json([
            'message' => 'Departments fetched successfully',
            'departments' => Departments::all(),
        ], 200);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $department = Departments::find($id, ['*']);

        if ($department) {
            return response()->json([
                'message' => 'Department fetched successfully',
                'department' => $department,
            ], 200);
        } else {
            return response()->json([
                'message' => 'Department not found',
            ], 404);
        }
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'department_name' => 'required|string|max:255|unique:departments,department_name',
            'dep_code' => 'required|string|max:255|unique:departments,dep_code',
            'dep_address' => 'nullable|string|max:255',
            'dep_head' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:departments,email',
            'phone' => 'required|string|max:255|unique:departments,phone',
            'staff' => 'sometimes|integer|min:0',
            'status' => 'sometimes',
        ]);

        if (isset($validated['status'])) {
            $validated['status'] = in_array($validated['status'], ['active', '1', 'true', true, 1], true);
        }

        $department = Departments::create($validated);

        return response()->json([
            'message' => 'Department created successfully',
            'department' => $department,
        ], 201);
    }

    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'department_name' => 'required|string|max:255|unique:departments,department_name,'.$id,
            'dep_code' => 'required|string|max:255|unique:departments,dep_code,'.$id,
            'dep_address' => 'nullable|string|max:255',
            'dep_head' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:departments,email,'.$id,
            'phone' => 'required|string|max:255|unique:departments,phone,'.$id,
            'staff' => 'sometimes|integer|min:0',
            'status' => 'sometimes',
        ]);

        /** @var Departments|null $department */
        $department = Departments::find($id, ['*']);

        if (! $department) {
            return response()->json([
                'message' => 'Department not found',
            ], 404);
        }

        if (isset($validated['status'])) {
            $validated['status'] = in_array($validated['status'], ['active', '1', 'true', true, 1], true);
        }

        $department->update($validated);

        return response()->json([
            'message' => 'Department updated successfully',
            'department' => $department,
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        /** @var Departments|null $department */
        $department = Departments::find($id, ['*']);

        if (! $department) {
            return response()->json([
                'message' => 'Department not found',
            ], 404);
        }

        $department->delete($id);

        return response()->json([
            'message' => 'Department deleted successfully',
        ], 204);
    }
}

/**
 * Show the form for editing the specified resource.
 */
// public function edit(string $id)
// {
//     //
// }

/**
 * Update the specified resource in storage.
 */

/**
 * Show the form for creating a new resource.
 */
// public function create()
// {
//     //
// }

/**
 * Store a newly created resource in storage.
 */
