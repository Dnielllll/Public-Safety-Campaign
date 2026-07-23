import React, { useState } from "react";
import { Upload, FileText, Image as ImageIcon, Video, Volume2, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const typeIcon = { announcement: FileText, poster: ImageIcon, infographic: ImageIcon, video: Video, advisory: FileText, voice_script: Volume2 };

const initialContent = [
  { id: 1, campaign: "Anti-Scam Awareness", type: "poster" },
  { id: 2, campaign: "Anti-Scam Awareness", type: "announcement" },
  { id: 3, campaign: "Flood Evacuation Route Advisory", type: "infographic" },
];

export default function StaffContent() {
  const [content, setContent] = useState(initialContent);
  const remove = (id) => setContent((c) => c.filter((i) => i.id !== id));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Content Management</h1>
          <p className="text-muted-foreground text-sm">Upload posters, infographics, videos, and advisories for your campaigns.</p>
        </div>
        <Button><Upload className="h-4 w-4 mr-1" /> Upload Content</Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {content.map((c) => {
          const Icon = typeIcon[c.type] || FileText;
          return (
            <Card key={c.id}>
              <CardContent className="p-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="font-medium text-sm mb-1">{c.campaign}</p>
                <p className="text-xs text-muted-foreground capitalize mb-3">{c.type.replace("_", " ")}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">Edit</Button>
                  <Button variant="ghost" size="icon" onClick={() => remove(c.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
