import React, { useState, useEffect } from "react";
import { Plus, Search, ShieldCheck, UserCheck, UserX, Eye, EyeOff, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase, supabaseHelpers } from "@/lib/supabase.js";

// Create staff via Supabase RPC — works even when "Allow new users to sign up" is disabled
// Calls the create_user_by_admin() stored procedure which inserts directly into auth.users
const createStaffViaRPC = async (email, password, name) => {
  const { data, error } = await supabase.rpc('create_user_by_admin', {
    p_email:    email,
    p_password: password,
    p_name:     name,
    p_role:     'staff',
    p_phone:    '',
    p_address:  '',
  });
  return { data, error };
};

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "" });

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data, error } = await supabaseHelpers.getUsers();
      if (!error && data) {
        setUsers(data);
      }
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(query.toLowerCase()) ||
      u.email?.toLowerCase().includes(query.toLowerCase())
  );

  const staffOnly = filtered.filter((u) => u.role === "staff");

  const toggleActive = async (u) => {
    const newActive = !u.is_active;
    await supabaseHelpers.updateUser(u.id, { is_active: newActive });
    setUsers((prev) =>
      prev.map((user) => (user.id === u.id ? { ...user, is_active: newActive } : user))
    );
  };

  const createStaff = async () => {
    setFormError("");
    setFormSuccess("");

    if (!newUser.name.trim() || !newUser.email.trim() || !newUser.password.trim()) {
      setFormError("All fields are required.");
      return;
    }
    if (newUser.password.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return;
    }

    setCreating(true);
    try {
      // Call RPC — creates auth.users + public.users directly via SQL
      // Works even when "Allow new users to sign up" is disabled in Supabase
      const { data, error: rpcError } = await createStaffViaRPC(
        newUser.email.trim(),
        newUser.password,
        newUser.name.trim()
      );

      if (rpcError) {
        if (rpcError.message?.includes("already registered")) {
          throw new Error("This email is already registered.");
        }
        throw new Error(rpcError.message || "Failed to create staff account.");
      }

      setFormSuccess(`✅ Staff account created for ${newUser.email}. They can now log in immediately.`);
      setNewUser({ name: "", email: "", password: "" });
      await fetchUsers();

      setTimeout(() => {
        setOpen(false);
        setFormSuccess("");
      }, 2500);
    } catch (err) {
      setFormError(err.message || "Failed to create staff account.");
    } finally {
      setCreating(false);
    }
  };

  const roleColor = { admin: "default", staff: "secondary", public: "outline" };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Staff Account Management</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Create and manage barangay staff accounts. Residents register themselves via the public portal.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchUsers} disabled={loadingUsers}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loadingUsers ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Dialog open={open} onOpenChange={(v) => { setOpen(v); setFormError(""); setFormSuccess(""); }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-1" /> Add Staff Account
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  Create Staff Account
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="rounded-md border border-border bg-secondary/50 p-3 text-xs text-muted-foreground">
                  <p className="font-semibold text-foreground mb-1">ℹ️ Staff Account Info</p>
                  <p>You are creating a <strong>Staff</strong> account. The staff member will use the email and password you set here to log in and will be directed to the Staff Dashboard.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="staff-name">Full Name</Label>
                  <Input
                    id="staff-name"
                    placeholder="e.g. Juan Dela Cruz"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="staff-email">Email Address</Label>
                  <Input
                    id="staff-email"
                    type="email"
                    placeholder="staff@brgy178.gov.ph"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="staff-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="staff-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 6 characters"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">Share this password with the staff member. They can change it after logging in.</p>
                </div>

                {formError && (
                  <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{formError}</p>
                )}
                {formSuccess && (
                  <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">
                    ✅ {formSuccess}
                  </p>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)} disabled={creating}>
                  Cancel
                </Button>
                <Button onClick={createStaff} disabled={creating}>
                  {creating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Creating…
                    </>
                  ) : (
                    "Create Staff Account"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search staff by name or email…"
          className="pl-9"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Staff Table */}
      <Card>
        <CardContent className="p-0">
          {loadingUsers ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" /> Loading staff accounts…
            </div>
          ) : staffOnly.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <ShieldCheck className="h-10 w-10 mb-3 opacity-30" />
              <p className="text-sm font-medium">No staff accounts found</p>
              <p className="text-xs mt-1">Click "Add Staff Account" to create the first one.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="p-4 font-medium">Name</th>
                  <th className="p-4 font-medium">Email</th>
                  <th className="p-4 font-medium">Role</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {staffOnly.map((u) => (
                  <tr key={u.id} className="border-b border-border last:border-0 hover:bg-secondary/40 transition-colors">
                    <td className="p-4 font-medium flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                        {u.name?.[0]?.toUpperCase() ?? "S"}
                      </div>
                      {u.name}
                    </td>
                    <td className="p-4 text-muted-foreground">{u.email}</td>
                    <td className="p-4">
                      <Badge variant={roleColor[u.role] || "secondary"}>{u.role}</Badge>
                    </td>
                    <td className="p-4">
                      <Badge variant={u.is_active ? "default" : "outline"}>
                        {u.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleActive(u)}
                        className={u.is_active ? "text-destructive hover:text-destructive" : "text-green-600 hover:text-green-600"}
                      >
                        {u.is_active ? (
                          <><UserX className="h-4 w-4 mr-1" /> Deactivate</>
                        ) : (
                          <><UserCheck className="h-4 w-4 mr-1" /> Activate</>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
