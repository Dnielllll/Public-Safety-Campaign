import React, { useState } from "react";
import { BellRing, RefreshCw, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const statusMeta = {
  delivered: { icon: CheckCircle2, variant: "success" },
  pending: { icon: Clock, variant: "warning" },
  failed: { icon: XCircle, variant: "destructive" },
};

const initialNotifs = [
  { id: 1, campaign: "Fire Safety Reminders", channel: "SMS", status: "delivered", count: 842 },
  { id: 2, campaign: "Fire Safety Reminders", channel: "Email", status: "delivered", count: 620 },
  { id: 3, campaign: "Fire Safety Reminders", channel: "Facebook", status: "pending", count: 0 },
  { id: 4, campaign: "Dengue Prevention Campaign", channel: "SMS", status: "failed", count: 12 },
];

export default function NotificationManagement() {
  const [notifs, setNotifs] = useState(initialNotifs);

  const resend = (id) =>
    setNotifs((n) => n.map((x) => (x.id === id ? { ...x, status: "delivered" } : x)));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <BellRing className="h-6 w-6 text-primary" /> Notification Management
        </h1>
        <p className="text-muted-foreground text-sm">Send, schedule, and monitor delivery of campaign notifications.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="p-4 font-medium">Campaign</th>
                <th className="p-4 font-medium">Channel</th>
                <th className="p-4 font-medium">Recipients</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {notifs.map((n) => {
                const meta = statusMeta[n.status];
                const Icon = meta.icon;
                return (
                  <tr key={n.id} className="border-b border-border last:border-0 hover:bg-secondary/40">
                    <td className="p-4 font-medium">{n.campaign}</td>
                    <td className="p-4">{n.channel}</td>
                    <td className="p-4 text-muted-foreground">{n.count.toLocaleString()}</td>
                    <td className="p-4">
                      <Badge variant={meta.variant} className="gap-1">
                        <Icon className="h-3 w-3" /> {n.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      {n.status === "failed" && (
                        <Button variant="ghost" size="sm" onClick={() => resend(n.id)}>
                          <RefreshCw className="h-4 w-4 mr-1" /> Resend
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
