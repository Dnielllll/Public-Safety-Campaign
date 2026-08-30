import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Key, Eye, EyeOff, Shield } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth.jsx";
import LoginOverlay from "@/components/LoginOverlay.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", otp: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [pendingDest, setPendingDest] = useState("/");
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [showOTP, setShowOTP] = useState(false);
  const [otpExpiry, setOtpExpiry] = useState(null);
  const [otpTimer, setOtpTimer] = useState(120);
  const [isAdminLogin, setIsAdminLogin] = useState(false);

  React.useEffect(() => {
    const logoutMsg = localStorage.getItem("logout_message");
    if (logoutMsg) {
      setError(logoutMsg);
      localStorage.removeItem("logout_message");
    } else if (localStorage.getItem("logged_out") === "true") {
      setSuccessMsg("Logged out successfully.");
      localStorage.removeItem("logged_out");
    }
  }, []);

  // OTP Timer countdown
  React.useEffect(() => {
    let interval;
    if (showOTP && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    } else if (otpTimer === 0) {
      setShowOTP(false);
      setError("OTP expired. Please try again.");
      setForm({ ...form, otp: "" });
    }
    return () => clearInterval(interval);
  }, [showOTP, otpTimer]);

  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Generate OTP
      const otp = generateOTP();
      const expiry = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes expiry
      setOtpExpiry(expiry);
      setOtpTimer(120);

      // Store OTP locally to validate later
      localStorage.setItem(`otp_${form.email}`, JSON.stringify({ otp, expiry: expiry.toISOString() }));

      // For demo: Show OTP in console (in production, use Supabase Auth email OTP)
      console.log("OTP for", form.email, ":", otp);

      setShowOTP(true);
      setSuccessMsg("OTP sent to your email. Valid for 2 minutes.");
    } catch (err) {
      // Clear the stored OTP if email sending failed
      localStorage.removeItem(`otp_${form.email}`);
      setError("Failed to send OTP. Please check your email address or try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const storedOTPData = JSON.parse(localStorage.getItem(`otp_${form.email}`));
      if (!storedOTPData) {
        setError("Invalid or expired OTP. Please request a new one.");
        setLoading(false);
        return;
      }

      const now = new Date();
      const expiry = new Date(storedOTPData.expiry);

      if (now > expiry) {
        setError("OTP expired. Please request a new one.");
        localStorage.removeItem(`otp_${form.email}`);
        setLoading(false);
        return;
      }

      if (form.otp !== storedOTPData.otp) {
        setError("Invalid OTP. Please try again.");
        setLoading(false);
        return;
      }

      // OTP is valid, proceed with password login
      await handlePasswordLogin();
    } catch (err) {
      setError("Invalid OTP. Please try again.");
      setLoading(false);
    }
  };

  const handlePasswordLogin = async () => {
    try {
      const user = await login({ email: form.email, password: form.password });

      // Validate user role before navigation
      if (!user || !user.role) {
        setError("Invalid user account. Please contact administrator.");
        return;
      }

      // Clear OTP after successful login
      localStorage.removeItem(`otp_${form.email}`);

      // Determine destination based on role
      let dest = "/";
      if (user.role === "super_admin") {
        dest = "/super-admin";
      } else if (user.role === "admin") {
        dest = "/admin";
      } else if (user.role === "staff") {
        dest = "/staff";
      } else if (user.role === "public" || user.role === "citizen") {
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

  const handleDirectLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await login({ email: form.email, password: form.password });

      // Validate user role before navigation
      if (!user || !user.role) {
        setError("Invalid user account. Please contact administrator.");
        setLoading(false);
        return;
      }

      // Check if user is admin or super admin - allow direct login
      if (user.role === "super_admin") {
        let dest = "/super-admin";
        setLoggedInUser(user);
        setPendingDest(dest);
        setLoggingIn(true);
      } else if (user.role === "admin") {
        let dest = "/admin";
        setLoggedInUser(user);
        setPendingDest(dest);
        setLoggingIn(true);
      } else {
        // For staff and citizens, generate and require OTP
        const otp = generateOTP();
        const expiry = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes expiry
        setOtpExpiry(expiry);
        setOtpTimer(120);

        // Store OTP in localStorage
        localStorage.setItem(`otp_${form.email}`, JSON.stringify({ otp, expiry: expiry.toISOString() }));

        // Send OTP via email using the notification service
        try {
            await notificationApi.sendOTP({ email: form.email, otp: otp });
            console.log("OTP email sent request successful");
        } catch (err) {
            console.error("Failed to send OTP email:", err);
            setError("Failed to send OTP to your email. Please try again.");
            setLoading(false);
            return;
        }



        setLoading(false);
        setShowOTP(true);
        setSuccessMsg("OTP sent to your email. Valid for 2 minutes.");
      }
    } catch (err) {
      setError(err.message || "Invalid email or password. Please try again.");
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
              <CardTitle>{showOTP ? "Enter OTP" : "Log in"}</CardTitle>
              <CardDescription>
                {showOTP ? `Enter the 6-digit code sent to your email. Expires in ${Math.floor(otpTimer / 60)}:${(otpTimer % 60).toString().padStart(2, '0')}` : ""}
              </CardDescription>
            </CardHeader>
            <form onSubmit={showOTP ? handleOTPSubmit : handleDirectLogin}>
              <CardContent className="space-y-4">
                {!showOTP && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          required
                          placeholder="you@example.com"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          required
                          placeholder="••••••••"
                          value={form.password}
                          onChange={(e) => setForm({ ...form, password: e.target.value })}
                          className="pl-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {showOTP && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="otp">One-Time Password</Label>
                      <div className="relative">
                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="otp"
                          type="text"
                          required
                          placeholder="123456"
                          maxLength={6}
                          value={form.otp}
                          onChange={(e) => setForm({ ...form, otp: e.target.value.replace(/\D/g, '') })}
                          className="pl-10 text-center text-2xl tracking-widest"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          required
                          placeholder="••••••••"
                          value={form.password}
                          onChange={(e) => setForm({ ...form, password: e.target.value })}
                          className="pl-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowOTP(false);
                        setForm({ ...form, otp: "" });
                        setError("");
                      }}
                      className="w-full"
                    >
                      Back to email
                    </Button>
                  </>
                )}

                {error && <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</p>}
                {successMsg && (
                  <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">
                    {successMsg}
                  </p>
                )}
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Processing…" : showOTP ? "Verify & Sign in" : "Sign in"}
                </Button>

                {!showOTP && (
                  <p className="text-xs text-muted-foreground text-center w-full">
                    New resident?{" "}
                    <Link to="/register" className="text-primary font-medium hover:underline">
                      Create a resident account
                    </Link>
                  </p>
                )}
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
