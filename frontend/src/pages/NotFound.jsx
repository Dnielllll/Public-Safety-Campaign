import React from "react";
import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4 bg-background">
      <Compass className="h-14 w-14 text-primary mb-4" />
      <h1 className="font-display text-2xl font-bold mb-2">Page Not Found</h1>
      <p className="text-muted-foreground mb-6 max-w-sm">The page you're looking for doesn't exist.</p>
      <Button asChild><Link to="/">Back to Home</Link></Button>
    </div>
  );
}
