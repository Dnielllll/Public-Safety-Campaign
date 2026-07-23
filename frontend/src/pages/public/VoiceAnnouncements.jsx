import React, { useState, useEffect } from "react";
import { Volume2, Play, Square, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CampaignsAPI } from "@/lib/api";

export default function VoiceAnnouncements() {
  const [campaigns, setCampaigns] = useState([]);
  const [playing, setPlaying] = useState(null);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    CampaignsAPI.list({ status: "published" })
      .then((res) => setCampaigns(res.data.data ?? res.data ?? []))
      .catch(() => setCampaigns(mockCampaigns));
  }, []);

  const handlePlay = (text, id) => {
    if (playing === id) {
      window.speechSynthesis.cancel();
      setPlaying(null);
      return;
    }

    window.speechSynthesis.cancel();
    setPlaying(id);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    
    utterance.onend = () => setPlaying(null);
    utterance.onerror = () => setPlaying(null);

    window.speechSynthesis.speak(utterance);
  };

  const handleCustomPlay = () => {
    if (!customText.trim()) return;
    handlePlay(customText, "custom");
  };

  const list = campaigns.length ? campaigns : mockCampaigns;

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <Volume2 className="h-6 w-6 text-primary" /> AI Voice Announcements
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Listen to public safety announcements read aloud by your device's built-in Text-to-Speech — improving accessibility for all residents.
        </p>
      </div>

      {/* How It Works */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-primary/5 p-4 flex flex-col items-center text-center gap-2">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Volume2 className="h-5 w-5 text-primary" />
          </div>
          <p className="font-semibold text-sm">1. Browse Campaigns</p>
          <p className="text-xs text-muted-foreground">Scroll through official barangay safety announcements below.</p>
        </div>
        <div className="rounded-xl border border-border bg-primary/5 p-4 flex flex-col items-center text-center gap-2">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Play className="h-5 w-5 text-primary" />
          </div>
          <p className="font-semibold text-sm">2. Press Listen</p>
          <p className="text-xs text-muted-foreground">Click the Listen button on any campaign to hear it read aloud by AI.</p>
        </div>
        <div className="rounded-xl border border-border bg-primary/5 p-4 flex flex-col items-center text-center gap-2">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Square className="h-5 w-5 text-primary" />
          </div>
          <p className="font-semibold text-sm">3. Stop Anytime</p>
          <p className="text-xs text-muted-foreground">Click the Stop button to pause the announcement at any time.</p>
        </div>
      </div>

      {/* Campaign announcements */}
      <div>
        <h2 className="font-display text-lg font-semibold mb-3">Campaign Announcements</h2>
        <div className="space-y-3">
          {list.map((c) => (
            <Card key={c.id} className="hover:shadow-sm transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Badge variant="secondary" className="shrink-0 capitalize">{c.priority}</Badge>
                    <CardTitle className="text-sm truncate">{c.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={playing === c.id}
                      onClick={() => handlePlay(`${c.title}. ${c.objectives}`, c.id)}
                    >
                      {playing === c.id ? (
                        <><Square className="h-3 w-3 mr-1" /> Playing</>
                      ) : (
                        <><Play className="h-3 w-3 mr-1" /> Listen</>
                      )}
                    </Button>
                    <button
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                    >
                      {expanded === c.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                {expanded === c.id && (
                  <p className="text-sm text-muted-foreground mt-2">{c.objectives}</p>
                )}
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      <Card className="bg-accent/5 border-accent/20">
        <CardContent className="p-4 flex items-start gap-3">
          <Volume2 className="h-5 w-5 text-accent mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-foreground">Powered by Built-in Text-to-Speech</p>
            <p className="text-muted-foreground mt-1">
              Voice announcements improve accessibility for senior citizens, visually impaired residents, and those who prefer listening over reading.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const mockCampaigns = [
  { id: 1, title: "Fire Safety Reminders for the Dry Season", objectives: "Avoid using faulty electrical connections. Keep a fire extinguisher accessible. Know your nearest fire exit.", category: "fire_safety", priority: "high" },
  { id: 2, title: "Flood Evacuation Route Advisory", objectives: "Proceed to Barangay 178 covered court during flooding. Bring essential documents and medications.", category: "disaster_prep", priority: "critical" },
  { id: 3, title: "Dengue Prevention Campaign", objectives: "Practice the 4S strategy: Search and destroy breeding sites, Self-protection, Seek early consultation, Support fogging.", category: "health", priority: "medium" },
];
