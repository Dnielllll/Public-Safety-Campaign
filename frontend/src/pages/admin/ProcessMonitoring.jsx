import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  Activity,
  FileText,
  Settings,
  RefreshCw
} from "lucide-react";
import { api } from "@/lib/api";

export default function ProcessMonitoring() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/workflow/metrics');
      setMetrics(response.data.data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setLoading(false);
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
          <p className="text-muted-foreground">
            BPA Level 2 - Workflow Automation & SLA Monitoring
          </p>
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
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Configure Rules
          </Button>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Run Escalation Check
          </Button>
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            View Execution History
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
