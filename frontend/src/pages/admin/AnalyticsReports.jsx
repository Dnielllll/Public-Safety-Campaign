import React from "react";
import { BarChart3, Download, TrendingUp, Users, Eye, Share2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const reachData = [
  { campaign: "Fire Safety", reach: 1240, engagement: 842 },
  { campaign: "Flood Advisory", reach: 1560, engagement: 1102 },
  { campaign: "Dengue Prev.", reach: 980, engagement: 610 },
  { campaign: "Anti-Scam", reach: 720, engagement: 401 },
];

const channelSplit = [
  { name: "SMS", value: 42 },
  { name: "Facebook", value: 28 },
  { name: "Email", value: 18 },
  { name: "Website", value: 12 },
];

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--muted-foreground))", "hsl(var(--border))"];

const summary = [
  { label: "Total Campaign Reach", value: "4,500", icon: Eye },
  { label: "Registered Residents Reached", value: "1,842", icon: Users },
  { label: "Avg. Engagement Rate", value: "68%", icon: TrendingUp },
  { label: "Channels Used", value: "6", icon: Share2 },
];

export default function AnalyticsReports() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" /> Analytics & Reports
          </h1>
          <p className="text-muted-foreground text-sm">Campaign reach, engagement, participation, and performance.</p>
        </div>
        <Button variant="outline"><Download className="h-4 w-4 mr-1" /> Export Report</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summary.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardContent className="p-5">
                <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-2">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-2xl font-bold font-display">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Campaign Reach vs. Engagement</CardTitle>
            <CardDescription>Comparing total reach to actual resident engagement per campaign</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reachData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="campaign" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="reach" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} opacity={0.4} />
                <Bar dataKey="engagement" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notification Channel Split</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={channelSplit} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {channelSplit.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Available Reports</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          {["Monthly Campaign Performance — June 2026", "Resident Engagement Summary — Q2 2026", "Notification Delivery Report — June 2026"].map((r) => (
            <div key={r} className="flex items-center justify-between py-3">
              <span className="text-sm font-medium">{r}</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline">PDF</Badge>
                <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
