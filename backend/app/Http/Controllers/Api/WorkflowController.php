<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WorkflowController extends Controller
{
    protected string $supabaseUrl;
    protected string $supabaseKey;

    public function __construct()
    {
        $this->supabaseUrl = env('SUPABASE_URL', 'https://zuuwqrxmkeryzbcrlrai.supabase.co');
        $this->supabaseKey = env('SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1dXdxcnhta2VyeXpiY3JscmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3MDcxMzAsImV4cCI6MjEwMDI4MzEzMH0.CR289UHP5bxEavCMW1Z0h19Jrf6mm5YFC7NQ8RWkkm0');
    }

    /**
     * Get workflow metrics for the Process Monitoring Dashboard
     */
    public function getMetrics()
    {
        try {
            // Fetch campaign data from Supabase via REST API
            $response = Http::withoutVerifying()->withHeaders([
                'apikey' => $this->supabaseKey,
                'Authorization' => "Bearer {$this->supabaseKey}",
            ])->get("{$this->supabaseUrl}/rest/v1/campaigns?select=id,status,created_at,updated_at");

            if (!$response->successful()) {
                throw new \Exception("Supabase API error: {$response->status()}");
            }

            $campaigns = $response->json();

            Log::info('Fetched campaigns for workflow metrics', ['count' => count($campaigns)]);

            $totalCampaigns = count($campaigns);
            $pendingApproval = 0;
            $draftCount = 0;
            $approvedCount = 0;
            
            $now = now();
            $draftTimeout = 0;
            $reviewTimeout = 0;
            $totalApprovalTime = 0;
            $slaCompliantCount = 0;
            $count = 0;

            foreach ($campaigns as $campaign) {
                $status = $campaign['status'];
                $createdAt = $campaign['created_at'] ? new \Carbon\Carbon($campaign['created_at']) : null;
                $updatedAt = $campaign['updated_at'] ? new \Carbon\Carbon($campaign['updated_at']) : null;

                if ($status === 'pending') {
                    $pendingApproval++;
                    if ($createdAt && $createdAt->lt($now->subDays(3))) {
                        $reviewTimeout++;
                    }
                } elseif ($status === 'draft') {
                    $draftCount++;
                    if ($createdAt && $createdAt->lt($now->subDays(7))) {
                        $draftTimeout++;
                    }
                } elseif (in_array($status, ['approved', 'published'])) {
                    $approvedCount++;
                    if ($createdAt && $updatedAt) {
                        $hours = $createdAt->diffInHours($updatedAt);
                        $totalApprovalTime += $hours;
                        $count++;
                        if ($hours <= 48) {
                            $slaCompliantCount++;
                        }
                    }
                }
            }

            $avgApprovalTime = $count > 0 ? round($totalApprovalTime / $count, 1) : 0;
            $slaComplianceRate = $approvedCount > 0 ? round(($slaCompliantCount / $approvedCount) * 100, 1) : 0;

            $metrics = [
                'total_campaigns' => $totalCampaigns,
                'pending_approval' => $pendingApproval,
                'draft_timeout' => $draftTimeout,
                'review_timeout' => $reviewTimeout,
                'avg_approval_time_hours' => $avgApprovalTime,
                'sla_compliance_rate' => $slaComplianceRate,
            ];

            Log::info('Workflow metrics calculated', $metrics);

            return response()->json([
                'data' => $metrics
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch workflow metrics', ['error' => $e->getMessage()]);
            
            // Return mock data when database connection fails
            return response()->json([
                'data' => [
                    'total_campaigns' => 0,
                    'pending_approval' => 0,
                    'draft_timeout' => 0,
                    'review_timeout' => 0,
                    'avg_approval_time_hours' => 0,
                    'sla_compliance_rate' => 0,
                    'note' => 'Using mock data - database connection unavailable'
                ]
            ]);
        }
    }

    /**
     * Run escalation check to identify campaigns needing attention
     */
    public function runEscalationCheck()
    {
        try {
            // Fetch campaign data from Supabase via REST API
            $response = Http::withoutVerifying()->withHeaders([
                'apikey' => $this->supabaseKey,
                'Authorization' => "Bearer {$this->supabaseKey}",
            ])->get("{$this->supabaseUrl}/rest/v1/campaigns?select=id,title,status,created_at,updated_at");

            if (!$response->successful()) {
                throw new \Exception("Supabase API error: {$response->status()}");
            }

            $campaigns = $response->json();

            $escalations = [];
            $draftTimeouts = [];
            $reviewTimeouts = [];
            $slaViolations = [];
            $now = now();

            foreach ($campaigns as $campaign) {
                $status = $campaign['status'];
                $createdAt = $campaign['created_at'] ? new \Carbon\Carbon($campaign['created_at']) : null;
                $updatedAt = $campaign['updated_at'] ? new \Carbon\Carbon($campaign['updated_at']) : null;

                // Check for draft timeout (drafts older than 7 days)
                if ($status === 'draft' && $createdAt && $createdAt->lt($now->subDays(7))) {
                    $draftTimeouts[] = [
                        'id' => $campaign['id'],
                        'title' => $campaign['title'] ?? 'Untitled',
                        'status' => $status,
                        'created_at' => $campaign['created_at'],
                        'days_since_creation' => $createdAt->diffInDays($now),
                        'escalation_type' => 'Draft Timeout',
                        'severity' => 'high',
                        'action_required' => 'Review and either submit or delete draft'
                    ];
                }

                // Check for review timeout (pending approval older than 3 days)
                if ($status === 'pending' && $createdAt && $createdAt->lt($now->subDays(3))) {
                    $reviewTimeouts[] = [
                        'id' => $campaign['id'],
                        'title' => $campaign['title'] ?? 'Untitled',
                        'status' => $status,
                        'created_at' => $campaign['created_at'],
                        'days_since_creation' => $createdAt->diffInDays($now),
                        'escalation_type' => 'Review Timeout',
                        'severity' => 'high',
                        'action_required' => 'Approve or reject campaign immediately'
                    ];
                }

                // Check for SLA violations (approved campaigns that took longer than 48 hours)
                if (in_array($status, ['approved', 'published']) && $createdAt && $updatedAt) {
                    $hours = $createdAt->diffInHours($updatedAt);
                    if ($hours > 48) {
                        $slaViolations[] = [
                            'id' => $campaign['id'],
                            'title' => $campaign['title'] ?? 'Untitled',
                            'status' => $status,
                            'created_at' => $campaign['created_at'],
                            'updated_at' => $campaign['updated_at'],
                            'hours_to_approve' => $hours,
                            'escalation_type' => 'SLA Violation',
                            'severity' => 'medium',
                            'action_required' => 'Review approval process for delays'
                        ];
                    }
                }
            }

            $escalations = array_merge($draftTimeouts, $reviewTimeouts, $slaViolations);

            Log::info('Escalation check completed', ['count' => count($escalations)]);

            return response()->json([
                'data' => [
                    'total_escalations' => count($escalations),
                    'draft_timeouts' => count($draftTimeouts),
                    'review_timeouts' => count($reviewTimeouts),
                    'sla_violations' => count($slaViolations),
                    'escalations' => $escalations
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to run escalation check', ['error' => $e->getMessage()]);
            
            // Return mock data when database connection fails
            return response()->json([
                'data' => [
                    'total_escalations' => 0,
                    'draft_timeouts' => 0,
                    'review_timeouts' => 0,
                    'sla_violations' => 0,
                    'escalations' => [],
                    'note' => 'Using mock data - database connection unavailable'
                ]
            ]);
        }
    }
}
