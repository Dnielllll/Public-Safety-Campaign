import React, { useState, useEffect } from "react";
import { Users, Download, Plus, RefreshCw, Search, Filter, MoreVertical, Edit, Trash2, Mail, Shield, CheckCircle, XCircle, Clock, Loader2, Ban, UserCheck, Calendar, Lock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase, supabaseHelpers, supabaseAdmin } from "@/lib/supabase";
import ExportPasswordDialog from "@/components/ExportPasswordDialog";
import { logAuditEvent } from "@/lib/auditLogger.js";

import { useAuth } from "@/hooks/useAuth";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const { onlineUsers, user } = useAuth();
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showOrphanedUsers, setShowOrphanedUsers] = useState(false);
  const [orphanedUsers, setOrphanedUsers] = useState([]);
  const [loadingOrphaned, setLoadingOrphaned] = useState(false);

  // New user form state
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    role: 'staff',
    password: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  };



  const handleAddUser = async () => {
    try {
      // Validate that password is provided
      if (!newUser.password) {
        alert('Please enter a password for the user.');
        return;
      }
      
      // Use the RPC to securely create the user server-side without disrupting the current admin session
      const { data, error } = await supabase.rpc('create_user_by_admin', {
        p_email: newUser.email,
        p_password: newUser.password,
        p_name: newUser.name,
        p_role: newUser.role,
        p_phone: newUser.phone,
        p_address: newUser.address
      });

      if (error) throw error;
      
      // Log user creation event
      try {
        await logAuditEvent('user.created', 'User Management', user.id, {
          target_user_id: data,
          email: newUser.email,
          role: newUser.role
        });
      } catch (auditError) {
        console.error('Failed to log user creation:', auditError);
      }
      
      setShowAddDialog(false);
      setGeneratedPassword(newUser.password);
      setShowPasswordDialog(true);
      setNewUser({ name: '', email: '', phone: '', address: '', role: 'staff', password: '' });
      await fetchUsers();
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Error adding user: ' + error.message);
    }
  };

  const handleUpdateUser = async () => {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: selectedUser.name,
          phone: selectedUser.phone,
          address: selectedUser.address,
          role: selectedUser.role,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedUser.id);

      if (error) throw error;
      
      // Log user update event
      try {
        await logAuditEvent('user.updated', 'User Management', user.id, {
          target_user_id: selectedUser.id,
          email: selectedUser.email,
          role: selectedUser.role
        });
      } catch (auditError) {
        console.error('Failed to log user update:', auditError);
      }
      
      setShowEditDialog(false);
      setSelectedUser(null);
      await fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Error updating user: ' + error.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    console.log('Attempting to delete user:', userId);
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      console.log('Delete cancelled by user');
      return;
    }

    try {
      // Get user info before deletion for audit logging
      const { data: userInfo } = await supabase
        .from('users')
        .select('email, role, name')
        .eq('id', userId)
        .single();
      
      console.log('Calling complete user deletion for:', userId);
      
      // Use the new complete deletion function
      const { error, warning } = await supabaseHelpers.deleteUserCompletely(userId);

      if (error) {
        console.error('User deletion failed:', error);
        throw error;
      }

      if (warning) {
        console.warn('Deletion completed with warning:', warning);
        alert(`User deleted from database. Warning: ${warning}`);
      } else {
        console.log('User deleted completely (database + auth)');
        alert('User deleted successfully');
      }
      
      // Log user deletion event
      try {
        await logAuditEvent('user.deleted', 'User Management', user.id, {
          target_user_id: userId,
          email: userInfo?.email,
          role: userInfo?.role
        });
      } catch (auditError) {
        console.error('Failed to log user deletion:', auditError);
      }
      
      await fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user: ' + error.message);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedUsers.size} users? This action cannot be undone.`)) return;

    try {
      // Get user info before deletion for audit logging
      const userIds = Array.from(selectedUsers);
      const { data: usersInfo } = await supabase
        .from('users')
        .select('id, email, role')
        .in('id', userIds);
      
      // Delete each user using the complete deletion function
      let failedCount = 0;
      
      for (const userId of userIds) {
        const { error } = await supabaseHelpers.deleteUserCompletely(userId);
        if (error) {
          console.error('Error deleting user:', userId, error);
          failedCount++;
        }
      }

      if (failedCount > 0) {
        alert(`Successfully deleted ${userIds.length - failedCount} users. ${failedCount} users failed to delete.`);
      }
      
      // Log bulk user deletion event
      try {
        await logAuditEvent('user.deleted', 'User Management', user.id, {
          bulk_operation: true,
          affected_users: userIds.length,
          user_details: usersInfo?.map(u => ({
            id: u.id,
            email: u.email,
            role: u.role
          }))
        });
      } catch (auditError) {
        console.error('Failed to log bulk user deletion:', auditError);
      }
      
      setSelectedUsers(new Set());
      setShowBulkActions(false);
      await fetchUsers();
    } catch (error) {
      console.error('Error bulk deleting users:', error);
      alert('Error deleting users: ' + error.message);
    }
  };

  const handleBulkRoleChange = async (newRole) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .in('id', Array.from(selectedUsers));

      if (error) throw error;
      setSelectedUsers(new Set());
      setShowBulkActions(false);
      await fetchUsers();
    } catch (error) {
      console.error('Error bulk updating user roles:', error);
      alert('Error updating user roles: ' + error.message);
    }
  };

  const handleFindOrphanedUsers = async () => {
    setLoadingOrphaned(true);
    try {
      // Get all users from public.users
      const { data: publicUsers, error: publicError } = await supabase
        .from('users')
        .select('id, email');

      if (publicError) throw publicError;

      // Get all auth users using service role client
      if (supabaseAdmin) {
        const { data: { users: authUsers }, error: authError } = await supabaseAdmin.auth.admin.listUsers();
        
        if (authError) throw authError;

        // Find orphaned users (in auth but not in public.users)
        const publicUserIds = new Set(publicUsers.map(u => u.id));
        const orphaned = authUsers.filter(authUser => !publicUserIds.has(authUser.id));

        setOrphanedUsers(orphaned);
        setShowOrphanedUsers(true);
      } else {
        alert('Service role key not configured. Cannot access auth users.');
      }
    } catch (error) {
      console.error('Error finding orphaned users:', error);
      alert('Error finding orphaned users: ' + error.message);
    } finally {
      setLoadingOrphaned(false);
    }
  };

  const handleDeleteOrphanedUser = async (authUserId, email) => {
    if (!confirm(`Are you sure you want to delete orphaned auth user ${email}? This action cannot be undone.`)) {
      return;
    }

    try {
      if (supabaseAdmin) {
        // First, delete any audit trail records for this user
        try {
          const { error: auditError } = await supabase
            .from('audit_trail')
            .delete()
            .eq('user_id', authUserId);
          
          if (auditError) {
            console.warn('Error deleting audit trail records for orphaned user:', auditError);
            // Continue anyway - orphaned users might not have audit records
          }
        } catch (auditError) {
          console.warn('Audit trail cleanup failed for orphaned user:', auditError);
        }

        // Then delete the auth user
        const { error } = await supabaseAdmin.auth.admin.deleteUser(authUserId);
        
        if (error) throw error;

        alert('Orphaned auth user deleted successfully');
        // Refresh the orphaned users list
        handleFindOrphanedUsers();
      } else {
        alert('Service role key not configured.');
      }
    } catch (error) {
      console.error('Error deleting orphaned user:', error);
      alert('Error deleting orphaned user: ' + error.message);
    }
  };

  const handleToggleUserSelection = (userId) => {
    const newSelection = new Set(selectedUsers);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUsers(newSelection);
    setShowBulkActions(newSelection.size > 0);
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
      setShowBulkActions(false);
    } else {
      setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
      setShowBulkActions(true);
    }
  };

  const handleExportUsers = async () => {
    try {
      const csvContent = [
        ['Name', 'Email', 'Phone', 'Address', 'Role', 'Status', 'Created At'].join(','),
        ...filteredUsers.map(user => [
          user.name || '',
          user.email || '',
          user.phone || '',
          user.address || '',
          user.role || '',
          'Active',
          new Date(user.created_at).toLocaleString(),
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      alert('Users exported successfully');
    } catch (error) {
      console.error('Error exporting users:', error);
      alert('Error exporting users: ' + error.message);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || statusFilter === 'active'; // Simplified status check
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const userDate = new Date(user.created_at);
      const now = new Date();
      const daysAgo = parseInt(dateFilter);
      const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      matchesDate = userDate >= cutoffDate;
    }
    
    return matchesSearch && matchesRole && matchesStatus && matchesDate;
  });

  const getRoleBadge = (role) => {
    const colors = {
      super_admin: 'bg-purple-600 text-white',
      admin: 'bg-blue-600 text-white',
      staff: 'bg-green-600 text-white',
      citizen: 'bg-orange-600 text-white',
      public: 'bg-gray-600 text-white',
    };
    return <Badge className={colors[role] || 'bg-gray-600 text-white'}>{role || 'public'}</Badge>;
  };

  const isOnline = (userId) => {
    return onlineUsers.has(userId);
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
          <h1 className="text-2xl font-bold font-display">User Management</h1>
          <p className="text-sm text-muted-foreground">Manage all system users and their permissions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowExportDialog(true)}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleFindOrphanedUsers} disabled={loadingOrphaned}>
            <UserCheck className="h-4 w-4 mr-2" />
            {loadingOrphaned ? 'Scanning...' : 'Find Orphaned Users'}
          </Button>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="Enter user name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="Enter email address"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input
                    value={newUser.address}
                    onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
                    placeholder="Enter address"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      placeholder="Enter password"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={newUser.role} onValueChange={(v) => setNewUser({ ...newUser, role: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setNewUser({ name: '', email: '', phone: '', address: '', role: 'staff', password: '' });
                  setShowAddDialog(false);
                }}>Cancel</Button>
                <Button onClick={handleAddUser}>Add User</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="citizen">Citizen</SelectItem>
                <SelectItem value="public">Public</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="1">Last 24 Hours</SelectItem>
                <SelectItem value="7">Last 7 Days</SelectItem>
                <SelectItem value="30">Last 30 Days</SelectItem>
                <SelectItem value="90">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {showBulkActions && (
        <Card className="border-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="primary">{selectedUsers.size} selected</Badge>
                <span className="text-sm text-muted-foreground">users selected for bulk actions</span>
              </div>
              <div className="flex items-center gap-2">
                <Select onValueChange={handleBulkRoleChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Change role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="citizen">Set as Citizen</SelectItem>
                    <SelectItem value="staff">Set as Staff</SelectItem>
                    <SelectItem value="admin">Set as Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedUsers(new Set())}>
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Users ({filteredUsers.length})</CardTitle>
          <CardDescription>Manage user accounts and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Online</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedUsers.has(user.id)}
                          onCheckedChange={() => handleToggleUserSelection(user.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                            <Users className="h-4 w-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium">{user.name || 'Unknown'}</p>
                            <p className="text-xs text-muted-foreground">{user.phone || 'No phone'}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{user.email || 'No email'}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant={user.is_active ? "success" : "secondary"}>
                            {user.is_active ? "Active" : "Inactive"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(user.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {isOnline(user.id) ? (
                          <Badge variant="success" className="gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Online
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1">
                            <Clock className="h-3 w-3" />
                            Offline
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowEditDialog(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={selectedUser.name || ''}
                  onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={selectedUser.phone || ''}
                  onChange={(e) => setSelectedUser({ ...selectedUser, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input
                  value={selectedUser.address || ''}
                  onChange={(e) => setSelectedUser({ ...selectedUser, address: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  value={selectedUser.role || 'citizen'}
                  onValueChange={(v) => setSelectedUser({ ...selectedUser, role: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="citizen">Citizen</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button onClick={handleUpdateUser}>Update User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Created Successfully</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-800 mb-2">Password</p>
              <div className="bg-white border border-blue-300 rounded p-3">
                <code className="text-lg font-mono text-blue-900">{generatedPassword}</code>
              </div>
              <p className="text-xs text-blue-600 mt-2">
                Please share this password securely with the user.
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => {
                  navigator.clipboard.writeText(generatedPassword);
                  alert('Password copied to clipboard!');
                }}
                variant="outline"
                className="flex-1"
              >
                Copy Password
              </Button>
              <Button 
                onClick={() => setShowPasswordDialog(false)}
                className="flex-1"
              >
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ExportPasswordDialog
        open={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        onConfirm={handleExportUsers}
        title="Export Users"
      />

      {/* Orphaned Users Dialog */}
      <Dialog open={showOrphanedUsers} onOpenChange={setShowOrphanedUsers}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Orphaned Auth Users</DialogTitle>
            <DialogDescription>
              These users exist in Supabase Authentication but not in your user management. 
              They can be safely deleted to clean up your authentication system.
            </DialogDescription>
          </DialogHeader>
          
          {orphanedUsers.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
              <p className="text-muted-foreground">No orphaned users found. Your authentication system is clean!</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Found {orphanedUsers.length} orphaned user(s) in authentication:
              </p>
              
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Last Sign In</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orphanedUsers.map((authUser) => (
                      <TableRow key={authUser.id}>
                        <TableCell className="font-medium">{authUser.email}</TableCell>
                        <TableCell>
                          {new Date(authUser.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {authUser.last_sign_in_at 
                            ? new Date(authUser.last_sign_in_at).toLocaleDateString()
                            : 'Never'}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteOrphanedUser(authUser.id, authUser.email)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Warning:</strong> These users are not associated with any accounts in your system. 
                  Deleting them will remove their authentication records but won't affect any active users.
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setShowOrphanedUsers(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}