import React from "react";
import { Megaphone, Users, CheckSquare, TrendingUp, Bell, History, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const stats = [
  { label: "Active Campaigns", value: 12, icon: Megaphone, delta: "+3 this month", to: "/admin/campaigns" },
  { label: "Registered Residents", value: 1842, icon: Users, delta: "+56 this month", to: "/admin/users" },
  { label: "Pending Approvals", value: 4, icon: CheckSquare, delta: "Needs review", to: "/admin/approvals" },
  { label: "Avg. Engagement Rate", value: "68%", icon: TrendingUp, delta: "+5% vs last month", to: "/admin/reports" },
];

const engagementData = [
  { month: "Feb", engagement: 320 },
  { month: "Mar", engagement: 410 },
  { month: "Apr", engagement: 380 },
  { month: "May", engagement: 520 },
  { month: "Jun", engagement: 610 },
  { month: "Jul", engagement: 690 },
];

const recentActivity = [
  { text: 'Admin approved "Flood Evacuation Route Advisory"', time: "12m ago", type: "success" },
  { text: 'Staff Juan D. submitted "Fire Safety Reminders" for review', time: "1h ago", type: "info" },
  { text: "New resident account registered", time: "2h ago", type: "info" },
  { text: "Notification batch sent via SMS + Facebook", time: "4h ago", type: "success" },
  { text: 'Campaign "Dengue Prevention" was published', time: "6h ago", type: "success" },
];

const typeColor = { success: "bg-primary", info: "bg-accent", warning: "bg-yellow-500" };

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Header with background */}
      <div className="rounded-xl overflow-hidden relative bg-barangay min-h-[120px] flex items-end">
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        <div className="relative p-6 flex items-center gap-4">
          <img src="/logo.png" alt="Barangay 178" className="h-12 w-12 rounded-full object-contain border-2 border-white/30" />
          <div className="text-white">
            <h1 className="font-display text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-white/75 text-sm">Barangay 178 · Safety Campaign Management System</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.label} to={s.to} className="group">
              <Card className="hover:shadow-md transition-shadow group-hover:border-primary/40">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <Icon className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-2xl font-bold font-display">{s.value}</p>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-xs text-primary mt-1">{s.delta}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Resident Engagement Trend</CardTitle>
            <CardDescription>Views, reactions, shares, and comments over time</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={engagementData}>
                <defs>
                  <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="engagement" stroke="hsl(var(--primary))" fill="url(#colorEngagement)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><History className="h-4 w-4 text-primary" /> Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex gap-3 text-sm">
                <div className={`h-1.5 w-1.5 rounded-full ${typeColor[a.type] ?? "bg-primary"} mt-2 shrink-0`} />
                <div>
                  <p>{a.text}</p>
                  <p className="text-xs text-muted-foreground">{a.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Bell className="h-4 w-4 text-primary" /> Notification Summary</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Badge variant="success">SMS: 1,204 delivered</Badge>
          <Badge variant="success">Email: 980 delivered</Badge>
          <Badge variant="warning">Facebook: 12 pending</Badge>
          <Badge variant="destructive">Push: 3 failed</Badge>
        </CardContent>
      </Card>
    </div>
  );
}
