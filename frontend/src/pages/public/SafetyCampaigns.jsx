import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Search, Filter, Volume2, ArrowRight, Megaphone } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabaseHelpers } from "@/lib/supabase.js";
import { generateAIResponse } from "@/lib/ai.js";

const categories = ["All", "Fire Safety", "Disaster Preparedness", "Health", "Anti-Drug", "Road Safety", "Environment", "Crime Prevention"];
const priorities = ["All", "critical", "high", "medium", "low"];
const priorityVariant = { critical: "destructive", high: "warning", medium: "secondary", low: "outline" };

export default function SafetyCampaigns() {
  const { id } = useParams();
  const [campaigns, setCampaigns] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [priority, setPriority] = useState("All");
  const [selected, setSelected] = useState(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    supabaseHelpers.getCampaigns({ status: "published" })
      .then(({ data }) => setCampaigns(Array.isArray(data) ? data : []))
      .catch(() => setCampaigns(mockCampaigns));
  }, []);

  useEffect(() => {
    if (id) {
      const found = campaigns.find((c) => String(c.id) === String(id));
      if (found) setSelected(found);
    }
  }, [id, campaigns]);

  const filtered = campaigns.length ? campaigns : mockCampaigns;
  const displayed = filtered.filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || (c.objectives || "").toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || (c.category || "").replace("_", " ").toLowerCase().includes(category.toLowerCase());
    const matchPri = priority === "All" || c.priority === priority;
    return matchSearch && matchCat && matchPri;
  });

  const handleListen = (campaign) => {
    if (playing === campaign.id) {
      window.speechSynthesis.cancel();
      setPlaying(null);
      return;
    }

    window.speechSynthesis.cancel(); // Stop any currently playing audio
    setPlaying(campaign.id);

    const utterance = new SpeechSynthesisUtterance(`${campaign.title}. ${campaign.objectives}`);
    utterance.rate = 0.9; // Slightly slower for better clarity
    
    utterance.onend = () => setPlaying(null);
    utterance.onerror = () => setPlaying(null);

    window.speechSynthesis.speak(utterance);
  };

  if (selected) {
    return (
      <div className="container py-8">
        <button onClick={() => setSelected(null)} className="text-sm text-primary mb-4 flex items-center gap-1 hover:underline">
          ← Back to campaigns
        </button>
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge variant={priorityVariant[selected.priority] || "secondary"}>{selected.priority} priority</Badge>
              <Badge variant="outline">{selected.category?.replace("_", " ")}</Badge>
            </div>
            <CardTitle className="text-2xl">{selected.title}</CardTitle>
            <CardDescription className="text-base">{selected.objectives}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{selected.description || "No additional description provided."}</p>
            <Button onClick={() => handleListen(selected)} disabled={playing === selected.id} variant="outline">
              <Volume2 className="h-4 w-4 mr-2" />
              {playing === selected.id ? "Playing…" : "Listen via AI Voice (Google TTS)"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <Megaphone className="h-6 w-6 text-primary" /> Safety Campaigns
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Browse and search public safety awareness campaigns from Barangay 178.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search campaigns…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categories.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          {priorities.map((p) => <option key={p}>{p}</option>)}
        </select>
      </div>

      {/* Campaign grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayed.map((c) => (
          <Card key={c.id} className="hover:shadow-md transition-shadow flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between mb-1">
                <Badge variant={priorityVariant[c.priority] || "secondary"}>{c.priority}</Badge>
                <span className="text-xs text-muted-foreground capitalize">{c.category?.replace("_", " ")}</span>
              </div>
              <CardTitle className="text-base">{c.title}</CardTitle>
              <CardDescription>{c.objectives}</CardDescription>
            </CardHeader>
            <CardFooter className="justify-between mt-auto">
              <Button variant="ghost" size="sm" onClick={() => setSelected(c)}>
                Read more <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleListen(c)} disabled={playing === c.id}>
                <Volume2 className="h-4 w-4 mr-1" />
                {playing === c.id ? "Playing…" : "Listen"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {displayed.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Megaphone className="h-10 w-10 mx-auto mb-2 opacity-30" />
          <p>No campaigns found matching your filters.</p>
        </div>
      )}
    </div>
  );
}

const mockCampaigns = [
  { id: 1, title: "Fire Safety Reminders for the Dry Season", objectives: "Reduce fire incidents in residential areas.", category: "fire_safety", priority: "high" },
  { id: 2, title: "Flood Evacuation Route Advisory", objectives: "Guide residents on the nearest evacuation centers.", category: "disaster_prep", priority: "critical" },
  { id: 3, title: "Dengue Prevention Campaign", objectives: "Promote 4S strategy against dengue.", category: "health", priority: "medium" },
  { id: 4, title: "Community Clean-Up Drive", objectives: "Keep our barangay clean and healthy.", category: "environment", priority: "low" },
  { id: 5, title: "Anti-Drug Awareness Program", objectives: "Educate residents on the dangers of drug abuse.", category: "anti_drug", priority: "high" },
  { id: 6, title: "Road Safety Campaign", objectives: "Promote safe driving and pedestrian habits.", category: "road_safety", priority: "medium" },
];
