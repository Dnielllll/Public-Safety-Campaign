import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { supabase, supabaseHelpers } from "@/lib/supabase.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const loginInProgress = useRef(false); // guard against race with onAuthStateChange

  const ensureProfile = async (authUser) => {
    if (!authUser) return null;

    // Build fallback profile from auth metadata (always available)
    const meta = authUser.user_metadata || {};
    const fallbackProfile = {
      id: authUser.id,
      email: authUser.email,
      name: meta.name || authUser.email?.split("@")[0] || "User",
      role: meta.role || "public",
      phone: meta.phone || null,
      address: meta.address || null,
      is_active: true,
      _fromMetadata: true, // flag to know this came from fallback
    };

    // Normalise role: treat 'superadmin' (DB value) as 'super_admin' (frontend value)
    const normaliseRole = (profile) => {
      if (!profile) return profile;
      if (profile.role === "superadmin") return { ...profile, role: "super_admin" };
      return profile;
    };

    try {
      // Try to fetch existing profile
      const { data: profile, error } = await supabaseHelpers.getUserById(authUser.id);
      if (profile) return normaliseRole(profile);

      // Profile missing — auto-create from auth user metadata
      console.warn("public.users profile missing for", authUser.id, "— auto-creating from auth metadata");
      console.log("Auth user metadata:", JSON.stringify(meta));

      const { data: created, error: createErr } = await supabaseHelpers.createUser({
        id: authUser.id,
        email: authUser.email,
        name: fallbackProfile.name,
        role: fallbackProfile.role,
        phone: fallbackProfile.phone,
        address: fallbackProfile.address,
        is_active: true,
      });

      if (createErr) {
        console.error("Failed to auto-create user profile:", createErr);
        // Return fallback from auth metadata so login still works
        return normaliseRole(fallbackProfile);
      }

      return normaliseRole(created || fallbackProfile);
    } catch (err) {
      console.error("ensureProfile error:", err);
      // Always return something usable — never block login
      return normaliseRole(fallbackProfile);
    }
  };

  useEffect(() => {
    // On mount: check existing Supabase session
    const initSession = async () => {
      try {
        const { session } = await supabaseHelpers.getSession();
        if (session?.user) {
          const profile = await ensureProfile(session.user);
          setUser(profile);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("AuthProvider: session init failed:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initSession();

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth event:", event);
      if (event === "SIGNED_IN" && session?.user) {
        // Skip — login() already handles profile fetch & setUser to avoid race condition
        if (loginInProgress.current) return;
        const profile = await ensureProfile(session.user);
        setUser(profile);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        // keep current user, just refresh token silently
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Session timeout logic
  const timeoutRef = useRef(null);

  useEffect(() => {
    const resetTimeout = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (!user) return;

      const timeoutMs = (user.role === "super_admin" || user.role === "admin" || user.role === "staff") 
        ? 15 * 60 * 1000 // 15 minutes for super_admin/admin/staff
        : 30 * 60 * 1000; // 30 minutes for citizen

      timeoutRef.current = setTimeout(() => {
        // Inactivity timeout reached
        localStorage.setItem("logout_message", "Your session has expired due to inactivity. Please log in again.");
        logout();
      }, timeoutMs);
    };

    const handleActivity = () => {
      resetTimeout();
    };

    const events = ["mousemove", "keydown", "scroll", "click"];

    if (user) {
      events.forEach((event) => window.addEventListener(event, handleActivity));
      resetTimeout();
    } else {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }

    return () => {
      events.forEach((event) => window.removeEventListener(event, handleActivity));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [user]);

  // Login using Supabase Auth
  const login = async (credentials) => {
    loginInProgress.current = true;
    try {
      const { data, error } = await supabaseHelpers.signIn(credentials.email, credentials.password);

      if (error) {
        // Friendly error messages
        if (error.message?.toLowerCase().includes("invalid login credentials")) {
          throw new Error("Invalid email or password. Please try again.");
        }
        throw new Error(error.message || "Login failed. Please try again.");
      }

      if (!data?.user) {
        throw new Error("Login failed. Please try again.");
      }

      // Fetch or auto-create user profile from public.users
      // ensureProfile ALWAYS returns a profile (falls back to auth metadata)
      const profile = await ensureProfile(data.user);

      if (profile && !profile.is_active) {
        await supabaseHelpers.signOut();
        throw new Error("Your account has been deactivated. Please contact the administrator.");
      }

      setUser(profile);
      return profile;
    } finally {
      loginInProgress.current = false;
    }
  };

  // Logout using Supabase Auth
  const logout = async () => {
    await supabaseHelpers.signOut();
    if (!localStorage.getItem("logout_message")) {
      localStorage.setItem("logged_out", "true");
    }
    setUser(null);
  };


  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
