import React, { useState } from "react";
import { Plus, Save, Search } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const initial = [
  { id: 1, title: "Fire Safety Reminders for the Dry Season", status: "published" },
  { id: 2, title: "Flood Evacuation Route Advisory", status: "pending_approval" },
  { id: 3, title: "Anti-Scam Awareness", status: "draft" },
];

const statusVariant = { draft: "outline", pending_approval: "warning", published: "success", rejected: "destructive" };

export default function StaffCampaigns() {
  const [campaigns, setCampaigns] = useState(initial);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", objectives: "", category: "general" });

  const filtered = campaigns.filter((c) => c.title.toLowerCase().includes(query.toLowerCase()));

  const saveDraft = () => {
    setCampaigns((p) => [{ id: p.length + 1, title: form.title, status: "draft" }, ...p]);
    setForm({ title: "", objectives: "", category: "general" });
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Campaign Management</h1>
          <p className="text-muted-foreground text-sm">Create new drafts, edit assigned campaigns, and save your work.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" /> New Draft</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Campaign Draft</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Objectives</Label>
                <Textarea value={form.objectives} onChange={(e) => setForm({ ...form, objectives: e.target.value })} />
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
              <Button onClick={saveDraft}><Save className="h-4 w-4 mr-1" /> Save Draft</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search your campaigns…" className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {filtered.map((c) => (
          <Card key={c.id}>
            <CardHeader>
              <Badge variant={statusVariant[c.status]} className="w-fit mb-1">{c.status.replace("_", " ")}</Badge>
              <CardTitle className="text-base">{c.title}</CardTitle>
              <CardDescription>{c.status === "draft" ? "Unsaved edits — continue when ready" : "Awaiting or completed review"}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full" disabled={c.status !== "draft"}>
                {c.status === "draft" ? "Continue Editing" : "View Details"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
