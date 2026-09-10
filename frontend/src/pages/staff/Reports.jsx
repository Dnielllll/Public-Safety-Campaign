import React, { useState, useEffect } from "react";
import { BarChart3, Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { supabaseHelpers } from "@/lib/supabase.js";

export default function StaffReports() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    const { user } = await supabaseHelpers.getAuthUser();
    if (user) {
      const { data: campaigns } = await supabaseHelpers.getCampaigns({ created_by: user.id });
      if (campaigns && campaigns.length > 0) {
        const reportData = await Promise.all(
          campaigns.map(async (c) => {
            const { data: engagements } = await supabaseHelpers.getEngagementByCampaign(c.id);
            return {
              campaign: c.title.length > 15 ? c.title.substring(0, 15) + "..." : c.title,
              engagement: engagements ? engagements.length : 0
            };
          })
        );
        setData(reportData);
      } else {
        setData([]);
      }
    }
    setLoading(false);
  };

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
          <CardDescription>Total engagements per campaign</CardDescription>
        </CardHeader>
        <CardContent className="h-72 flex items-center justify-center">
          {loading ? (
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          ) : data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="campaign" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="engagement" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-sm">No campaign data available.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
