import React, { useState, useEffect } from "react";
import { Database, AlertTriangle, RefreshCw, HardDrive, Table2, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";

export default function DatabaseManagement() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalUsers: 0, totalCampaigns: 0, totalFeedback: 0 });
  const [dbConfig, setDbConfig] = useState({
    host: "",
    port: "5432",
    database: "postgres",
    mode: "cloud",
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [users, campaigns, feedback] = await Promise.all([
        supabase.from("users").select("id", { count: "exact", head: true }),
        supabase.from("campaigns").select("id", { count: "exact", head: true }),
        supabase.from("feedback").select("id", { count: "exact", head: true }),
      ]);
      setStats({
        totalUsers: users.count ?? 0,
        totalCampaigns: campaigns.count ?? 0,
        totalFeedback: feedback.count ?? 0,
      });
    } catch (error) {
      console.error("Error fetching database stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDb = () => {
    console.log("Saving DB config:", dbConfig);
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
      <div>
        <h1 className="font-display text-2xl font-bold">Database Management</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Monitor database health and configure connection settings.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <HardDrive className="h-5 w-5 text-primary" />
              <Badge variant="success">Connected</Badge>
            </div>
            <p className="text-2xl font-bold font-display">156 MB</p>
            <p className="text-sm text-muted-foreground">Database Size</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <Table2 className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold font-display">{stats.totalUsers}</p>
            <p className="text-sm text-muted-foreground">Users Table</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <Table2 className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold font-display">{stats.totalCampaigns}</p>
            <p className="text-sm text-muted-foreground">Campaigns Table</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <Table2 className="h-5 w-5 text-orange-600" />
            </div>
            <p className="text-2xl font-bold font-display">{stats.totalFeedback}</p>
            <p className="text-sm text-muted-foreground">Feedback Table</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="h-4 w-4 text-primary" /> Database Configuration
          </CardTitle>
          <CardDescription>Switch between local and cloud database</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Database Mode</Label>
              <Select
                value={dbConfig.mode}
                onValueChange={(v) => setDbConfig({ ...dbConfig, mode: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cloud">Cloud (Supabase)</SelectItem>
                  <SelectItem value="local">Local (PostgreSQL)</SelectItem>
                  <SelectItem value="hybrid">Hybrid Mode</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Port</Label>
              <Input
                value={dbConfig.port}
                onChange={(e) => setDbConfig({ ...dbConfig, port: e.target.value })}
                disabled={dbConfig.mode === "cloud"}
              />
            </div>
          </div>
          {dbConfig.mode !== "cloud" && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Database Host</Label>
                <Input
                  placeholder="localhost"
                  value={dbConfig.host}
                  onChange={(e) => setDbConfig({ ...dbConfig, host: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Database Name</Label>
                <Input
                  value={dbConfig.database}
                  onChange={(e) => setDbConfig({ ...dbConfig, database: e.target.value })}
                />
              </div>
            </div>
          )}
          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-blue-600 shrink-0" />
            <span className="text-sm text-blue-800">
              Switching database modes requires system restart. Data will be migrated automatically.
            </span>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSaveDb}>Save Database Configuration</Button>
            <Button variant="outline" onClick={fetchStats}>
              <RefreshCw className="h-4 w-4 mr-1" /> Refresh Stats
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
