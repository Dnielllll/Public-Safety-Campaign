import React, { useState, useEffect } from "react";
import { UserCheck, Shield, Users, RefreshCw, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { supabaseHelpers } from "@/lib/supabase.js";

const ROLES = [
  {
    id: "super_admin",
    label: "Super Administrator",
    description: "Full system access including database, security, and admin management.",
    fixed: true,
  },
  {
    id: "admin",
    label: "Administrator",
    description: "Manages campaigns and staff with configurable module permissions.",
    fixed: false,
  },
  {
    id: "staff",
    label: "Staff",
    description: "Creates and submits campaign content for approval.",
    fixed: true,
  },
  {
    id: "citizen",
    label: "Citizen / Public",
    description: "Accesses public portal, surveys, and feedback.",
    fixed: true,
  },
];

const AVAILABLE_MODULES = [
  "Users", "Campaign Management", "AI Assistant", "Content", "Approvals",
  "Distribution", "Notifications", "Feedback", "Reports", "Monitoring",
  "Audit Trail", "Settings",
];

export default function RolePermission() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [editedModules, setEditedModules] = useState({});

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabaseHelpers.getUsers();
      if (!error && data) {
        const adminUsers = data.filter((u) => u.role === "admin");
        setAdmins(adminUsers);
        const initial = {};
        adminUsers.forEach((u) => {
          initial[u.id] = u.allowed_modules || [];
        });
        setEditedModules(initial);
      }
    } catch (err) {
      console.error("Failed to load admins:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const toggleModule = (adminId, module) => {
    setEditedModules((prev) => {
      const current = prev[adminId] || [];
      const updated = current.includes(module)
        ? current.filter((m) => m !== module)
        : [...current, module];
      return { ...prev, [adminId]: updated };
    });
  };

  const savePermissions = async (adminId) => {
    setSaving(adminId);
    try {
      const modules = editedModules[adminId] || [];
      await supabaseHelpers.updateUser(adminId, { allowed_modules: modules });
      setAdmins((prev) =>
        prev.map((u) => (u.id === adminId ? { ...u, allowed_modules: modules } : u))
      );
    } catch (err) {
      console.error("Failed to save permissions:", err);
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Role & Permission</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          View system roles and manage module permissions for administrators.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ROLES.map((role) => (
          <Card key={role.id}>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-primary" />
                <Badge variant="outline" className="text-[10px]">{role.id}</Badge>
              </div>
              <p className="font-semibold text-sm">{role.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{role.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-primary" /> Admin Module Permissions
          </CardTitle>
          <CardDescription>
            Configure which modules each admin can access. Dashboard and Profile are always allowed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 flex flex-col items-center text-muted-foreground">
              <RefreshCw className="h-8 w-8 animate-spin mb-4" />
              <p>Loading administrators...</p>
            </div>
          ) : admins.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Users className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p>No admin accounts found. Create one in Admin Management.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {admins.map((admin) => (
                <div key={admin.id} className="border border-border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{admin.name}</p>
                      <p className="text-xs text-muted-foreground">{admin.email}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => savePermissions(admin.id)}
                      disabled={saving === admin.id}
                    >
                      {saving === admin.id ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-1" /> Save
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {AVAILABLE_MODULES.map((module) => (
                      <label
                        key={module}
                        className="flex items-center space-x-2 cursor-pointer bg-secondary/30 p-2 rounded-md border border-border/50 hover:bg-secondary transition-colors"
                      >
                        <Checkbox
                          checked={(editedModules[admin.id] || []).includes(module)}
                          onCheckedChange={() => toggleModule(admin.id, module)}
                        />
                        <span className="text-sm">{module}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
