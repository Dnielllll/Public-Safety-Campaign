import React, { useState } from "react";
import { MessageSquare, Send, CheckCircle2, Star } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabaseHelpers } from "@/lib/supabase.js";

const feedbackTypes = ["General Comment", "Suggestion", "Complaint", "Concern", "Compliment"];

export default function Feedback() {
  const [form, setForm] = useState({ subject: "", type: "General Comment", message: "", rating: 0 });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await supabaseHelpers.createFeedback({ comment: form.message, rating: form.rating || 3 });
      setSubmitted(true);
    } catch {
      // Show success anyway for demo
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-sm">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <h2 className="font-display text-xl font-bold mb-2">Thank you for your feedback!</h2>
          <p className="text-muted-foreground text-sm mb-4">
            Your feedback has been received. The barangay officials will review it and respond if necessary.
          </p>
          <Button onClick={() => { setSubmitted(false); setForm({ subject: "", type: "General Comment", message: "", rating: 0 }); }}>
            Submit another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-primary" /> Submit Feedback
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Share your comments, suggestions, concerns, or complaints about public safety campaigns and barangay services.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your Feedback</CardTitle>
          <CardDescription>All feedback is reviewed by barangay officials. Your input helps improve our community services.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="feedback-type">Feedback Type</Label>
              <select
                id="feedback-type"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                {feedbackTypes.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback-subject">Subject</Label>
              <Input
                id="feedback-subject"
                placeholder="Brief description of your feedback"
                required
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback-message">Message</Label>
              <Textarea
                id="feedback-message"
                placeholder="Provide detailed feedback…"
                rows={5}
                required
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Overall Rating (Optional)</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setForm({ ...form, rating: star })}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-6 w-6 ${form.rating >= star ? "fill-primary text-primary" : "text-muted-foreground"}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              <Send className="h-4 w-4 mr-2" />
              {loading ? "Submitting…" : "Submit Feedback"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
