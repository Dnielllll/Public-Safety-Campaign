import React, { useState } from "react";
import { MessageSquareText, Reply } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const typeVariant = { comment: "secondary", suggestion: "success", complaint: "destructive", concern: "warning" };

const initialFeedback = [
  { id: 1, resident: "Ana Reyes", type: "suggestion", message: "Maybe add a Tagalog voice option for the announcements.", status: "new" },
  { id: 2, resident: "Liza Cruz", type: "complaint", message: "I didn't receive the SMS alert about the flood advisory.", status: "new" },
  { id: 3, resident: "Marco Villar", type: "comment", message: "Thank you for the fire safety reminders, very helpful!", status: "reviewed" },
];

export default function FeedbackManagement() {
  const [feedback, setFeedback] = useState(initialFeedback);
  const [response, setResponse] = useState("");

  const respond = (id) => {
    setFeedback((f) => f.map((x) => (x.id === id ? { ...x, status: "responded" } : x)));
    setResponse("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <MessageSquareText className="h-6 w-6 text-primary" /> Feedback Management
        </h1>
        <p className="text-muted-foreground text-sm">Review resident feedback, complaints, suggestions, and survey responses.</p>
      </div>

      <div className="space-y-3">
        {feedback.map((f) => (
          <Card key={f.id}>
            <CardContent className="p-4 flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-sm">{f.resident}</p>
                  <Badge variant={typeVariant[f.type]}>{f.type}</Badge>
                  {f.status === "responded" && <Badge variant="outline">Responded</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">{f.message}</p>
              </div>
              {f.status !== "responded" && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm"><Reply className="h-4 w-4 mr-1" /> Respond</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Respond to {f.resident}</DialogTitle></DialogHeader>
                    <p className="text-sm text-muted-foreground">"{f.message}"</p>
                    <Textarea rows={4} placeholder="Write your response…" value={response} onChange={(e) => setResponse(e.target.value)} />
                    <DialogFooter>
                      <Button onClick={() => respond(f.id)}>Send Response</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
