import React, { useState, useEffect } from "react";
import { Plus, Save, Search, Loader2, AlertTriangle, MessageSquare } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { supabaseHelpers } from "@/lib/supabase.js";

const statusVariant = {
  draft: "outline",
  pending_approval: "warning",
  submitted: "warning",
  published: "success",
  rejected: "destructive",
  needs_revision: "destructive",
};

const statusLabel = {
  draft: "Draft",
  pending_approval: "Pending Review",
  submitted: "Pending Review",
  published: "Published",
  rejected: "Rejected",
  needs_revision: "Needs Revision",
};

export default function StaffCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", objectives: "", category: "general" });
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
        setCampaigns(data && data.length > 0 ? data : []);
      }
    } catch (err) {
      console.error("Failed to fetch campaigns:", err);
    } finally {
      setFetching(false);
    }
  };

  const filtered = campaigns.filter((c) =>
    c.title?.toLowerCase().includes(query.toLowerCase())
  );

  const handleEdit = (campaign) => {
    setForm({
      id: campaign.id,
      title: campaign.title,
      objectives: campaign.description || "",
      category: campaign.campaign_type || "general",
      currentStatus: campaign.status,
      adminNotes: campaign.admin_notes || "",
    });
    setOpen(true);
  };

  const handleNew = () => {
    setForm({ title: "", objectives: "", category: "general" });
    setOpen(true);
  };

  const saveDraft = async () => {
    if (!form.title.trim()) return;
    setLoading(true);
    try {
      const { user } = await supabaseHelpers.getAuthUser();
      if (form.id) {
        const { data } = await supabaseHelpers.updateCampaign(form.id, {
          title: form.title,
          description: form.objectives,
          campaign_type: form.category,
          status: "draft",
        });
        if (data) {
          setCampaigns((prev) => prev.map((c) => (c.id === form.id ? data : c)));
        }
      } else {
        const { data } = await supabaseHelpers.createCampaign({
          title: form.title,
          description: form.objectives,
          campaign_type: form.category,
          status: "draft",
          created_by: user?.id,
        });
        if (data) {
          setCampaigns((prev) => [data, ...prev]);
        }
      }
    } catch (error) {
      console.error("Failed to save draft:", error);
    } finally {
      setForm({ title: "", objectives: "", category: "general" });
      setOpen(false);
      setLoading(false);
    }
  };

  const canEdit = (status) => status === "draft" || status === "needs_revision";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Campaign Management</h1>
          <p className="text-muted-foreground text-sm">
            Create new drafts, revise campaigns, and save your work before submitting.
          </p>
        </div>
        <Dialog open={open} onOpenChange={(val) => {
          if (!val) setForm({ title: "", objectives: "", category: "general" });
          setOpen(val);
        }}>
          <DialogTrigger asChild>
            <Button onClick={handleNew}><Plus className="h-4 w-4 mr-1" /> New Draft</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{form.id ? "Edit Campaign" : "New Campaign Draft"}</DialogTitle>
            </DialogHeader>
            {form.currentStatus === "needs_revision" && (
              <div className="flex gap-2 items-start rounded-md border border-amber-300 bg-amber-50 p-3 text-sm">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
                <div className="text-amber-800">
                  <p className="font-semibold">Needs Revision</p>
                  {form.adminNotes && (
                    <p className="mt-1">Admin comment: &ldquo;{form.adminNotes}&rdquo;</p>
                  )}
                  <p className="mt-1 text-xs text-amber-600">
                    Make your edits, then go to <strong>Submission</strong> to resubmit for review.
                  </p>
                </div>
              </div>
            )}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Campaign title" />
              </div>
              <div className="space-y-2">
                <Label>Description / Objectives</Label>
                <Textarea value={form.objectives} onChange={(e) => setForm({ ...form, objectives: e.target.value })} placeholder="Describe the campaign objectives and key messages..." rows={4} />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="health">Health</SelectItem>
                    <SelectItem value="fire_safety">Fire Safety</SelectItem>
                    <SelectItem value="disaster_prep">Disaster Prep</SelectItem>
                    <SelectItem value="crime_prevention">Crime Prevention</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={saveDraft} disabled={loading || !form.title.trim()}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
                {loading ? "Saving..." : "Save Draft"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search your campaigns..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      {fetching ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
          <span className="text-muted-foreground text-sm">Loading campaigns...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="font-medium">No campaigns yet.</p>
          <p className="text-sm mt-1">Click <strong>New Draft</strong> to create your first campaign.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {filtered.map((c) => {
            const status = c.status || "draft";
            const editable = canEdit(status);
            return (
              <Card key={c.id} className={status === "needs_revision" ? "border-amber-300" : ""}>
                <CardHeader>
                  <Badge variant={statusVariant[status] || "outline"} className="w-fit mb-1">
                    {statusLabel[status] || status}
                  </Badge>
                  <CardTitle className="text-base">{c.title}</CardTitle>
                  {status === "needs_revision" && c.admin_notes ? (
                    <div className="flex gap-1.5 items-start mt-1">
                      <MessageSquare className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-500" />
                      <CardDescription className="text-amber-700 text-xs">
                        Admin: &ldquo;{c.admin_notes}&rdquo;
                      </CardDescription>
                    </div>
                  ) : (
                    <CardDescription>
                      {status === "draft" ? "Continue editing when ready" : status === "needs_revision" ? "Revision requested - click to edit" : "Awaiting or completed review"}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardFooter>
                  <Button
                    variant={status === "needs_revision" ? "default" : "outline"}
                    size="sm"
                    className="w-full"
                    disabled={!editable}
                    onClick={() => editable && handleEdit(c)}
                  >
                    {status === "draft" ? "Continue Editing" : status === "needs_revision" ? "Edit & Revise" : "View Details"}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
