import React, { useState } from "react";
import { CheckSquare, X, MessageSquare } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const initialPending = [
  { id: 1, title: "Flood Evacuation Route Advisory", submittedBy: "Juan Dela Cruz", category: "disaster_prep", priority: "critical" },
  { id: 2, title: "Anti-Scam Awareness", submittedBy: "Pedro Ramos", category: "crime_prevention", priority: "medium" },
];

export default function CampaignApproval() {
  const [pending, setPending] = useState(initialPending);
  const [comment, setComment] = useState("");

  const decide = (id, decision) => {
    setPending((p) => p.filter((c) => c.id !== id));
    setComment("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <CheckSquare className="h-6 w-6 text-primary" /> Campaign Approval
        </h1>
        <p className="text-muted-foreground text-sm">Review campaign drafts submitted by staff before publication.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {pending.map((c) => (
          <Card key={c.id}>
            <CardHeader>
              <div className="flex items-center justify-between mb-1">
                <Badge variant="warning">Pending Approval</Badge>
                <Badge variant={c.priority === "critical" ? "destructive" : "outline"}>{c.priority}</Badge>
              </div>
              <CardTitle className="text-base">{c.title}</CardTitle>
              <CardDescription>Submitted by {c.submittedBy} · {c.category.replace("_", " ")}</CardDescription>
            </CardHeader>
            <CardFooter className="gap-2">
              <Button onClick={() => decide(c.id, "approved")} className="flex-1">
                <CheckSquare className="h-4 w-4 mr-1" /> Approve
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex-1"><MessageSquare className="h-4 w-4 mr-1" /> Request Revision</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Revision Comments — {c.title}</DialogTitle></DialogHeader>
                  <Textarea rows={4} placeholder="Explain what needs to be revised…" value={comment} onChange={(e) => setComment(e.target.value)} />
                  <DialogFooter>
                    <Button variant="outline" onClick={() => decide(c.id, "revision")}>Send Back to Staff</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button variant="ghost" size="icon" onClick={() => decide(c.id, "rejected")}>
                <X className="h-4 w-4 text-destructive" />
              </Button>
            </CardFooter>
          </Card>
        ))}
        {pending.length === 0 && (
          <p className="text-muted-foreground text-sm col-span-full text-center py-12">No campaigns pending approval. 🎉</p>
        )}
      </div>
    </div>
  );
}
