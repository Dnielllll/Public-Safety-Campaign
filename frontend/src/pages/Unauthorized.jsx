import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4 bg-background">
      <ShieldAlert className="h-14 w-14 text-destructive mb-4" />
      <h1 className="font-display text-2xl font-bold mb-2">Access Denied</h1>
      <p className="text-muted-foreground mb-6 max-w-sm">You don't have permission to view this page.</p>
      <Button asChild><Link to="/">Back to Home</Link></Button>
    </div>
  );
}
