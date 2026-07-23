import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase, supabaseHelpers } from "@/lib/supabase.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper: given a Supabase auth session, fetch the public.users profile
  const loadProfile = async (authUser) => {
    if (!authUser) return null;
    const { data: profile } = await supabaseHelpers.getUserById(authUser.id);
    return profile || null;
  };

  useEffect(() => {
    // On mount: check existing Supabase session
    const initSession = async () => {
      try {
        const { session } = await supabaseHelpers.getSession();
        if (session?.user) {
          const profile = await loadProfile(session.user);
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
        const profile = await loadProfile(session.user);
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

    // Fetch user profile from public.users
    const profile = await loadProfile(data.user);
    if (!profile) {
      throw new Error("User account not found. Please contact the administrator.");
    }

    if (!profile.is_active) {
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
