import React, { useState } from "react";
import { ShieldAlert, Lock, Clock, KeyRound, AlertTriangle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export default function SecurityCenter() {
  const [settings, setSettings] = useState({
    adminSessionTimeout: "15",
    citizenSessionTimeout: "30",
    otpValidity: "2",
    requireMfa: false,
    ipWhitelist: false,
    loginAlerts: true,
  });

  const handleSave = () => {
    console.log("Saving security settings:", settings);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Security Center</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Configure authentication, session policies, and security monitoring.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <Badge variant="success">Active</Badge>
            </div>
            <p className="font-semibold">SSL / HTTPS</p>
            <p className="text-xs text-muted-foreground mt-1">All connections encrypted</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="h-5 w-5 text-primary" />
              <Badge variant="outline">Supabase Auth</Badge>
            </div>
            <p className="font-semibold">Authentication</p>
            <p className="text-xs text-muted-foreground mt-1">Email/password with OTP support</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className="h-5 w-5 text-orange-600" />
              <Badge variant="outline">0 today</Badge>
            </div>
            <p className="font-semibold">Failed Logins</p>
            <p className="text-xs text-muted-foreground mt-1">No suspicious activity detected</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" /> Session Policies
          </CardTitle>
          <CardDescription>Control how long users stay logged in</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Session Timeout (Admin)</Label>
              <Select
                value={settings.adminSessionTimeout}
                onValueChange={(v) => setSettings({ ...settings, adminSessionTimeout: v })}
              >
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
              <Select
                value={settings.citizenSessionTimeout}
                onValueChange={(v) => setSettings({ ...settings, citizenSessionTimeout: v })}
              >
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
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-primary" /> Authentication Settings
          </CardTitle>
          <CardDescription>OTP and multi-factor authentication options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>OTP Validity</Label>
            <Select
              value={settings.otpValidity}
              onValueChange={(v) => setSettings({ ...settings, otpValidity: v })}
            >
              <SelectTrigger className="max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 minute</SelectItem>
                <SelectItem value="2">2 minutes</SelectItem>
                <SelectItem value="5">5 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium text-sm">Require MFA for Admins</p>
              <p className="text-xs text-muted-foreground">Enforce two-factor authentication for admin accounts</p>
            </div>
            <Switch
              checked={settings.requireMfa}
              onCheckedChange={(v) => setSettings({ ...settings, requireMfa: v })}
            />
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium text-sm">Login Alert Notifications</p>
              <p className="text-xs text-muted-foreground">Notify super admin of failed login attempts</p>
            </div>
            <Switch
              checked={settings.loginAlerts}
              onCheckedChange={(v) => setSettings({ ...settings, loginAlerts: v })}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
        <span className="text-sm text-amber-800">
          Security policy changes take effect on the next user login session.
        </span>
      </div>

      <Button onClick={handleSave}>Save Security Settings</Button>
    </div>
  );
}
