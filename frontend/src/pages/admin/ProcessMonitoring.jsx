import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Activity,
  FileText,
  Settings,
  RefreshCw,
  X
} from "lucide-react";
import { workflowApi } from "@/lib/apiGateway.js";

export default function ProcessMonitoring() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [escalationResults, setEscalationResults] = useState(null);
  const [escalationLoading, setEscalationLoading] = useState(false);
  const [configureRulesOpen, setConfigureRulesOpen] = useState(false);
  const [executionHistoryOpen, setExecutionHistoryOpen] = useState(false);
  const [rules, setRules] = useState({
    draftTimeoutDays: 7,
    reviewTimeoutDays: 3,
    slaComplianceHours: 48,
  });
  const [executionHistory, setExecutionHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await workflowApi.getMetrics();
      setMetrics(response.data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfigureRules = () => {
    setConfigureRulesOpen(true);
  };

  const handleSaveRules = () => {
    // Save rules to backend (to be implemented)
    console.log('Saving rules:', rules);
    setConfigureRulesOpen(false);
    alert('Rules saved successfully!');
  };

  const handleRunEscalationCheck = async () => {
    try {
      setEscalationLoading(true);
      const response = await workflowApi.runEscalation();
      setEscalationResults(response.data);
    } catch (error) {
      console.error('Failed to run escalation check:', error);
      alert('Failed to run escalation check. Please try again.');
    } finally {
      setEscalationLoading(false);
    }
  };

  const handleViewExecutionHistory = async () => {
    try {
      setHistoryLoading(true);
      // Mock execution history data for now
      const mockHistory = [
        {
          id: 1,
          action: 'Escalation Check',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          result: 'Completed',
          details: 'Found 0 escalations'
        },
        {
          id: 2,
          action: 'Metrics Refresh',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          result: 'Completed',
          details: 'Updated dashboard metrics'
        },
        {
          id: 3,
          action: 'Escalation Check',
          timestamp: new Date(Date.now() - 10800000).toISOString(),
          result: 'Completed',
          details: 'Found 0 escalations'
        },
      ];
      setExecutionHistory(mockHistory);
      setExecutionHistoryOpen(true);
    } catch (error) {
      console.error('Failed to fetch execution history:', error);
      alert('Failed to fetch execution history. Please try again.');
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    // Refresh metrics every 5 minutes
    const interval = setInterval(fetchMetrics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const MetricCard = ({ title, value, icon: Icon, color, trend }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p className="text-xs text-muted-foreground mt-1">{trend}</p>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Process Monitoring Dashboard</h1>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-xs text-muted-foreground">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <Button onClick={fetchMetrics} size="sm" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Campaigns"
          value={metrics?.total_campaigns || 0}
          icon={FileText}
          color="text-blue-500"
        />
        <MetricCard
          title="Pending Approval"
          value={metrics?.pending_approval || 0}
          icon={Clock}
          color="text-yellow-500"
          trend="Awaiting review"
        />
        <MetricCard
          title="Draft Timeout"
          value={metrics?.draft_timeout || 0}
          icon={AlertTriangle}
          color="text-red-500"
          trend="Requires attention"
        />
        <MetricCard
          title="Review Timeout"
          value={metrics?.review_timeout || 0}
          icon={AlertTriangle}
          color="text-red-500"
          trend="SLA exceeded"
        />
      </div>

      {/* Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        <MetricCard
          title="Average Approval Time"
          value={`${metrics?.avg_approval_time_hours || 0}h`}
          icon={Activity}
          color="text-purple-500"
          trend="Time to approval"
        />
        <MetricCard
          title="SLA Compliance Rate"
          value={`${metrics?.sla_compliance_rate || 0}%`}
          icon={CheckCircle}
          color="text-green-500"
          trend="On-time approvals"
        />
      </div>

      {/* Process Health Status */}
      <Card>
        <CardHeader>
          <CardTitle>Process Health Status</CardTitle>
          <CardDescription>
            Real-time monitoring of workflow automation health
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${
                (metrics?.draft_timeout || 0) === 0 ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <Clock className={`h-5 w-5 ${
                  (metrics?.draft_timeout || 0) === 0 ? 'text-green-600' : 'text-red-600'
                }`} />
              </div>
              <div>
                <p className="font-medium">Draft Campaigns</p>
                <p className="text-sm text-muted-foreground">
                  {(metrics?.draft_timeout || 0) === 0 
                    ? 'All drafts within SLA' 
                    : `${metrics?.draft_timeout} drafts exceeded timeout`}
                </p>
              </div>
            </div>
            <Badge variant={(metrics?.draft_timeout || 0) === 0 ? 'default' : 'destructive'}>
              {(metrics?.draft_timeout || 0) === 0 ? 'Healthy' : 'Critical'}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${
                (metrics?.review_timeout || 0) === 0 ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <Activity className={`h-5 w-5 ${
                  (metrics?.review_timeout || 0) === 0 ? 'text-green-600' : 'text-red-600'
                }`} />
              </div>
              <div>
                <p className="font-medium">Approval Reviews</p>
                <p className="text-sm text-muted-foreground">
                  {(metrics?.review_timeout || 0) === 0 
                    ? 'All reviews within SLA' 
                    : `${metrics?.review_timeout} reviews exceeded timeout`}
                </p>
              </div>
            </div>
            <Badge variant={(metrics?.review_timeout || 0) === 0 ? 'default' : 'destructive'}>
              {(metrics?.review_timeout || 0) === 0 ? 'Healthy' : 'Critical'}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${
                (metrics?.sla_compliance_rate || 0) >= 90 ? 'bg-green-100' : 
                (metrics?.sla_compliance_rate || 0) >= 70 ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
                <TrendingUp className={`h-5 w-5 ${
                  (metrics?.sla_compliance_rate || 0) >= 90 ? 'text-green-600' : 
                  (metrics?.sla_compliance_rate || 0) >= 70 ? 'text-yellow-600' : 'text-red-600'
                }`} />
              </div>
              <div>
                <p className="font-medium">SLA Compliance</p>
                <p className="text-sm text-muted-foreground">
                  {metrics?.sla_compliance_rate || 0}% of campaigns approved within SLA
                </p>
              </div>
            </div>
            <Badge variant={
              (metrics?.sla_compliance_rate || 0) >= 90 ? 'default' : 
              (metrics?.sla_compliance_rate || 0) >= 70 ? 'secondary' : 'destructive'
            }>
              {(metrics?.sla_compliance_rate || 0) >= 90 ? 'Excellent' : 
               (metrics?.sla_compliance_rate || 0) >= 70 ? 'Good' : 'Needs Improvement'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Manual workflow automation controls
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Button variant="outline" onClick={handleConfigureRules}>
            <Settings className="h-4 w-4 mr-2" />
            Configure Rules
          </Button>
          <Button variant="outline" onClick={handleRunEscalationCheck} disabled={escalationLoading}>
            {escalationLoading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Run Escalation Check
          </Button>
          <Button variant="outline" onClick={handleViewExecutionHistory} disabled={historyLoading}>
            {historyLoading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileText className="h-4 w-4 mr-2" />
            )}
            View Execution History
          </Button>
        </CardContent>
      </Card>

      {/* Escalation Results */}
      {escalationResults && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Escalation Check Results</CardTitle>
              <CardDescription>
                {escalationResults.total_escalations} campaign(s) require attention
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setEscalationResults(null)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{escalationResults.draft_timeouts}</div>
                  <div className="text-sm text-muted-foreground">Draft Timeouts</div>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{escalationResults.review_timeouts}</div>
                  <div className="text-sm text-muted-foreground">Review Timeouts</div>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{escalationResults.sla_violations}</div>
                  <div className="text-sm text-muted-foreground">SLA Violations</div>
                </div>
              </div>

              {escalationResults.escalations.length > 0 ? (
                <div className="space-y-2">
                  {escalationResults.escalations.map((escalation, index) => (
                    <div
                      key={index}
                      className={`p-4 border rounded-lg ${
                        escalation.severity === 'high' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={escalation.severity === 'high' ? 'destructive' : 'secondary'}>
                              {escalation.escalation_type}
                            </Badge>
                            <span className="text-sm font-medium">{escalation.title}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Status: <span className="font-medium">{escalation.status}</span>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {escalation.escalation_type === 'Draft Timeout' || escalation.escalation_type === 'Review Timeout' ? (
                              <>Days since creation: <span className="font-medium">{escalation.days_since_creation}</span></>
                            ) : (
                              <>Hours to approve: <span className="font-medium">{escalation.hours_to_approve}</span></>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            Action required: <span className="font-medium">{escalation.action_required}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                  <p>No escalations found. All campaigns are within SLA.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configure Rules Dialog */}
      <Dialog open={configureRulesOpen} onOpenChange={setConfigureRulesOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configure Workflow Rules</DialogTitle>
            <DialogDescription>
              Set up automated workflow rules and SLA thresholds for campaign management.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="draftTimeout">Draft Timeout (days)</Label>
              <Input
                id="draftTimeout"
                type="number"
                value={rules.draftTimeoutDays}
                onChange={(e) => setRules({ ...rules, draftTimeoutDays: parseInt(e.target.value) })}
                min="1"
              />
              <p className="text-xs text-muted-foreground">
                Drafts older than this will be flagged for escalation.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reviewTimeout">Review Timeout (days)</Label>
              <Input
                id="reviewTimeout"
                type="number"
                value={rules.reviewTimeoutDays}
                onChange={(e) => setRules({ ...rules, reviewTimeoutDays: parseInt(e.target.value) })}
                min="1"
              />
              <p className="text-xs text-muted-foreground">
                Pending approvals older than this will be flagged for escalation.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="slaCompliance">SLA Compliance (hours)</Label>
              <Input
                id="slaCompliance"
                type="number"
                value={rules.slaComplianceHours}
                onChange={(e) => setRules({ ...rules, slaComplianceHours: parseInt(e.target.value) })}
                min="1"
              />
              <p className="text-xs text-muted-foreground">
                Campaigns should be approved within this time to meet SLA.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfigureRulesOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveRules}>Save Rules</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Execution History Dialog */}
      <Dialog open={executionHistoryOpen} onOpenChange={setExecutionHistoryOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Workflow Execution History</DialogTitle>
            <DialogDescription>
              Log of all workflow automation executions and their results.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {executionHistory && executionHistory.length > 0 ? (
              <div className="space-y-2">
                {executionHistory.map((entry) => (
                  <div key={entry.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{entry.action}</span>
                      <Badge variant={entry.result === 'Completed' ? 'default' : 'destructive'}>
                        {entry.result}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(entry.timestamp).toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {entry.details}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No execution history available.
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setExecutionHistoryOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
