import React from "react";
import { BarChart3, Download } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const data = [
  { campaign: "Fire Safety", engagement: 842 },
  { campaign: "Flood Advisory", engagement: 1102 },
  { campaign: "Anti-Scam", engagement: 401 },
];

export default function StaffReports() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" /> Reports
        </h1>
        <p className="text-muted-foreground text-sm">Performance of campaigns you're assigned to.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Engagement — Assigned Campaigns</CardTitle>
          <CardDescription>Views, reactions, shares, and comments</CardDescription>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="campaign" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="engagement" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Exportable Reports</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          {["Fire Safety Reminders — Performance Summary", "Flood Evacuation Route Advisory — Performance Summary"].map((r) => (
            <div key={r} className="flex items-center justify-between py-3">
              <span className="text-sm font-medium">{r}</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline">Authorized</Badge>
                <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
