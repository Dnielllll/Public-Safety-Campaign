import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth.jsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import LoginOverlay from "@/components/LoginOverlay.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [pendingDest, setPendingDest] = useState("/");
  const [loggedInUser, setLoggedInUser] = useState(null);

  React.useEffect(() => {
    if (localStorage.getItem("logged_out") === "true") {
      setSuccessMsg("Logged out successfully.");
      localStorage.removeItem("logged_out");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);
    try {
      const user = await login(form);
      
      // Validate user role before navigation
      if (!user || !user.role) {
        setError("Invalid user account. Please contact administrator.");
        return;
      }

      // Determine destination based on role - always go to role dashboard
      // Never use saved location to ensure users always land on their correct dashboard
      let dest = "/";
      if (user.role === "admin") {
        dest = "/admin";
      } else if (user.role === "staff") {
        dest = "/staff";
      } else if (user.role === "public") {
        dest = "/";
      } else {
        setError("Invalid user role. Please contact administrator.");
        return;
      }

      // Show animated overlay before navigating
      setLoggedInUser(user);
      setPendingDest(dest);
      setLoggingIn(true);
    } catch (err) {
      setError(err.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const doNavigate = () => {
    navigate(pendingDest, { replace: true });
  };

  return (
    <div className="min-h-screen flex bg-barangay">
      {loggingIn && <LoginOverlay userName={loggedInUser?.name} onDone={doNavigate} />}
      {/* Left overlay panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-black/70 via-black/50 to-primary/30 text-white">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img src="/logo.png" alt="Barangay 178 Seal" className="h-14 w-14 rounded-full object-contain bg-white/10 p-1" />
            <div className="text-left">
              <p className="font-display font-bold text-lg leading-tight text-white">Barangay 178</p>
              <p className="text-xs text-white/70">Camarin, North Caloocan City</p>
            </div>
          </Link>
        </div>
        <div>
          <h2 className="font-display text-4xl font-bold mb-4 leading-tight">
            Safety Campaign<br />Management System
          </h2>
          <p className="text-white/80 text-sm leading-relaxed max-w-sm">
            Empowering Barangay 178 officials and residents with AI-powered public safety campaigns, emergency alerts, and voice announcements powered by Google Cloud Text-to-Speech.
          </p>
          <div className="flex gap-2 mt-6 flex-wrap">
            {["Faith", "Love", "Service"].map((v) => (
              <span key={v} className="px-3 py-1 rounded-full bg-white/15 text-xs font-semibold backdrop-blur-sm border border-white/20">{v}</span>
            ))}
          </div>
        </div>
        <p className="text-xs text-white/50">© {new Date().getFullYear()} Barangay 178 · AI Voice by Google Cloud TTS</p>
      </div>

      {/* Right login form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white/90 backdrop-blur-md lg:bg-white/95 relative">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center mb-6 text-center">
            <Link to="/" className="flex flex-col items-center hover:opacity-80 transition-opacity">
              <img src="/logo.png" alt="Barangay 178 Seal" className="h-16 w-16 rounded-full object-contain mb-3 shadow-lg" />
              <h1 className="font-display text-xl font-bold text-foreground">Barangay 178</h1>
            </Link>
            <p className="text-sm text-muted-foreground mt-1">Safety Campaign Management System</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Log in</CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                </div>
                {error && <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</p>}
                {successMsg && (
                  <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">
                    {successMsg}
                  </p>
                )}
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={loading} loading={loading}>
                  {loading ? "Signing in…" : "Sign in"}
                </Button>

                <p className="text-xs text-muted-foreground text-center w-full">
                  New resident?{" "}
                  <Link to="/register" className="text-primary font-medium hover:underline">
                    Create a resident account
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
