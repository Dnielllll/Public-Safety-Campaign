import React from "react";
import { UserCircle, Lock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth.jsx";

export default function StaffProfile() {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <UserCircle className="h-6 w-6 text-primary" /> Profile Management
        </h1>
        <p className="text-muted-foreground text-sm">Update your personal information and account settings.</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Personal Information</CardTitle></CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Full name</Label>
            <Input defaultValue={user?.name ?? "Juan Dela Cruz"} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input defaultValue={user?.email ?? "juan.delacruz@brgy178.gov.ph"} type="email" />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input defaultValue={user?.phone ?? ""} />
          </div>
          <div className="space-y-2">
            <Label>Position</Label>
            <Input defaultValue="Barangay Staff" disabled />
          </div>
        </CardContent>
        <CardFooter>
          <Button>Save Changes</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Lock className="h-4 w-4 text-primary" /> Change Password</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Current password</Label>
            <Input type="password" />
          </div>
          <div className="space-y-2">
            <Label>New password</Label>
            <Input type="password" />
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline">Update Password</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
