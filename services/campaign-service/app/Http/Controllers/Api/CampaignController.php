<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Campaign;

class CampaignController extends Controller
{
    /**
     * List campaigns with optional filters.
     */
    public function index(Request $request)
    {
        $query = Campaign::with('creator');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('created_by')) {
            $query->where('created_by', $request->created_by);
        }

        return response()->json($query->get());
    }

    /**
     * Create a new campaign (status defaults to 'draft').
     */
    public function store(Request $request)
    {
        $request->validate([
            'title'           => 'required|string|max:255',
            'description'     => 'nullable|string',
            'start_date'      => 'required|date',
            'end_date'        => 'required|date|after:start_date',
            'target_audience' => 'required|string',
            'priority'        => 'sometimes|in:low,medium,high',
            'budget'          => 'nullable|numeric',
            'location'        => 'nullable|string',
            'expected_reach'  => 'nullable|integer',
        ]);

        $campaign = Campaign::create([
            'title'           => $request->title,
            'description'     => $request->description,
            'start_date'      => $request->start_date,
            'end_date'        => $request->end_date,
            'target_audience' => $request->target_audience,
            'status'          => 'draft',
            'created_by'      => $request->user()->id,
            'priority'        => $request->priority ?? 'medium',
            'budget'          => $request->budget,
            'location'        => $request->location,
            'expected_reach'  => $request->expected_reach,
        ]);

        return response()->json($campaign->load('creator'), 201);
    }

    /**
     * Show a single campaign with its creator and contents.
     */
    public function show($id)
    {
        $campaign = Campaign::with(['creator', 'contents'])->findOrFail($id);
        return response()->json($campaign);
    }

    /**
     * Update a campaign.
     */
    public function update(Request $request, $id)
    {
        $campaign = Campaign::findOrFail($id);

        $request->validate([
            'title'           => 'sometimes|string|max:255',
            'description'     => 'nullable|string',
            'start_date'      => 'sometimes|date',
            'end_date'        => 'sometimes|date|after:start_date',
            'target_audience' => 'sometimes|string',
            'status'          => 'sometimes|in:draft,pending,active,approved,published,completed,cancelled',
            'priority'        => 'sometimes|in:low,medium,high',
            'budget'          => 'nullable|numeric',
            'location'        => 'nullable|string',
            'expected_reach'  => 'nullable|integer',
        ]);

        $campaign->update($request->all());

        return response()->json($campaign->load('creator'));
    }

    /**
     * Delete a campaign.
     */
    public function destroy($id)
    {
        $campaign = Campaign::findOrFail($id);
        $campaign->delete();
        return response()->json(['message' => 'Campaign deleted successfully']);
    }

    /**
     * Get approved/published campaigns for distribution.
     */
    public function getApprovedCampaigns()
    {
        $campaigns = Campaign::whereIn('status', ['approved', 'published'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($campaigns);
    }

    /**
     * Get all resident phone numbers for bulk SMS distribution.
     * Calls the notification-service to handle the actual send.
     */
    public function getResidentPhoneNumbers()
    {
        $phoneNumbers = \DB::table('users')
            ->whereNotNull('phone')
            ->where('phone', '!=', '')
            ->pluck('phone')
            ->toArray();

        return response()->json([
            'phone_numbers' => $phoneNumbers,
            'total'         => count($phoneNumbers),
        ]);
    }
}
