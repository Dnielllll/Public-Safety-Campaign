import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase, supabaseHelpers } from "@/lib/supabase.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper: given a Supabase auth user, ensure public.users profile exists
  // This self-heals if the handle_new_user trigger didn't fire
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

    try {
      // Try to fetch existing profile
      const { data: profile, error } = await supabaseHelpers.getUserById(authUser.id);
      if (profile) return profile;

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
        return fallbackProfile;
      }

      return created || fallbackProfile;
    } catch (err) {
      console.error("ensureProfile error:", err);
      // Always return something usable — never block login
      return fallbackProfile;
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

  // Login using Supabase Auth
  const login = async (credentials) => {
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
  };

  // Logout using Supabase Auth
  const logout = async () => {
    await supabaseHelpers.signOut();
    localStorage.setItem("logged_out", "true");
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
