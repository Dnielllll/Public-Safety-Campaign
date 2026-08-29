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
        $this->supabaseKey = env('SUPABASE_ANON_KEY', '');
    }

    /**
     * Get workflow metrics for the Process Monitoring Dashboard.
     * Fetches campaign data from Supabase REST API and computes SLA metrics.
     */
    public function getMetrics()
    {
        try {
            $response = Http::withoutVerifying()->withHeaders([
                'apikey'        => $this->supabaseKey,
                'Authorization' => "Bearer {$this->supabaseKey}",
            ])->get("{$this->supabaseUrl}/rest/v1/campaigns?select=id,status,created_at,updated_at");

            if (!$response->successful()) {
                throw new \Exception("Supabase API error: {$response->status()}");
            }

            $campaigns = $response->json();
            $metrics   = $this->computeMetrics($campaigns);

            Log::info('Workflow metrics computed', $metrics);

            return response()->json(['data' => $metrics]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch workflow metrics', ['error' => $e->getMessage()]);

            return response()->json([
                'data' => $this->emptyMetrics('database connection unavailable'),
            ]);
        }
    }

    /**
     * Run escalation check to identify campaigns needing attention.
     */
    public function runEscalationCheck()
    {
        try {
            $response = Http::withoutVerifying()->withHeaders([
                'apikey'        => $this->supabaseKey,
                'Authorization' => "Bearer {$this->supabaseKey}",
            ])->get("{$this->supabaseUrl}/rest/v1/campaigns?select=id,title,status,created_at,updated_at");

            if (!$response->successful()) {
                throw new \Exception("Supabase API error: {$response->status()}");
            }

            $campaigns    = $response->json();
            $escalations  = $this->computeEscalations($campaigns);

            Log::info('Escalation check completed', ['count' => $escalations['total_escalations']]);

            return response()->json(['data' => $escalations]);
        } catch (\Exception $e) {
            Log::error('Failed to run escalation check', ['error' => $e->getMessage()]);

            return response()->json([
                'data' => [
                    'total_escalations' => 0,
                    'draft_timeouts'    => 0,
                    'review_timeouts'   => 0,
                    'sla_violations'    => 0,
                    'escalations'       => [],
                    'note'              => 'Using fallback — ' . $e->getMessage(),
                ],
            ]);
        }
    }

    // ─── Private helpers ──────────────────────────────────────────────────────

    private function computeMetrics(array $campaigns): array
    {
        $now            = now();
        $totalCampaigns = count($campaigns);
        $pendingApproval = $draftCount = $approvedCount = 0;
        $draftTimeout = $reviewTimeout = 0;
        $totalApprovalTime = $slaCompliantCount = $count = 0;

        foreach ($campaigns as $campaign) {
            $status    = $campaign['status'];
            $createdAt = $campaign['created_at'] ? new \Carbon\Carbon($campaign['created_at']) : null;
            $updatedAt = $campaign['updated_at'] ? new \Carbon\Carbon($campaign['updated_at']) : null;

            match ($status) {
                'pending' => $pendingApproval++ && ($createdAt?->lt($now->copy()->subDays(3)) && $reviewTimeout++),
                'draft'   => $draftCount++    && ($createdAt?->lt($now->copy()->subDays(7))  && $draftTimeout++),
                default   => null,
            };

            if (in_array($status, ['approved', 'published']) && $createdAt && $updatedAt) {
                $approvedCount++;
                $hours              = $createdAt->diffInHours($updatedAt);
                $totalApprovalTime += $hours;
                $count++;
                if ($hours <= 48) {
                    $slaCompliantCount++;
                }
            }
        }

        return [
            'total_campaigns'         => $totalCampaigns,
            'pending_approval'        => $pendingApproval,
            'draft_timeout'           => $draftTimeout,
            'review_timeout'          => $reviewTimeout,
            'avg_approval_time_hours' => $count > 0 ? round($totalApprovalTime / $count, 1) : 0,
            'sla_compliance_rate'     => $approvedCount > 0 ? round(($slaCompliantCount / $approvedCount) * 100, 1) : 0,
        ];
    }

    private function computeEscalations(array $campaigns): array
    {
        $now           = now();
        $draftTimeouts = $reviewTimeouts = $slaViolations = [];

        foreach ($campaigns as $campaign) {
            $status    = $campaign['status'];
            $createdAt = $campaign['created_at'] ? new \Carbon\Carbon($campaign['created_at']) : null;
            $updatedAt = $campaign['updated_at'] ? new \Carbon\Carbon($campaign['updated_at']) : null;

            if ($status === 'draft' && $createdAt?->lt($now->copy()->subDays(7))) {
                $draftTimeouts[] = [
                    'id'                  => $campaign['id'],
                    'title'               => $campaign['title'] ?? 'Untitled',
                    'status'              => $status,
                    'created_at'          => $campaign['created_at'],
                    'days_since_creation' => $createdAt->diffInDays($now),
                    'escalation_type'     => 'Draft Timeout',
                    'severity'            => 'high',
                    'action_required'     => 'Review and either submit or delete draft',
                ];
            }

            if ($status === 'pending' && $createdAt?->lt($now->copy()->subDays(3))) {
                $reviewTimeouts[] = [
                    'id'                  => $campaign['id'],
                    'title'               => $campaign['title'] ?? 'Untitled',
                    'status'              => $status,
                    'created_at'          => $campaign['created_at'],
                    'days_since_creation' => $createdAt->diffInDays($now),
                    'escalation_type'     => 'Review Timeout',
                    'severity'            => 'high',
                    'action_required'     => 'Approve or reject campaign immediately',
                ];
            }

            if (in_array($status, ['approved', 'published']) && $createdAt && $updatedAt) {
                $hours = $createdAt->diffInHours($updatedAt);
                if ($hours > 48) {
                    $slaViolations[] = [
                        'id'               => $campaign['id'],
                        'title'            => $campaign['title'] ?? 'Untitled',
                        'status'           => $status,
                        'created_at'       => $campaign['created_at'],
                        'updated_at'       => $campaign['updated_at'],
                        'hours_to_approve' => $hours,
                        'escalation_type'  => 'SLA Violation',
                        'severity'         => 'medium',
                        'action_required'  => 'Review approval process for delays',
                    ];
                }
            }
        }

        $all = array_merge($draftTimeouts, $reviewTimeouts, $slaViolations);

        return [
            'total_escalations' => count($all),
            'draft_timeouts'    => count($draftTimeouts),
            'review_timeouts'   => count($reviewTimeouts),
            'sla_violations'    => count($slaViolations),
            'escalations'       => $all,
        ];
    }

    private function emptyMetrics(string $note = ''): array
    {
        return [
            'total_campaigns'         => 0,
            'pending_approval'        => 0,
            'draft_timeout'           => 0,
            'review_timeout'          => 0,
            'avg_approval_time_hours' => 0,
            'sla_compliance_rate'     => 0,
            'note'                    => $note ? "Using fallback — {$note}" : null,
        ];
    }
}
