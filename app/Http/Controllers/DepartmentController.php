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
            'department_name' => 'required|string|max:255|unique:departments',
        ]);

        $department = Departments::create($validated);

        return response()->json([
            'message' => 'Department created successfully',
            'department' => $department,
        ], 201);
    }

    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'department_name' => 'required|string|max:255|unique:departments',
        ]);

        /** @var Departments|null $department */
        $department = Departments::find($id, ['*']);

        if (!$department) {
            return response()->json([
                'message' => 'Department not found',
            ], 404);
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

        if (!$department) {
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
