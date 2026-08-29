import React, { useState, useEffect } from "react";
import { Send, Clock, CheckCircle2, XCircle, MessageSquare, Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabaseHelpers } from "@/lib/supabase.js";

const statusMeta = {
  draft: { label: "Not Submitted", variant: "outline", icon: Clock },
  submitted: { label: "Pending Review", variant: "warning", icon: Clock },
  pending_approval: { label: "Pending Review", variant: "warning", icon: Clock },
  approved: { label: "Approved", variant: "success", icon: CheckCircle2 },
  published: { label: "Published", variant: "success", icon: CheckCircle2 },
  rejected: { label: "Rejected", variant: "destructive", icon: XCircle },
  needs_revision: { label: "Needs Revision", variant: "destructive", icon: MessageSquare },
};

export default function CampaignSubmission() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    setFetching(true);
    try {
      const { user } = await supabaseHelpers.getAuthUser();
      if (user) {
        const { data } = await supabaseHelpers.getCampaigns({ created_by: user.id });
        // Show all campaigns except published ones — staff needs to track status
        const relevant = (data || []).filter(c => c.status !== "published");
        setCampaigns(relevant);
      }
    } catch (err) {
      console.error("Failed to fetch campaigns:", err);
    } finally {
      setFetching(false);
    }
  };

  const submitCampaign = async (id, currentStatus) => {
    setLoading(true);
    try {
      const updateData = { status: "submitted" };
      // Clear admin_notes when resubmitting so previous comment is removed
      if (currentStatus === "needs_revision") {
        updateData.admin_notes = null;
      }
      const { data, error } = await supabaseHelpers.updateCampaign(id, updateData);
      if (data) {
        setCampaigns((prev) => prev.map((c) => c.id === id ? { ...c, status: "submitted", admin_notes: null } : c));
      } else if (error) {
        console.error("Submit error:", error);
        // Optimistic update anyway
        setCampaigns((prev) => prev.map((c) => c.id === id ? { ...c, status: "submitted", admin_notes: null } : c));
      }
    } catch (err) {
      console.error("Failed to submit:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Send className="h-6 w-6 text-primary" /> Campaign Submission
          </h1>
          <p className="text-muted-foreground text-sm">
            Submit completed drafts for admin review and track their approval status.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchCampaigns} disabled={fetching}>
          {fetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-1" />}
          {fetching ? "" : "Refresh"}
        </Button>
      </div>

      {fetching ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
          <span className="text-muted-foreground text-sm">Loading submissions...</span>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Send className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No campaigns to submit.</p>
          <p className="text-sm mt-1">Create a draft in Campaign Management first.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {campaigns.map((c) => {
            const meta = statusMeta[c.status] || statusMeta.draft;
            const Icon = meta.icon;
            const canSubmit = c.status === "draft" || c.status === "needs_revision";
            const isRevision = c.status === "needs_revision";
            return (
              <Card key={c.id} className={isRevision ? "border-amber-300 bg-amber-50/30" : ""}>
                <CardHeader>
                  <Badge variant={meta.variant} className="w-fit mb-1 gap-1">
                    <Icon className="h-3 w-3" /> {meta.label}
                  </Badge>
                  <CardTitle className="text-base">{c.title}</CardTitle>
                  {c.description && (
                    <CardDescription className="line-clamp-2">{c.description}</CardDescription>
                  )}

                  {/* Admin comment box — shown prominently when needs revision */}
                  {isRevision && c.admin_notes && (
                    <div className="mt-3 flex gap-2 items-start rounded-md border border-amber-300 bg-amber-50 p-3">
                      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
                      <div>
                        <p className="text-xs font-semibold text-amber-800 mb-0.5">Admin Comment:</p>
                        <p className="text-sm text-amber-900">&ldquo;{c.admin_notes}&rdquo;</p>
                        <p className="text-xs text-amber-600 mt-1">
                          Please edit the campaign in <strong>Campaign Management</strong> before resubmitting.
                        </p>
                      </div>
                    </div>
                  )}
                </CardHeader>
                <CardFooter>
                  {canSubmit ? (
                    <Button
                      onClick={() => submitCampaign(c.id, c.status)}
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Send className="h-4 w-4 mr-1" />}
                      {isRevision ? "Resubmit for Review" : "Submit for Review"}
                    </Button>
                  ) : (
                    <Button variant="outline" className="w-full" disabled>
                      {c.status === "submitted" || c.status === "pending_approval"
                        ? "Awaiting Admin Decision"
                        : c.status === "published"
                        ? "Published"
                        : c.status === "rejected"
                        ? "Rejected by Admin"
                        : "No action needed"}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
