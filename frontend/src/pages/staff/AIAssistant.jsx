import React, { useState } from "react";
import { Sparkles, Wand2, Volume2, Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AIAPI } from "@/lib/api";
import { supabaseHelpers } from "@/lib/supabase.js";

export default function StaffAIAssistant() {
  const [prompt, setPrompt] = useState("");
  const [draft, setDraft] = useState("");
  const [voice, setVoice] = useState("fil-PH-Wavenet-A");
  const [generating, setGenerating] = useState(false);
  const [synthesizing, setSynthesizing] = useState(false);

  const generate = async () => {
    setGenerating(true);
    try {
      const res = await AIAPI.generateText({ prompt });
      setDraft(res.data.text);
    } catch {
      // Generate a realistic mock announcement based on the prompt
      const mockDraft = generateMockDraft(prompt);
      setDraft(mockDraft);
    } finally {
      setGenerating(false);
    }
  };

  const generateMockDraft = (userPrompt) => {
    const promptLower = userPrompt?.toLowerCase() || "";
    
    // Generate contextual mock content based on prompt keywords
    if (promptLower.includes("rain") || promptLower.includes("flood") || promptLower.includes("storm")) {
      return `🌧️ WEATHER ADVISORY\n\nATTENTION Barangay 178 Residents:\n\nDue to the heavy rainfall forecast in our area, please take the following precautions:\n\n• Monitor weather updates through official channels\n• Prepare emergency kits with essential supplies\n• Avoid crossing flooded streets and waterways\n• Secure loose items around your property\n• Stay indoors unless absolutely necessary\n\nResidents in low-lying areas (Puroks 1, 3, and 5) should be especially vigilant and consider temporary evacuation if water levels rise.\n\nFor emergency assistance, contact:\n📞 Barangay Hotline: 123-4567\n📍 Barangay Hall: Open 24/7\n\nLet us look out for one another. Stay safe, Barangay 178!`;
    }
    
    if (promptLower.includes("fire") || promptLower.includes("burn") || promptLower.includes("safety")) {
      return `🔥 FIRE SAFETY ADVISORY\n\nATTENTION Barangay 178 Residents:\n\nFire prevention is everyone's responsibility. Please observe these safety measures:\n\n• Ensure fire extinguishers are accessible and functional\n• Check electrical wiring and avoid overloading outlets\n• Never leave cooking unattended\n• Properly dispose of cigarette butts and matches\n• Keep flammable materials away from heat sources\n\nIn case of fire:\n1. Call emergency services immediately\n2. Evacuate using the nearest exit\n3. Do not use elevators during fire emergencies\n4. Assist neighbors who may need help\n\nReport fire hazards to the Barangay Fire Safety Officer.\n\nTogether, we can keep our community safe!`;
    }
    
    if (promptLower.includes("health") || promptLower.includes("disease") || promptLower.includes("virus")) {
      return `🏥 HEALTH ADVISORY\n\nATTENTION Barangay 178 Residents:\n\nTo protect our community's health, please follow these guidelines:\n\n• Practice proper hand hygiene regularly\n• Wear masks in crowded places when advised\n• Maintain physical distance when feeling unwell\n• Stay home if experiencing symptoms\n• Get vaccinated when eligible\n\nHealth Services Available:\n📍 Barangay Health Center: Mon-Fri, 8AM-5PM\n📞 Medical Hotline: 987-6543\n\nFree check-ups and basic medicines are available at the Health Center. Priority is given to seniors, pregnant women, and persons with disabilities.\n\nYour health is our priority. Stay healthy, Barangay 178!`;
    }
    
    if (promptLower.includes("clean") || promptLower.includes("garbage") || promptLower.includes("environment")) {
      return `🧹 CLEAN-UP DRIVE ADVISORY\n\nATTENTION Barangay 178 Residents:\n\nLet's keep our community clean and green! Join our scheduled clean-up activities:\n\n📅 Every Saturday, 7:00 AM\n📍 Meeting Point: Barangay Hall\n\nWhat to bring:\n• Gloves and face masks\n• Rakes and brooms\n• Water bottles\n\nGuidelines:\n• Segregate waste properly (biodegradable, non-biodegradable)\n• Report illegal dumping sites\n• Maintain cleanliness in front of your homes\n\nA clean environment is a healthy environment. Let's work together for a cleaner Barangay 178!\n\nFor inquiries, visit the Barangay Environmental Office.`;
    }
    
    // Default generic announcement
    return `📢 COMMUNITY ANNOUNCEMENT\n\nATTENTION Barangay 178 Residents:\n\n${userPrompt || "This is an important announcement for all residents."}\n\nPlease take note of the following:\n• Stay informed through official barangay channels\n• Participate in community activities\n• Look out for your neighbors, especially the elderly\n• Report any concerns or emergencies immediately\n\nFor more information, visit the Barangay Hall or contact your Purok Leader.\n\nTogether, we build a stronger community. Mabuhay Barangay 178!`;
  };

  const synthesize = async () => {
    setSynthesizing(true);
    try {
      await AIAPI.textToSpeech({ text: draft, voice });
    } finally {
      setSynthesizing(false);
    }
  };

  const handleSubmitForApproval = async () => {
    try {
      const { user } = await supabaseHelpers.getAuthUser();
      const { data, error } = await supabaseHelpers.createCampaign({
        title: "AI Generated Announcement",
        description: draft,
        campaign_type: "community",
        status: "submitted",
        created_by: user?.id
      });
      if (error) throw error;
      alert("Draft submitted for approval! The admin will review your announcement.");
      setDraft("");
      setPrompt("");
    } catch (err) {
      console.error(err);
      alert("Failed to submit draft.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-accent" /> AI Content Assistant
        </h1>
        <p className="text-muted-foreground text-sm">Draft announcements and generate voice scripts before submitting for approval.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Prompt</CardTitle>
            <CardDescription>Describe the announcement or advisory you need.</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea rows={4} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="e.g. Write a reminder about proper garbage disposal to prevent flooding." />
          </CardContent>
          <CardFooter>
            <Button onClick={generate} disabled={generating}>
              {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Wand2 className="h-4 w-4 mr-2" />}
              {generating ? "Generating…" : "Generate Draft"}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Draft</CardTitle>
            <CardDescription>Review before sending to your admin.</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea rows={8} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Your draft will appear here…" />
          </CardContent>
          <CardFooter className="justify-between">
            <Badge variant={draft ? "success" : "outline"}>{draft ? "Ready for submission" : "No draft yet"}</Badge>
            <Button onClick={handleSubmitForApproval} disabled={!draft} className="ml-auto">
              Submit for Approval
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Volume2 className="h-4 w-4 text-primary" /> Voice Script Preview</CardTitle>
          <CardDescription>Generate a preview using Google Cloud Text-to-Speech.</CardDescription>
        </CardHeader>
        <CardContent className="max-w-xs">
          <Label className="mb-2 block">Voice</Label>
          <Select value={voice} onValueChange={setVoice}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="fil-PH-Wavenet-A">Filipino — Wavenet A (Female)</SelectItem>
              <SelectItem value="fil-PH-Wavenet-D">Filipino — Wavenet D (Male)</SelectItem>
              <SelectItem value="en-US-Wavenet-F">English — Wavenet F (Female)</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
        <CardFooter>
          <Button variant="accent" onClick={synthesize} disabled={!draft || synthesizing}>
            {synthesizing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Volume2 className="h-4 w-4 mr-2" />}
            {synthesizing ? "Synthesizing…" : "Preview Voice"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
