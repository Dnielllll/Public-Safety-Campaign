import React, { useState, useEffect } from "react";
import { Zap, RefreshCw, CheckCircle, XCircle, AlertTriangle, Loader2, Activity, Cpu, MemoryStick, HardDrive, Network, Settings, TrendingUp, Database, Clock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";

export default function SystemOptimization() {
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const [performanceMetrics, setPerformanceMetrics] = useState({
    cpuUsage: 45,
    memoryUsage: 62,
    diskUsage: 58,
    networkUsage: 28,
    responseTime: 120,
    cacheHitRate: 85,
    databaseQueryTime: 45,
  });

  const [optimizationSettings, setOptimizationSettings] = useState({
    autoOptimization: true,
    cacheEnabled: true,
    compressionEnabled: true,
    indexOptimization: true,
    queryOptimization: true,
  });

  const [optimizationHistory, setOptimizationHistory] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    fetchPerformanceMetrics();
    fetchOptimizationHistory();
    generateRecommendations();
  }, []);

  const fetchPerformanceMetrics = async () => {
    try {
      setLoading(true);
      // Simulated performance metrics - in production use Supabase metrics
      setPerformanceMetrics({
        cpuUsage: Math.floor(Math.random() * 30) + 30,
        memoryUsage: Math.floor(Math.random() * 30) + 50,
        diskUsage: Math.floor(Math.random() * 30) + 40,
        networkUsage: Math.floor(Math.random() * 40) + 10,
        responseTime: Math.floor(Math.random() * 100) + 80,
        cacheHitRate: Math.floor(Math.random() * 20) + 75,
        databaseQueryTime: Math.floor(Math.random() * 50) + 30,
      });
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOptimizationHistory = async () => {
    try {
      // Simulated optimization history
      const simulatedHistory = [
        {
          id: 1,
          type: 'Cache Optimization',
          timestamp: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
          status: 'completed',
          improvement: '15% faster response time',
        },
        {
          id: 2,
          type: 'Database Index Optimization',
          timestamp: new Date(Date.now() - 24 * 60 * 60000).toISOString(),
          status: 'completed',
          improvement: '20% faster queries',
        },
        {
          id: 3,
          type: 'Storage Compression',
          timestamp: new Date(Date.now() - 48 * 60 * 60000).toISOString(),
          status: 'completed',
          improvement: '12% storage saved',
        },
      ];

      setOptimizationHistory(simulatedHistory);
    } catch (error) {
      console.error('Error fetching optimization history:', error);
    }
  };

  const generateRecommendations = () => {
    const recs = [];
    
    if (performanceMetrics.cpuUsage > 70) {
      recs.push({
        type: 'warning',
        title: 'High CPU Usage',
        description: 'Consider enabling CPU optimization or scaling resources',
      });
    }
    
    if (performanceMetrics.memoryUsage > 75) {
      recs.push({
        type: 'warning',
        title: 'High Memory Usage',
        description: 'Consider enabling memory optimization or adding more RAM',
      });
    }
    
    if (performanceMetrics.cacheHitRate < 80) {
      recs.push({
        type: 'info',
        title: 'Low Cache Hit Rate',
        description: 'Consider increasing cache size or optimizing cache strategy',
      });
    }
    
    if (performanceMetrics.databaseQueryTime > 100) {
      recs.push({
        type: 'warning',
        title: 'Slow Database Queries',
        description: 'Consider optimizing database indexes or queries',
      });
    }

    if (recs.length === 0) {
      recs.push({
        type: 'success',
        title: 'System Optimized',
        description: 'All performance metrics are within optimal ranges',
      });
    }

    setRecommendations(recs);
  };

  const handleOptimize = async (type) => {
    setOptimizing(true);
    try {
      // Simulate optimization process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In production, trigger actual optimization via Supabase
      const now = new Date();
      const newOptimization = {
        id: Date.now(),
        type: type,
        timestamp: now.toISOString(),
        status: 'completed',
        improvement: getImprovementMessage(type),
      };

      setOptimizationHistory([newOptimization, ...optimizationHistory]);
      await fetchPerformanceMetrics();
      generateRecommendations();

      alert(`${type} completed successfully`);
    } catch (error) {
      console.error('Error during optimization:', error);
      alert('Optimization failed');
    } finally {
      setOptimizing(false);
    }
  };

  const getImprovementMessage = (type) => {
    switch (type) {
      case 'Cache Optimization':
        return 'Cache cleared and optimized - 15% faster response time';
      case 'Database Index Optimization':
        return 'Database indexes rebuilt - 20% faster queries';
      case 'Storage Compression':
        return 'Storage compressed - 12% space saved';
      case 'Full System Optimization':
        return 'Full system optimization completed - Overall performance improved';
      default:
        return 'Performance improved';
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchPerformanceMetrics(),
      fetchOptimizationHistory(),
      generateRecommendations(),
    ]);
    setRefreshing(false);
  };

  const handleSaveSettings = async () => {
    try {
      // In production, save to system_settings table in Supabase
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Optimization settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings');
    }
  };

  const getMetricColor = (value, thresholds) => {
    if (value > thresholds.high) return 'text-red-600';
    if (value > thresholds.medium) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getRecommendationIcon = (type) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'info': return <Activity className="h-5 w-5 text-blue-600" />;
      case 'success': return <CheckCircle className="h-5 w-5 text-green-600" />;
      default: return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">System Optimization</h1>
          <p className="text-sm text-muted-foreground">Optimize system performance and resource utilization</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" /> Performance Metrics
          </CardTitle>
          <CardDescription>Real-time system performance indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Cpu className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">CPU Usage</span>
              </div>
              <p className={`text-2xl font-bold ${getMetricColor(performanceMetrics.cpuUsage, { medium: 60, high: 80 })}`}>
                {performanceMetrics.cpuUsage}%
              </p>
              <Progress value={performanceMetrics.cpuUsage} className="mt-2" />
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MemoryStick className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Memory Usage</span>
              </div>
              <p className={`text-2xl font-bold ${getMetricColor(performanceMetrics.memoryUsage, { medium: 65, high: 85 })}`}>
                {performanceMetrics.memoryUsage}%
              </p>
              <Progress value={performanceMetrics.memoryUsage} className="mt-2" />
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <HardDrive className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Disk Usage</span>
              </div>
              <p className={`text-2xl font-bold ${getMetricColor(performanceMetrics.diskUsage, { medium: 70, high: 90 })}`}>
                {performanceMetrics.diskUsage}%
              </p>
              <Progress value={performanceMetrics.diskUsage} className="mt-2" />
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Network className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Network Usage</span>
              </div>
              <p className={`text-2xl font-bold ${getMetricColor(performanceMetrics.networkUsage, { medium: 50, high: 75 })}`}>
                {performanceMetrics.networkUsage}%
              </p>
              <Progress value={performanceMetrics.networkUsage} className="mt-2" />
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Response Time</span>
              </div>
              <p className={`text-2xl font-bold ${getMetricColor(performanceMetrics.responseTime, { medium: 150, high: 300 })}`}>
                {performanceMetrics.responseTime}ms
              </p>
              <p className="text-xs text-muted-foreground mt-2">Average response</p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Cache Hit Rate</span>
              </div>
              <p className={`text-2xl font-bold ${getMetricColor(100 - performanceMetrics.cacheHitRate, { medium: 20, high: 35 })}`}>
                {performanceMetrics.cacheHitRate}%
              </p>
              <Progress value={performanceMetrics.cacheHitRate} className="mt-2" />
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Database className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Query Time</span>
              </div>
              <p className={`text-2xl font-bold ${getMetricColor(performanceMetrics.databaseQueryTime, { medium: 80, high: 150 })}`}>
                {performanceMetrics.databaseQueryTime}ms
              </p>
              <p className="text-xs text-muted-foreground mt-2">Average query time</p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Overall Score</span>
              </div>
              <p className="text-2xl font-bold text-green-600">92%</p>
              <p className="text-xs text-muted-foreground mt-2">Performance score</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Optimization Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" /> Quick Optimization
          </CardTitle>
          <CardDescription>Run common optimization tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              onClick={() => handleOptimize('Cache Optimization')}
              disabled={optimizing}
              className="h-auto py-4 flex-col"
            >
              <Zap className="h-5 w-5 mb-2" />
              <span>Optimize Cache</span>
            </Button>
            <Button
              onClick={() => handleOptimize('Database Index Optimization')}
              disabled={optimizing}
              variant="outline"
              className="h-auto py-4 flex-col"
            >
              <Database className="h-5 w-5 mb-2" />
              <span>Optimize Database</span>
            </Button>
            <Button
              onClick={() => handleOptimize('Storage Compression')}
              disabled={optimizing}
              variant="outline"
              className="h-auto py-4 flex-col"
            >
              <HardDrive className="h-5 w-5 mb-2" />
              <span>Compress Storage</span>
            </Button>
            <Button
              onClick={() => handleOptimize('Full System Optimization')}
              disabled={optimizing}
              variant="outline"
              className="h-auto py-4 flex-col"
            >
              <Settings className="h-5 w-5 mb-2" />
              <span>Full Optimization</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Optimization Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="h-4 w-4 text-primary" /> Optimization Settings
          </CardTitle>
          <CardDescription>Configure automatic optimization behavior</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Auto Optimization</p>
              <p className="text-sm text-muted-foreground">Automatically optimize system performance</p>
            </div>
            <Switch
              checked={optimizationSettings.autoOptimization}
              onCheckedChange={(checked) => setOptimizationSettings({ ...optimizationSettings, autoOptimization: checked })}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Cache Enabled</p>
              <p className="text-sm text-muted-foreground">Enable system caching for faster responses</p>
            </div>
            <Switch
              checked={optimizationSettings.cacheEnabled}
              onCheckedChange={(checked) => setOptimizationSettings({ ...optimizationSettings, cacheEnabled: checked })}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Compression Enabled</p>
              <p className="text-sm text-muted-foreground">Compress data to reduce storage usage</p>
            </div>
            <Switch
              checked={optimizationSettings.compressionEnabled}
              onCheckedChange={(checked) => setOptimizationSettings({ ...optimizationSettings, compressionEnabled: checked })}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Index Optimization</p>
              <p className="text-sm text-muted-foreground">Optimize database indexes automatically</p>
            </div>
            <Switch
              checked={optimizationSettings.indexOptimization}
              onCheckedChange={(checked) => setOptimizationSettings({ ...optimizationSettings, indexOptimization: checked })}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Query Optimization</p>
              <p className="text-sm text-muted-foreground">Optimize database queries automatically</p>
            </div>
            <Switch
              checked={optimizationSettings.queryOptimization}
              onCheckedChange={(checked) => setOptimizationSettings({ ...optimizationSettings, queryOptimization: checked })}
            />
          </div>

          <Button onClick={handleSaveSettings}>
            <Settings className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" /> Optimization Recommendations
          </CardTitle>
          <CardDescription>AI-powered suggestions to improve system performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
                {getRecommendationIcon(rec.type)}
                <div className="flex-1">
                  <p className="font-medium">{rec.title}</p>
                  <p className="text-sm text-muted-foreground">{rec.description}</p>
                </div>
                <Badge variant={rec.type === 'warning' ? 'destructive' : rec.type === 'success' ? 'success' : 'outline'}>
                  {rec.type}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Optimization History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" /> Optimization History
          </CardTitle>
          <CardDescription>Recent optimization activities and their results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {optimizationHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No optimization history</p>
            ) : (
              optimizationHistory.map((opt) => (
                <div key={opt.id} className="flex items-center gap-3 p-4 border rounded-lg">
                  <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{opt.type}</p>
                    <p className="text-sm text-muted-foreground">{opt.improvement}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="success">{opt.status}</Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(opt.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}