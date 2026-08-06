<?php

namespace App\Http\Controllers;

use App\Models\LandSurvey;
use Illuminate\Http\Request;

class LandSurveyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = LandSurvey::with(['landParcel', 'document']);

        if ($request->has('land_parcel_id')) {
            $query->where('land_parcel_id', $request->input('land_parcel_id'));
        }

        return response()->json([
            'message' => 'Land surveys fetched successfully',
            'land_surveys' => $query->get(),
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'land_parcel_id' => 'required|exists:land_parcels,id',
            'surveyor_name' => 'required|string|max:255',
            'survey_date' => 'required|date',
            'survey_ref_number' => 'required|string|unique:land_surveys,survey_ref_number',
            'survey_coordinates' => 'nullable|array',
            'surveyed_size_perches' => 'required|numeric|min:0',
            'status' => 'nullable|string|in:pending,completed',
            'document_id' => 'required|exists:documents,id',
            'remarks' => 'nullable|string',
        ]);

        $validated['status'] = $validated['status'] ?? 'completed';

        $survey = LandSurvey::create($validated);

        return response()->json([
            'message' => 'Land survey registered successfully',
            'land_survey' => $survey,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $survey = LandSurvey::with(['landParcel', 'document'])->find($id);

        if (!$survey) {
            return response()->json([
                'message' => 'Land survey not found',
            ], 404);
        }

        return response()->json([
            'message' => 'Land survey fetched successfully',
            'land_survey' => $survey,
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $survey = LandSurvey::find($id);

        if (!$survey) {
            return response()->json([
                'message' => 'Land survey not found',
            ], 404);
        }

        $validated = $request->validate([
            'land_parcel_id' => 'required|exists:land_parcels,id',
            'surveyor_name' => 'required|string|max:255',
            'survey_date' => 'required|date',
            'survey_ref_number' => 'required|string|unique:land_surveys,survey_ref_number,' . $id,
            'survey_coordinates' => 'nullable|array',
            'surveyed_size_perches' => 'required|numeric|min:0',
            'status' => 'nullable|string|in:pending,completed',
            'document_id' => 'required|exists:documents,id',
            'remarks' => 'nullable|string',
        ]);

        $survey->update($validated);

        return response()->json([
            'message' => 'Land survey updated successfully',
            'land_survey' => $survey,
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $survey = LandSurvey::find($id);

        if (!$survey) {
            return response()->json([
                'message' => 'Land survey not found',
            ], 404);
        }

        $survey->delete();

        return response()->json([
            'message' => 'Land survey deleted successfully',
        ], 200);
    }
}
