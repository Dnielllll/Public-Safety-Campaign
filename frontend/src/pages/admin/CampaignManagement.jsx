import React, { useState } from "react";
import { Plus, Search, Calendar, Archive, Trash2, Wand2, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { generateAIResponse } from "@/lib/ai.js";

const initialCampaigns = [
  { id: 1, title: "Fire Safety Reminders for the Dry Season", category: "fire_safety", priority: "high", status: "published" },
  { id: 2, title: "Flood Evacuation Route Advisory", category: "disaster_prep", priority: "critical", status: "pending_approval" },
  { id: 3, title: "Dengue Prevention Campaign", category: "health", priority: "medium", status: "draft" },
  { id: 4, title: "Anti-Scam Awareness", category: "crime_prevention", priority: "medium", status: "archived" },
];

const statusVariant = {
  draft: "outline",
  pending_approval: "warning",
  approved: "secondary",
  published: "success",
  rejected: "destructive",
  archived: "outline",
};

export default function CampaignManagement() {
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", objectives: "", audience: "", category: "general", priority: "medium" });
  const [isGenerating, setIsGenerating] = useState(false);

  const filtered = campaigns.filter((c) => c.title.toLowerCase().includes(query.toLowerCase()));

  const handleAIGenerate = async () => {
    if (!form.title) {
      alert("Please enter a topic in the title field first (e.g. 'Typhoon Preparation')");
      return;
    }
    setIsGenerating(true);
    try {
      const prompt = `Write a professional public safety campaign about: "${form.title}". 
Return a JSON object with strictly these keys:
"title": a catchy official title,
"objectives": 2-3 sentences explaining the goal and actions,
"audience": who this is for (e.g. 'All residents', 'Senior citizens'),
"category": one of (emergency, health, fire_safety, disaster_prep, crime_prevention, general),
"priority": one of (low, medium, high, critical).
Do not wrap in markdown or backticks, return raw JSON string.`;

      const response = await generateAIResponse("You are an expert public safety officer for a local government.", prompt);
      const data = JSON.parse(response.replace(/```json/g, "").replace(/```/g, "").trim());
      
      setForm({ ...form, ...data });
    } catch (error) {
      console.error(error);
      alert("Failed to generate AI content. Error: " + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const createCampaign = () => {
    setCampaigns((prev) => [
      { id: prev.length + 1, title: form.title, category: form.category, priority: form.priority, status: "draft" },
      ...prev,
    ]);
    setForm({ title: "", objectives: "", audience: "", category: "general", priority: "medium" });
    setOpen(false);
  };

  const archive = (id) => setCampaigns((p) => p.map((c) => (c.id === id ? { ...c, status: "archived" } : c)));
  const remove = (id) => setCampaigns((p) => p.filter((c) => c.id !== id));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Campaign Management</h1>
          <p className="text-muted-foreground text-sm">Create, edit, schedule, and manage public safety campaigns.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> New Campaign</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create New Campaign</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Campaign Topic or Title</Label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleAIGenerate} 
                    disabled={isGenerating || !form.title}
                    className="h-8 text-primary hover:text-primary hover:bg-primary/10"
                  >
                    {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Wand2 className="h-4 w-4 mr-2" />}
                    Generate with AI
                  </Button>
                </div>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Type a topic and click Generate..." />
              </div>
              <div className="space-y-2">
                <Label>Objectives</Label>
                <Textarea value={form.objectives} onChange={(e) => setForm({ ...form, objectives: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Target audience</Label>
                <Input value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} placeholder="e.g. All residents, Senior citizens" />
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={createCampaign}>Save as Draft</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search campaigns…" className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map((c) => (
          <Card key={c.id}>
            <CardHeader>
              <div className="flex items-center justify-between mb-1">
                <Badge variant={statusVariant[c.status]}>{c.status.replace("_", " ")}</Badge>
                <Badge variant="outline">{c.priority}</Badge>
              </div>
              <CardTitle className="text-base">{c.title}</CardTitle>
              <CardDescription className="capitalize">{c.category.replace("_", " ")}</CardDescription>
            </CardHeader>
            <CardFooter className="justify-between">
              <Button variant="ghost" size="sm"><Calendar className="h-4 w-4 mr-1" /> Edit / Schedule</Button>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => archive(c.id)}><Archive className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => remove(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
