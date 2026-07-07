<?php

namespace App\Http\Controllers;

use App\Models\AuditLogs;
use Illuminate\Http\Request;

class AuditLogsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = AuditLogs::with('user');

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->filled('module')) {
            $query->where('module', $request->module);
        }

        if ($request->filled('action')) {
            $query->where('action', $request->action);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $auditLogs = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'message' => 'Audit logs fetched successfully',
            'audit_logs' => $auditLogs,
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'action' => 'required|string|max:255',
            'detail' => 'required|string|max:255',
            'ip_address' => 'nullable|string|max:255',
        ]);

        $auditLog = AuditLogs::create($validated);

        return response()->json([
            'message' => 'Audit log created successfully',
            'audit_log' => $auditLog,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $auditLog = AuditLogs::find($id, ['*']);

        if ($auditLog) {
            return response()->json([
                'message' => 'Audit log fetched successfully',
                'audit_log' => $auditLog,
            ], 200);
        } else {
            return response()->json([
                'message' => 'Audit log not found',
            ], 404);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'action' => 'required|string|max:255',
            'detail' => 'required|string|max:255',
            'ip_address' => 'nullable|string|max:255',
        ]);

        $auditLog = AuditLogs::find($id, ['*']);

        if (! $auditLog) {
            return response()->json([
                'message' => 'Audit log not found',
            ], 404);
        }

        $auditLog->update($validated);

        return response()->json([
            'message' => 'Audit log updated successfully',
            'audit_log' => $auditLog,
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $auditLog = AuditLogs::find($id, ['*']);

        if (! $auditLog) {
            return response()->json([
                'message' => 'Audit log not found',
            ], 404);
        }

        $auditLog->delete();

        return response()->json([
            'message' => 'Audit log deleted successfully',
        ], 204);
    }
}
