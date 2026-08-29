import React, { useState } from "react";
import { History, Search, User, Megaphone, CheckSquare, Settings } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const actionIcon = {
  "user.": User,
  "campaign.": Megaphone,
  "approval.": CheckSquare,
  "settings.": Settings,
};

const generateLogs = () => {
  const now = new Date();
  
  const formatDate = (date) => {
    const pad = (n) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const getPastDate = (daysAgo, hours, minutes) => {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    if (hours !== undefined && minutes !== undefined) {
      d.setHours(hours, minutes, 0, 0);
    }
    return formatDate(d);
  };

  // Recent logs a few minutes ago
  const min5 = new Date(now.getTime() - 5 * 60000);
  const min9 = new Date(now.getTime() - 9 * 60000);

  return [
    { id: 1, actor: "Maria Santos", action: "campaign.published", entity: "Fire Safety Reminders for the Dry Season", time: formatDate(min5) },
    { id: 2, actor: "Maria Santos", action: "campaign.approved", entity: "Fire Safety Reminders for the Dry Season", time: formatDate(min9) },
    { id: 3, actor: "Juan Dela Cruz", action: "campaign.submitted", entity: "Fire Safety Reminders for the Dry Season", time: getPastDate(1, 16, 10) },
    { id: 4, actor: "Maria Santos", action: "user.deactivated", entity: "Pedro Ramos", time: getPastDate(1, 11, 2) },
    { id: 5, actor: "Maria Santos", action: "settings.updated", entity: "Google Cloud TTS Voice Config", time: getPastDate(3, 14, 22) },
    { id: 6, actor: "Ana Reyes", action: "user.login", entity: "Public Portal", time: getPastDate(3, 8, 15) },
    { id: 7, actor: "Admin User", action: "page.created", entity: "Staff Reports Page", time: getPastDate(7, 9, 30) },
    { id: 8, actor: "Admin User", action: "page.created", entity: "Staff Content Page", time: getPastDate(7, 10, 15) },
    { id: 9, actor: "Admin User", action: "page.created", entity: "Staff Submissions Page", time: getPastDate(7, 11, 0) },
    { id: 10, actor: "Admin User", action: "page.created", entity: "Staff Campaigns Page", time: getPastDate(7, 11, 30) },
  ];
};

const logs = generateLogs();

function iconFor(action) {
  const key = Object.keys(actionIcon).find((k) => action.startsWith(k));
  return actionIcon[key] || History;
}

export default function AuditTrail() {
  const [query, setQuery] = useState("");
  const filtered = logs.filter(
    (l) => l.actor.toLowerCase().includes(query.toLowerCase()) || l.action.includes(query.toLowerCase()) || l.entity.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <History className="h-6 w-6 text-primary" /> Audit Trail
        </h1>
        <p className="text-muted-foreground text-sm">All user activities — logins, campaign changes, approvals, and reports.</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search logs…" className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="p-4 font-medium">Actor</th>
                <th className="p-4 font-medium">Action</th>
                <th className="p-4 font-medium">Entity</th>
                <th className="p-4 font-medium">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => {
                const Icon = iconFor(l.action);
                return (
                  <tr key={l.id} className="border-b border-border last:border-0 hover:bg-secondary/40">
                    <td className="p-4 font-medium">{l.actor}</td>
                    <td className="p-4">
                      <Badge variant="secondary" className="gap-1">
                        <Icon className="h-3 w-3" /> {l.action}
                      </Badge>
                    </td>
                    <td className="p-4 text-muted-foreground">{l.entity}</td>
                    <td className="p-4 text-muted-foreground">{l.time}</td>
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
