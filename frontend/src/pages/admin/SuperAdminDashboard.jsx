import React, { useState, useEffect } from "react";
import { Shield, Database, Globe, CreditCard, Users, Settings, Server, Lock, Activity, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";

export default function SuperAdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    adminCount: 0,
    staffCount: 0,
    citizenCount: 0,
    databaseSize: '0 MB',
    apiCalls: 0,
    uptime: '99.9%'
  });

  const [domainConfig, setDomainConfig] = useState({
    domain: '',
    sslEnabled: true,
    cdnEnabled: false
  });

  const [dbConfig, setDbConfig] = useState({
    host: '',
    port: '5432',
    database: '',
    mode: 'cloud'
  });

  useEffect(() => {
    fetchSystemStats();
  }, []);

  const fetchSystemStats = async () => {
    try {
      // Fetch user counts
      const { data: users } = await supabase.from('users').select('role');
      
      if (users) {
        setSystemStats({
          totalUsers: users.length,
          adminCount: users.filter(u => u.role === 'admin').length,
          staffCount: users.filter(u => u.role === 'staff').length,
          citizenCount: users.filter(u => u.role === 'citizen' || u.role === 'public').length,
          databaseSize: '156 MB',
          apiCalls: 45230,
          uptime: '99.9%'
        });
      }
    } catch (error) {
      console.error('Error fetching system stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDomain = () => {
    console.log('Saving domain config:', domainConfig);
    // Implement domain configuration save
  };

  const handleSaveDb = () => {
    console.log('Saving DB config:', dbConfig);
    // Implement database configuration save
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
      <div className="rounded-xl overflow-hidden relative bg-gradient-to-r from-purple-600 to-blue-600 min-h-[120px] flex items-end">
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        <div className="relative p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div className="text-white">
            <h1 className="font-display text-2xl font-bold">Super Admin Dashboard</h1>
            <p className="text-white/75 text-sm">System Configuration & Management</p>
          </div>
        </div>
      </div>

      {/* System Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="h-9 w-9 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
              <Badge variant="success">Active</Badge>
            </div>
            <p className="text-2xl font-bold font-display">{systemStats.totalUsers}</p>
            <p className="text-sm text-muted-foreground">Total Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="h-9 w-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <Database className="h-5 w-5" />
              </div>
              <Badge variant="outline">{systemStats.uptime}</Badge>
            </div>
            <p className="text-2xl font-bold font-display">{systemStats.databaseSize}</p>
            <p className="text-sm text-muted-foreground">Database Size</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="h-9 w-9 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                <Activity className="h-5 w-5" />
              </div>
              <Badge variant="success">Normal</Badge>
            </div>
            <p className="text-2xl font-bold font-display">{systemStats.apiCalls.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">API Calls (Today)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="h-9 w-9 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                <Server className="h-5 w-5" />
              </div>
              <Badge variant="success">Online</Badge>
            </div>
            <p className="text-2xl font-bold font-display">3</p>
            <p className="text-sm text-muted-foreground">Active Servers</p>
          </CardContent>
        </Card>
      </div>

      {/* Domain & Hosting Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" /> Domain & Hosting Configuration
          </CardTitle>
          <CardDescription>Configure your custom domain and hosting settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Custom Domain</Label>
              <Input
                placeholder="barangay178.com"
                value={domainConfig.domain}
                onChange={(e) => setDomainConfig({ ...domainConfig, domain: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Hosting Provider</Label>
              <Select value="supabase">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="supabase">Supabase Cloud</SelectItem>
                  <SelectItem value="vercel">Vercel</SelectItem>
                  <SelectItem value="netlify">Netlify</SelectItem>
                  <SelectItem value="custom">Custom Server</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">SSL Certificate Enabled</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-600" />
              <span className="text-sm">CDN: {domainConfig.cdnEnabled ? 'Enabled' : 'Disabled'}</span>
            </div>
          </div>
          <Button onClick={handleSaveDomain}>Save Domain Configuration</Button>
        </CardContent>
      </Card>

      {/* Database Configuration */}
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
                disabled={dbConfig.mode === 'cloud'}
              />
            </div>
          </div>
          {dbConfig.mode !== 'cloud' && (
            <div className="space-y-2">
              <Label>Database Host</Label>
              <Input
                placeholder="localhost"
                value={dbConfig.host}
                onChange={(e) => setDbConfig({ ...dbConfig, host: e.target.value })}
              />
            </div>
          )}
          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-800">
              Switching database modes requires system restart. Data will be migrated automatically.
            </span>
          </div>
          <Button onClick={handleSaveDb}>Save Database Configuration</Button>
        </CardContent>
      </Card>

      {/* Admin Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" /> Admin Management
          </CardTitle>
          <CardDescription>Manage system administrators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <Shield className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Super Admin</p>
                  <p className="text-xs text-muted-foreground">superadmin@gmail.com</p>
                </div>
              </div>
              <Badge variant="success">Active</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Admin User</p>
                  <p className="text-xs text-muted-foreground">admin@barangay178.com</p>
                </div>
              </div>
              <Badge>Admin</Badge>
            </div>
            <Button variant="outline" className="w-full">
              <Users className="h-4 w-4 mr-2" /> Add New Admin
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="h-4 w-4 text-primary" /> System Settings
          </CardTitle>
          <CardDescription>Configure system-wide settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Session Timeout (Admin)</Label>
            <Select defaultValue="15">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 minutes</SelectItem>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Session Timeout (Citizen)</Label>
            <Select defaultValue="30">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>OTP Validity</Label>
            <Select defaultValue="2">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 minute</SelectItem>
                <SelectItem value="2">2 minutes</SelectItem>
                <SelectItem value="5">5 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button>Save System Settings</Button>
        </CardContent>
      </Card>
    </div>
  );
}
