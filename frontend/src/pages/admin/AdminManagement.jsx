import React, { useState, useEffect } from "react";
import { Plus, Search, ShieldCheck, UserCheck, UserX, Eye, EyeOff, RefreshCw, Edit } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase, supabaseHelpers } from "@/lib/supabase.js";
import { cn } from "@/lib/utils";

// Create admin via Supabase RPC
const createAdminViaRPC = async (email, password, name, phone = '', modules = []) => {
  const { data, error } = await supabase.rpc('create_user_by_admin', {
    p_email:    email,
    p_password: password,
    p_name:     name,
    p_role:     'admin',
    p_phone:    phone,
    p_address:  '',
    p_allowed_modules: modules
  });
  return { data, error };
};

const AVAILABLE_MODULES = [
  "Users", "Campaign Management", "AI Assistant", "Content", "Approvals",
  "Distribution", "Notifications", "Feedback", "Reports", "Monitoring",
  "Audit Trail", "Settings"
];

export default function AdminManagement() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  
  const [newUser, setNewUser] = useState({ 
    name: "", email: "", password: "", phone: "", allowed_modules: [] 
  });

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data, error } = await supabaseHelpers.getUsers();
      if (!error && data) {
        setUsers(data.filter(u => u.role === 'admin'));
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

  const toggleActive = async (u) => {
    const newActive = !u.is_active;
    await supabaseHelpers.updateUser(u.id, { is_active: newActive });
    setUsers((prev) =>
      prev.map((user) => (user.id === u.id ? { ...user, is_active: newActive } : user))
    );
  };

  const handleModuleToggle = (module) => {
    setNewUser(prev => {
      const isSelected = prev.allowed_modules.includes(module);
      return {
        ...prev,
        allowed_modules: isSelected 
          ? prev.allowed_modules.filter(m => m !== module)
          : [...prev.allowed_modules, module]
      };
    });
  };

  const createAdmin = async () => {
    setFormError("");
    setFormSuccess("");

    if (!newUser.name.trim() || !newUser.email.trim() || !newUser.password.trim()) {
      setFormError("Name, email, and password are required.");
      return;
    }
    if (newUser.password.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return;
    }

    setCreating(true);
    try {
      const { data, error: rpcError } = await createAdminViaRPC(
        newUser.email.trim(),
        newUser.password,
        newUser.name.trim(),
        newUser.phone.trim(),
        newUser.allowed_modules
      );

      if (rpcError) {
        if (rpcError.message?.includes("already registered")) {
          throw new Error("This email is already registered.");
        }
        throw new Error(rpcError.message || "Failed to create admin account.");
      }

      // Update auth meta data directly to ensure immediate sync if needed, though RPC does this.
      // The RPC already sets it, but to be thorough we log success.
      
      setFormSuccess(`✅ Admin account created for ${newUser.email}.`);
      setNewUser({ name: "", email: "", password: "", phone: "", allowed_modules: [] });
      await fetchUsers();

      setTimeout(() => {
        setOpen(false);
        setFormSuccess("");
      }, 2500);
    } catch (err) {
      setFormError(err.message || "Failed to create admin account.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Admin Management</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Create regular Admin accounts and assign specific module permissions.
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
                <Plus className="h-4 w-4 mr-1" /> Add Admin
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  Create Admin Account
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="admin-name">Full Name</Label>
                  <Input
                    id="admin-name"
                    placeholder="e.g. Maria Clara"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-email">Email Address</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="admin@brgy178.gov.ph"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="admin-password"
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-phone">Contact Number <span className="text-muted-foreground font-normal">(optional)</span></Label>
                  <Input
                    id="admin-phone"
                    type="tel"
                    placeholder="09XX XXX XXXX"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  />
                </div>

                <div className="space-y-3 pt-4 border-t border-border">
                  <Label className="text-base font-semibold">Module Permissions</Label>
                  <p className="text-xs text-muted-foreground">Select the modules this admin can access. (Dashboard and Profile are always allowed).</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {AVAILABLE_MODULES.map(module => (
                      <label key={module} className="flex items-center space-x-2 cursor-pointer bg-secondary/30 p-2 rounded-md border border-border/50 hover:bg-secondary transition-colors">
                        <Checkbox 
                          checked={newUser.allowed_modules.includes(module)}
                          onCheckedChange={() => handleModuleToggle(module)}
                        />
                        <span className="text-sm font-medium">{module}</span>
                      </label>
                    ))}
                  </div>
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
                <Button onClick={createAdmin} disabled={creating}>
                  {creating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Creating…
                    </>
                  ) : (
                    "Create Admin Account"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-border shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search admins..."
            className="pl-9 bg-secondary/50 border-none focus-visible:ring-1"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">{filtered.length}</span> admin(s)
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loadingUsers ? (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-muted-foreground">
            <RefreshCw className="h-8 w-8 animate-spin mb-4" />
            <p>Loading admin accounts...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground bg-secondary/30 rounded-xl border border-dashed border-border">
            <UserX className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <p>No admins found.</p>
          </div>
        ) : (
          filtered.map((user) => (
            <Card key={user.id} className={cn("overflow-hidden transition-all hover:shadow-md", !user.is_active && "opacity-60 grayscale")}>
              <CardContent className="p-0">
                <div className="p-5 flex flex-col items-center text-center space-y-3 relative">
                  <div className="absolute top-3 right-3">
                    <Badge variant={user.is_active ? "outline" : "secondary"} className={cn("text-[10px]", user.is_active && "border-green-200 bg-green-50 text-green-700")}>
                      {user.is_active ? "Active" : "Disabled"}
                    </Badge>
                  </div>
                  
                  <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-display text-xl font-bold uppercase ring-4 ring-white shadow-sm">
                    {user.name?.charAt(0) || "A"}
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="font-semibold leading-tight">{user.name}</h3>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    {user.phone && <p className="text-xs text-muted-foreground">{user.phone}</p>}
                  </div>

                  <div className="w-full pt-3">
                    <p className="text-xs font-semibold text-left mb-2">Modules Allowed:</p>
                    <div className="flex flex-wrap gap-1">
                      {user.allowed_modules?.length > 0 ? (
                        user.allowed_modules.map(m => (
                          <span key={m} className="px-2 py-0.5 bg-secondary text-[10px] rounded text-muted-foreground">
                            {m}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs italic text-muted-foreground">No extra modules (Dashboard only)</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-secondary/50 border-t border-border p-3 flex justify-between items-center">
                  <span className="text-[10px] text-muted-foreground">Joined: {new Date(user.created_at).toLocaleDateString()}</span>
                  <div className="flex gap-2">
                    <Button 
                      variant={user.is_active ? "destructive" : "default"} 
                      size="sm" 
                      className="h-7 text-xs px-2"
                      onClick={() => toggleActive(user)}
                    >
                      {user.is_active ? "Disable" : "Enable"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
