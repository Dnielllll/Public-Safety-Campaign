import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "react-router-dom";
import Maintenance from "@/pages/Maintenance";

export default function MaintenanceGuard({ children }) {
  const { user, maintenanceMode, loading } = useAuth();
  const location = useLocation();
  const [showMaintenance, setShowMaintenance] = useState(false);

  const checkMaintenanceStatus = () => {
    console.log("=== MaintenanceGuard Check ===");
    
    // Check localStorage directly as primary source (more reliable)
    const localMaintenance = localStorage.getItem('maintenance_mode') === 'true';
    
    console.log("localStorage values:", { 
      maintenance_mode: localStorage.getItem('maintenance_mode'),
      parsed: { maintenance: localMaintenance }
    });
    
    console.log("Auth context values:", { maintenanceMode, loading, userRole: user?.role, pathname: location.pathname });
    
    // Use localStorage values as primary (more reliable than context)
    const effectiveMaintenance = localMaintenance;
    
    // Don't show maintenance page for public routes, login/register
    const publicPaths = [
      '/login', '/register', '/maintenance', '/unauthorized',
      '/', '/campaigns', '/emergency', '/about', '/voice-announcements', '/notifications'
    ];
    
    const isPublicRoute = publicPaths.includes(location.pathname) || 
                          location.pathname.startsWith('/campaigns/');
                          
    if (isPublicRoute) {
      console.log("MaintenanceGuard: Public route, skipping check:", location.pathname);
      setShowMaintenance(false);
      return;
    }

    // Wait for auth to load before checking maintenance mode
    if (loading) {
      console.log("MaintenanceGuard: Still loading auth state");
      return;
    }

    // If no user is logged in, let the app's routing handle them (they'll be redirected to /login by RequireRole)
    if (!user) {
      console.log("MaintenanceGuard: No user, allowing RequireRole to redirect to login");
      setShowMaintenance(false);
      return;
    }

    // Show maintenance page if:
    // 1. Maintenance mode is enabled AND
    // 2. User is not logged in OR user is not super_admin
    console.log("MaintenanceGuard check:", { 
      effectiveMaintenance, 
      userRole: user?.role, 
      userId: user?.id,
      pathname: location.pathname 
    });
    
    // Check for maintenance mode (blocks everyone except super_admin)
    if (effectiveMaintenance) {
      if (!user || (user.role !== 'super_admin' && user.role !== 'superadmin')) {
        console.log("MaintenanceGuard: SHOWING maintenance page for:", user?.role || 'no user');
        setShowMaintenance(true);
      } else {
        console.log("MaintenanceGuard: Allowing access for super admin during maintenance:", user.role);
        setShowMaintenance(false);
      }
    } else {
      console.log("MaintenanceGuard: Normal operation, no restrictions");
      setShowMaintenance(false);
    }
    
    console.log("=== MaintenanceGuard Decision ===");
    console.log("showMaintenance:", showMaintenance);
  };

  useEffect(() => {
    checkMaintenanceStatus();
    
    // Listen for localStorage changes
    const handleStorageChange = (e) => {
      if (e.key === 'maintenance_mode') {
        console.log("localStorage changed, rechecking maintenance status");
        checkMaintenanceStatus();
      }
    };
    
    // Listen for custom events from SystemSettings
    const handleCustomEvent = (e) => {
      console.log("Custom maintenance event received:", e.detail);
      checkMaintenanceStatus();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('maintenanceModeChanged', handleCustomEvent);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('maintenanceModeChanged', handleCustomEvent);
    };
  }, [maintenanceMode, user, location.pathname, loading]);

  // Check for maintenance message from login
  useEffect(() => {
    const maintenanceMessage = localStorage.getItem("maintenance_message");
    if (maintenanceMessage) {
      alert(maintenanceMessage);
      localStorage.removeItem("maintenance_message");
    }
  }, []);

  // Show loading state while checking
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (showMaintenance) {
    return <Maintenance />;
  }

  return <>{children}</>;
}