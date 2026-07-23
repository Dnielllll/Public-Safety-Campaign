import React, { useState } from "react";
import { UserCircle, Save, Bell, Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth.jsx";

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    name: user?.name ?? "Juan Dela Cruz",
    email: user?.email ?? "juan@example.com",
    phone: user?.phone ?? "",
    address: user?.address ?? "",
  });
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState({ email: true, sms: true, push: false });
  const [saved, setSaved] = useState("");

  const handleProfileSave = (e) => {
    e.preventDefault();
    setSaved("profile");
    setTimeout(() => setSaved(""), 2500);
  };

  const handlePasswordSave = (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) return alert("Passwords do not match.");
    setSaved("password");
    setPasswords({ current: "", new: "", confirm: "" });
    setTimeout(() => setSaved(""), 2500);
  };

  return (
    <div className="container py-8 max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <UserCircle className="h-6 w-6 text-primary" /> Profile Management
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Update your personal information and account settings.</p>
      </div>

      {/* Avatar section */}
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
            {profile.name?.[0] ?? "U"}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{profile.name}</p>
          <p className="text-sm text-muted-foreground">{profile.email}</p>
          <p className="text-xs text-muted-foreground mt-0.5 capitalize">{user?.role ?? "Public Resident"}</p>
        </div>
      </div>

      {/* Personal Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Personal Information</CardTitle>
          <CardDescription>Update your name, contact details, and address.</CardDescription>
        </CardHeader>
        <form onSubmit={handleProfileSave}>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="profile-name">Full Name</Label>
                <Input id="profile-name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-email">Email Address</Label>
                <Input id="profile-email" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-phone">Phone Number</Label>
                <Input id="profile-phone" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-address">Address (Purok/Street)</Label>
                <Input id="profile-address" value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} />
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            {saved === "profile" && (
              <p className="text-sm text-primary flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> Saved successfully!</p>
            )}
            <Button type="submit" className="ml-auto"><Save className="h-4 w-4 mr-2" /> Save Changes</Button>
          </CardFooter>
        </form>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Lock className="h-4 w-4" /> Change Password</CardTitle>
          <CardDescription>Update your account password.</CardDescription>
        </CardHeader>
        <form onSubmit={handlePasswordSave}>
          <CardContent className="space-y-4">
            {["current", "new", "confirm"].map((field) => (
              <div key={field} className="space-y-2">
                <Label htmlFor={`pw-${field}`} className="capitalize">{field === "confirm" ? "Confirm New Password" : `${field.charAt(0).toUpperCase() + field.slice(1)} Password`}</Label>
                <div className="relative">
                  <Input
                    id={`pw-${field}`}
                    type={showPw ? "text" : "password"}
                    value={passwords[field]}
                    onChange={(e) => setPasswords({ ...passwords, [field]: e.target.value })}
                    placeholder="••••••••"
                  />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPw((s) => !s)}>
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter className="justify-between">
            {saved === "password" && <p className="text-sm text-primary flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> Password updated!</p>}
            <Button type="submit" className="ml-auto">Update Password</Button>
          </CardFooter>
        </form>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Bell className="h-4 w-4" /> Notification Preferences</CardTitle>
          <CardDescription>Choose how you receive campaign and emergency notifications.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { key: "email", label: "Email Notifications", desc: "Receive campaign updates via email" },
            { key: "sms", label: "SMS Notifications", desc: "Receive emergency alerts via SMS" },
            { key: "push", label: "Push Notifications", desc: "Browser/app push notifications" },
          ].map((pref) => (
            <div key={pref.key} className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="text-sm font-medium">{pref.label}</p>
                <p className="text-xs text-muted-foreground">{pref.desc}</p>
              </div>
              <button
                type="button"
                onClick={() => setNotifPrefs({ ...notifPrefs, [pref.key]: !notifPrefs[pref.key] })}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${notifPrefs[pref.key] ? "bg-primary" : "bg-muted-foreground/30"}`}
              >
                <span className={`pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg transition-transform ${notifPrefs[pref.key] ? "translate-x-4" : "translate-x-0"}`} />
              </button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
