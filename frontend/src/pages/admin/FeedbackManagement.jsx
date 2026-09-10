import React, { useState, useEffect } from "react";
import { MessageSquareText, Reply, RefreshCw, Loader2, ClipboardList } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabaseHelpers } from "@/lib/supabase.js";

const typeVariant = { comment: "secondary", suggestion: "success", complaint: "destructive", concern: "warning" };

const initialFeedback = [
  { id: 1, resident: "Ana Reyes", type: "suggestion", message: "Maybe add a Tagalog voice option for the announcements.", status: "new" },
  { id: 2, resident: "Liza Cruz", type: "complaint", message: "I didn't receive the SMS alert about the flood advisory.", status: "new" },
];

const mockSurveys = [
  { id: 1, resident: "Daniel Rivera", survey: "Fire Safety Awareness", score: "8/10", date: "2026-08-16", comments: "Need more fire extinguishers in the hall." },
  { id: 2, resident: "Maria Santos", survey: "Dengue Prevention", score: "10/10", date: "2026-08-15", comments: "Very informative campaign." },
];

export default function FeedbackManagement() {
  const [feedback, setFeedback] = useState(initialFeedback);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(true);
  const [respondingTo, setRespondingTo] = useState(null);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const { data } = await supabaseHelpers.getFeedback();
      if (data) {
        const parsedItems = data.map(f => {
          let type = "comment";
          let message = f.comment || "";
          
          const match = message.match(/^\[(.*?)\] (.*?)\n\n([\s\S]*)$/);
          if (match) {
            type = match[1].toLowerCase().includes("suggestion") ? "suggestion" : 
                   match[1].toLowerCase().includes("complaint") ? "complaint" :
                   match[1].toLowerCase().includes("concern") ? "concern" : "comment";
            message = `Subject: ${match[2]}\n\n${match[3]}`;
          }
          
          return {
            id: f.id,
            resident: f.users?.name || 'Resident',
            type,
            message,
            status: f.status || "new",
            response: f.response || ""
          };
        });
        
        setFeedback([...parsedItems, ...initialFeedback]);
      }
    } catch (err) {
      console.error("Error fetching feedback", err);
    } finally {
      setLoading(false);
    }
  };

  const respond = async (id) => {
    try {
      if (typeof id === 'string') {
        const { error } = await supabaseHelpers.respondToFeedback(id, { response, status: 'responded' });
        if (error) {
          console.error("Failed to respond in Supabase:", error);
          alert("Error saving response to database. See console for details.");
          return;
        }
      }
      
      setFeedback((f) => f.map((x) => (x.id === id ? { ...x, status: "responded", response } : x)));
      setResponse("");
      setRespondingTo(null);
    } catch (err) {
      console.error("Unexpected error saving response:", err);
      alert("Unexpected error. Check console.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <MessageSquareText className="h-6 w-6 text-primary" /> Feedback & Surveys
          </h1>
          <p className="text-muted-foreground text-sm">Review resident feedback, complaints, suggestions, and survey responses.</p>
        </div>
        <Button variant="outline" size="icon" onClick={fetchFeedback} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <Tabs defaultValue="feedback" className="space-y-4">
        <TabsList>
          <TabsTrigger value="feedback"><MessageSquareText className="h-4 w-4 mr-2" /> Feedback Messages</TabsTrigger>
          <TabsTrigger value="surveys"><ClipboardList className="h-4 w-4 mr-2" /> Survey Results</TabsTrigger>
        </TabsList>

        <TabsContent value="feedback">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-3">
              {feedback.map((f) => (
                <Card key={f.id}>
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm">{f.resident}</p>
                        <Badge variant={typeVariant[f.type] || "secondary"}>{f.type}</Badge>
                        {f.status === "responded" && <Badge variant="outline">Responded</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{f.message}</p>
                      
                      {f.status === "responded" && f.response && (
                        <div className="mt-3 p-3 bg-muted/50 rounded-md border text-sm">
                          <span className="font-semibold text-primary block mb-1">Your Response:</span>
                          {f.response}
                        </div>
                      )}
                    </div>
                    
                    {f.status !== "responded" && (
                      <Dialog open={respondingTo === f.id} onOpenChange={(open) => setRespondingTo(open ? f.id : null)}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm"><Reply className="h-4 w-4 mr-1" /> Respond</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>Respond to {f.resident}</DialogTitle></DialogHeader>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">"{f.message}"</p>
                          <Textarea 
                            rows={4} 
                            placeholder="Write your response…" 
                            value={response} 
                            onChange={(e) => setResponse(e.target.value)} 
                          />
                          <DialogFooter>
                            <Button onClick={() => respond(f.id)} disabled={!response.trim()}>Send Response</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                  </CardContent>
                </Card>
              ))}
              {feedback.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No feedback found.
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="surveys">
          <div className="grid md:grid-cols-2 gap-4">
            {mockSurveys.map((survey) => (
              <Card key={survey.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">{survey.survey}</CardTitle>
                    <Badge variant="outline">{survey.date}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium mb-1">Resident: {survey.resident}</p>
                  <div className="flex justify-between text-sm text-muted-foreground mb-3">
                    <span>Score:</span>
                    <span className="font-bold text-primary">{survey.score}</span>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-md text-sm">
                    <span className="font-semibold block mb-1">Comments:</span>
                    {survey.comments}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
