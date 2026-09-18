import React from "react";
import { WifiOff, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function OfflineMode() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 space-y-6 text-center">
          <div className="flex justify-center">
            <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
              <WifiOff className="h-12 w-12 text-gray-500" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">You're in Offline Mode</h1>
            <p className="text-gray-600">
              The system is currently under maintenance and cannot be accessed at this moment.
            </p>
          </div>

          <Button 
            onClick={() => window.location.href = "/maintenance"} 
            className="w-full"
            variant="outline"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Check Maintenance Status
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
