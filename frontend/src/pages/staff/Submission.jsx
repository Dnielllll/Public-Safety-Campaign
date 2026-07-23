import React, { useState } from "react";
import { Send, Clock, CheckCircle2, XCircle, MessageSquare } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const statusMeta = {
  draft: { label: "Not submitted", variant: "outline", icon: Clock },
  pending_approval: { label: "Pending review", variant: "warning", icon: Clock },
  approved: { label: "Approved", variant: "success", icon: CheckCircle2 },
  needs_revision: { label: "Needs revision", variant: "destructive", icon: MessageSquare },
};

const initial = [
  { id: 1, title: "Anti-Scam Awareness", status: "draft" },
  { id: 2, title: "Flood Evacuation Route Advisory", status: "pending_approval" },
  { id: 3, title: "Community Curfew Reminder", status: "needs_revision", comment: "Please clarify curfew hours for minors vs. adults." },
];

export default function CampaignSubmission() {
  const [campaigns, setCampaigns] = useState(initial);

  const submit = (id) =>
    setCampaigns((c) => c.map((x) => (x.id === id ? { ...x, status: "pending_approval" } : x)));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <Send className="h-6 w-6 text-primary" /> Campaign Submission
        </h1>
        <p className="text-muted-foreground text-sm">Submit completed drafts for admin review and track their approval status.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {campaigns.map((c) => {
          const meta = statusMeta[c.status];
          const Icon = meta.icon;
          return (
            <Card key={c.id}>
              <CardHeader>
                <Badge variant={meta.variant} className="w-fit mb-1 gap-1"><Icon className="h-3 w-3" /> {meta.label}</Badge>
                <CardTitle className="text-base">{c.title}</CardTitle>
                {c.comment && <CardDescription className="text-destructive">Admin comment: "{c.comment}"</CardDescription>}
              </CardHeader>
              <CardFooter>
                {c.status === "draft" || c.status === "needs_revision" ? (
                  <Button onClick={() => submit(c.id)} className="w-full">
                    <Send className="h-4 w-4 mr-1" /> {c.status === "needs_revision" ? "Resubmit" : "Submit for Review"}
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full" disabled>Awaiting Admin Decision</Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
