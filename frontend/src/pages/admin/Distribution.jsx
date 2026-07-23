import React, { useState } from "react";
import { Share2, Globe, MessageCircle, Mail, Facebook, Smartphone, Volume2, Send } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const channels = [
  { id: "website", label: "Website", icon: Globe },
  { id: "sms", label: "SMS", icon: MessageCircle },
  { id: "email", label: "Email", icon: Mail },
  { id: "facebook", label: "Facebook", icon: Facebook },
  { id: "mobile_app", label: "Mobile App", icon: Smartphone },
  { id: "voice_announcement", label: "AI Voice Announcement", icon: Volume2 },
];

const approvedCampaigns = [
  { id: 1, title: "Fire Safety Reminders for the Dry Season" },
  { id: 2, title: "Dengue Prevention Campaign" },
];

export default function Distribution() {
  const [campaign, setCampaign] = useState(approvedCampaigns[0].id.toString());
  const [selected, setSelected] = useState(["website", "sms"]);

  const toggle = (id) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <Share2 className="h-6 w-6 text-primary" /> Multi-Channel Distribution
        </h1>
        <p className="text-muted-foreground text-sm">Publish approved campaigns across communication channels.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Select Approved Campaign</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={campaign} onValueChange={setCampaign}>
            <SelectTrigger className="max-w-md"><SelectValue /></SelectTrigger>
            <SelectContent>
              {approvedCampaigns.map((c) => (
                <SelectItem key={c.id} value={c.id.toString()}>{c.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Choose Channels</CardTitle>
          <CardDescription>Select where this campaign should be disseminated.</CardDescription>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-3 gap-3">
          {channels.map((ch) => {
            const Icon = ch.icon;
            const active = selected.includes(ch.id);
            return (
              <button
                key={ch.id}
                onClick={() => toggle(ch.id)}
                className={`flex items-center gap-3 rounded-lg border p-4 text-left transition-colors ${
                  active ? "border-primary bg-primary/5" : "border-border hover:bg-secondary/50"
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? "text-primary" : "text-muted-foreground"}`} />
                <span className="text-sm font-medium">{ch.label}</span>
                {active && <Badge className="ml-auto text-[10px]">Selected</Badge>}
              </button>
            );
          })}
        </CardContent>
        <CardFooter>
          <Button><Send className="h-4 w-4 mr-2" /> Publish to {selected.length} Channel{selected.length !== 1 && "s"}</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
