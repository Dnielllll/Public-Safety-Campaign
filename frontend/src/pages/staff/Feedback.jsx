import React, { useState } from "react";
import { MessageSquareText, Flag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const typeVariant = { comment: "secondary", suggestion: "success", complaint: "destructive", concern: "warning" };

const initial = [
  { id: 1, resident: "Marco Villar", type: "comment", message: "Thank you for the fire safety reminders, very helpful!", campaign: "Fire Safety Reminders" },
  { id: 2, resident: "Ana Reyes", type: "suggestion", message: "Maybe add a Tagalog voice option for the announcements.", campaign: "Fire Safety Reminders" },
];

export default function StaffFeedback() {
  const [items] = useState(initial);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <MessageSquareText className="h-6 w-6 text-primary" /> Feedback Monitoring
        </h1>
        <p className="text-muted-foreground text-sm">Review resident comments, suggestions, and concerns for your campaigns.</p>
      </div>

      <div className="space-y-3">
        {items.map((f) => (
          <Card key={f.id}>
            <CardContent className="p-4 flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-sm">{f.resident}</p>
                  <Badge variant={typeVariant[f.type]}>{f.type}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{f.message}</p>
                <p className="text-xs text-muted-foreground mt-1">Re: {f.campaign}</p>
              </div>
              <Button variant="ghost" size="sm"><Flag className="h-4 w-4 mr-1" /> Flag for Admin</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
