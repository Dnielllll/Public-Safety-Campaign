<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Content;

class ContentController extends Controller
{
    /**
     * List content items with optional filters.
     */
    public function index(Request $request)
    {
        $query = Content::with(['campaign', 'creator']);

        if ($request->has('campaign_id')) {
            $query->where('campaign_id', $request->campaign_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        return response()->json($query->get());
    }

    /**
     * Create a new content item for a campaign.
     */
    public function store(Request $request)
    {
        $request->validate([
            'campaign_id'  => 'required|exists:campaigns,id',
            'type'         => 'required|in:text,image,video,audio,document',
            'title'        => 'required|string|max:255',
            'body'         => 'nullable|string',
            'media_url'    => 'nullable|string',
            'scheduled_at' => 'nullable|date',
        ]);

        $content = Content::create([
            'campaign_id'  => $request->campaign_id,
            'type'         => $request->type,
            'title'        => $request->title,
            'body'         => $request->body,
            'media_url'    => $request->media_url,
            'status'       => 'draft',
            'scheduled_at' => $request->scheduled_at,
            'created_by'   => $request->user()->id,
        ]);

        return response()->json($content->load(['campaign', 'creator']), 201);
    }

    /**
     * Show a single content item.
     */
    public function show($id)
    {
        $content = Content::with(['campaign', 'creator'])->findOrFail($id);
        return response()->json($content);
    }

    /**
     * Update a content item.
     */
    public function update(Request $request, $id)
    {
        $content = Content::findOrFail($id);

        $request->validate([
            'type'         => 'sometimes|in:text,image,video,audio,document',
            'title'        => 'sometimes|string|max:255',
            'body'         => 'nullable|string',
            'media_url'    => 'nullable|string',
            'status'       => 'sometimes|in:draft,published,archived',
            'scheduled_at' => 'nullable|date',
        ]);

        $content->update($request->all());

        return response()->json($content->load(['campaign', 'creator']));
    }

    /**
     * Delete a content item.
     */
    public function destroy($id)
    {
        $content = Content::findOrFail($id);
        $content->delete();
        return response()->json(['message' => 'Content deleted successfully']);
    }

    /**
     * Get all content for a specific campaign (route: /api/campaigns/{id}/contents).
     */
    public function byCampaign($campaignId)
    {
        $content = Content::with(['creator'])
            ->where('campaign_id', $campaignId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($content);
    }
}
