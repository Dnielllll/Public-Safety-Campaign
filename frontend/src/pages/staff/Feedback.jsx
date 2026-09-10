import React, { useState, useEffect } from "react";
import { MessageSquareText, Flag, Loader2, ClipboardList, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase.js";

const typeVariant = { comment: "secondary", suggestion: "success", complaint: "destructive", concern: "warning" };

const mockSurveys = [
  { id: 1, resident: "Daniel Rivera", survey: "Fire Safety Awareness", score: "8/10", date: "2026-08-16", comments: "Need more fire extinguishers in the hall." },
  { id: 2, resident: "Maria Santos", survey: "Dengue Prevention", score: "10/10", date: "2026-08-15", comments: "Very informative campaign." },
];

export default function StaffFeedback() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    setLoading(true);
    setError(null);
    try {
      // Query only columns that actually exist in the feedback table
      const { data, error: fetchError } = await supabase
        .from('feedback')
        .select('id, comment, rating, created_at, user_id, campaign_id')
        .order('created_at', { ascending: false });

      console.log('Staff feedback fetch:', { data, error: fetchError });

      if (fetchError) {
        console.error('Feedback fetch error:', fetchError);
        setError(fetchError.message);
        return;
      }

      if (data && data.length > 0) {
        const parsedItems = data.map(f => {
          let type = "comment";
          let message = f.comment || "";

          // Extract type from bracket prefix like [Compliment], [General Comment], etc.
          const headerMatch = message.match(/^\[(.*?)\]/);
          if (headerMatch) {
            const raw = headerMatch[1].toLowerCase();
            type = raw.includes("suggestion") ? "suggestion" :
                   raw.includes("complaint") ? "complaint" :
                   raw.includes("concern") ? "concern" : "comment";
            // Extract message body after the header line
            const bodyMatch = message.match(/^\[.*?\].*?\n\n([\s\S]*)$/);
            if (bodyMatch) message = bodyMatch[1].trim();
            else message = message.replace(/^\[.*?\].*?\n/, '').trim() || f.comment;
          }

          return {
            id: f.id,
            type,
            message: message || f.comment || '(no message)',
            campaign: 'General',
            rating: f.rating,
            created_at: f.created_at,
          };
        });
        setItems(parsedItems);
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
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
              {items.map((f) => (
                <Card key={f.id}>
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm">Resident</p>
                        <Badge variant={typeVariant[f.type] || 'secondary'}>{f.type}</Badge>
                        {f.rating && (
                          <span className="text-xs text-muted-foreground">{'⭐'.repeat(f.rating)}</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{f.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(f.created_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {items.length === 0 && (
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
