import React, { useState } from "react";
import { BellRing, Send, CheckCircle2, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const initial = [
  { id: 1, campaign: "Fire Safety Reminders", channel: "SMS", status: "delivered" },
  { id: 2, campaign: "Fire Safety Reminders", channel: "Email", status: "delivered" },
];

export default function StaffNotifications() {
  const [notifs] = useState(initial);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <BellRing className="h-6 w-6 text-primary" /> Notification Management
        </h1>
        <p className="text-muted-foreground text-sm">Send scheduled notifications for your approved campaigns and monitor delivery.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="p-4 font-medium">Campaign</th>
                <th className="p-4 font-medium">Channel</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {notifs.map((n) => (
                <tr key={n.id} className="border-b border-border last:border-0 hover:bg-secondary/40">
                  <td className="p-4 font-medium">{n.campaign}</td>
                  <td className="p-4">{n.channel}</td>
                  <td className="p-4">
                    <Badge variant="success" className="gap-1"><CheckCircle2 className="h-3 w-3" /> {n.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card className="bg-secondary/50 border-dashed">
        <CardContent className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">You can only send notifications for campaigns approved by the admin.</p>
          </div>
          <Button variant="outline" size="sm" disabled><Send className="h-4 w-4 mr-1" /> Send</Button>
        </CardContent>
      </Card>
    </div>
  );
}
