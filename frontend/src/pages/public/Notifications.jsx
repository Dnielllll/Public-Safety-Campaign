import React, { useState, useEffect } from "react";
import { Bell, CheckCheck, Megaphone, Siren, BellOff } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NotificationsAPI } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    NotificationsAPI.list()
      .then((res) => setNotifications(res.data.data ?? res.data ?? []))
      .catch(() => setNotifications(mockNotifications))
      .finally(() => setLoading(false));
  }, []);

  const markRead = async (id) => {
    try {
      await NotificationsAPI.markRead(id);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    } catch {
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    }
  };

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const unread = notifications.filter((n) => !n.read).length;
  const list = notifications.length ? notifications : mockNotifications;

  const typeIcon = { emergency: Siren, campaign: Megaphone, reminder: Bell };
  const typeColor = { emergency: "text-destructive", campaign: "text-primary", reminder: "text-accent" };

  return (
    <div className="container py-8 space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" /> Notifications
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Real-time campaign alerts and emergency notifications.</p>
        </div>
        <div className="flex items-center gap-3">
          {unread > 0 && <Badge>{unread} unread</Badge>}
          <Button variant="ghost" size="sm" onClick={markAllRead} disabled={unread === 0}>
            <CheckCheck className="h-4 w-4 mr-1" /> Mark all read
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {list.map((n) => {
          const Icon = typeIcon[n.type] ?? Bell;
          const color = typeColor[n.type] ?? "text-muted-foreground";
          return (
            <Card
              key={n.id}
              className={cn("transition-colors cursor-pointer hover:shadow-sm", !n.read && "border-primary/40 bg-primary/3")}
              onClick={() => !n.read && markRead(n.id)}
            >
              <CardContent className="p-4 flex gap-3">
                <div className={`mt-0.5 shrink-0 ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className={cn("text-sm font-medium", !n.read && "text-primary")}>{n.title}</p>
                    {!n.read && <div className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                  </div>
                  <p className="text-sm text-muted-foreground">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{n.time}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {list.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <BellOff className="h-10 w-10 mx-auto mb-2 opacity-30" />
          <p>No notifications yet. You'll be notified about new campaigns and emergencies.</p>
        </div>
      )}
    </div>
  );
}

const mockNotifications = [
  { id: 1, type: "emergency", title: "Flood Advisory", message: "Heavy rainfall expected. Residents near creek areas should prepare for possible evacuation.", time: "10 minutes ago", read: false },
  { id: 2, type: "campaign", title: "New Campaign: Fire Safety Reminders", message: "A new fire safety campaign has been published for Barangay 178 residents.", time: "2 hours ago", read: false },
  { id: 3, type: "reminder", title: "Dengue Prevention Reminder", message: "Clean your surroundings and eliminate stagnant water to prevent dengue.", time: "Yesterday, 3:00 PM", read: true },
  { id: 4, type: "campaign", title: "Anti-Drug Awareness Program", message: "Join the community anti-drug awareness program this Saturday at the barangay hall.", time: "2 days ago", read: true },
];
