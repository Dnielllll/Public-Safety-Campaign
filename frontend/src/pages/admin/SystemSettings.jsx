import React, { useState } from "react";
import { Settings, Save, Volume2, Bell, KeyRound } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function SystemSettings() {
  const [notif, setNotif] = useState({ sms: true, email: true, facebook: true, push: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" /> System Settings
        </h1>
        <p className="text-muted-foreground text-sm">Configure barangay information, channels, and AI / TTS integration.</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="ai">AI & Voice</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Barangay Information</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Barangay Name</Label>
                <Input defaultValue="Barangay 178" />
              </div>
              <div className="space-y-2">
                <Label>City / Municipality</Label>
                <Input defaultValue="North Caloocan City" />
              </div>
              <div className="space-y-2">
                <Label>District</Label>
                <Input defaultValue="Camarin" />
              </div>
              <div className="space-y-2">
                <Label>Official Contact Number</Label>
                <Input placeholder="(02) 8XXX-XXXX" />
              </div>
            </CardContent>
            <CardFooter>
              <Button><Save className="h-4 w-4 mr-1" /> Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="channels">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Bell className="h-4 w-4 text-primary" /> Communication Channels</CardTitle>
              <CardDescription>Enable or disable dissemination channels system-wide.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: "sms", label: "SMS Gateway" },
                { key: "email", label: "Email (SMTP)" },
                { key: "facebook", label: "Facebook Page Integration" },
                { key: "push", label: "Mobile Push Notifications" },
              ].map((c) => (
                <div key={c.key} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{c.label}</span>
                  <Switch checked={notif[c.key]} onCheckedChange={(v) => setNotif({ ...notif, [c.key]: v })} />
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button><Save className="h-4 w-4 mr-1" /> Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Volume2 className="h-4 w-4 text-primary" /> Google Cloud Text-to-Speech</CardTitle>
              <CardDescription>Configure the AI voice engine used for accessibility announcements.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><KeyRound className="h-3.5 w-3.5" /> Service Account Key (JSON)</Label>
                <Input type="password" placeholder="•••••••••••••••••••••••" />
                <p className="text-xs text-muted-foreground">Stored securely on the server; never exposed to the frontend.</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Default Voice</Label>
                  <Select defaultValue="fil-PH-Wavenet-A">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fil-PH-Wavenet-A">Filipino — Wavenet A (Female)</SelectItem>
                      <SelectItem value="fil-PH-Wavenet-D">Filipino — Wavenet D (Male)</SelectItem>
                      <SelectItem value="en-US-Wavenet-F">English — Wavenet F (Female)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Default Speaking Rate</Label>
                  <Select defaultValue="1.0">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.75">Slow (0.75x)</SelectItem>
                      <SelectItem value="1.0">Normal (1.0x)</SelectItem>
                      <SelectItem value="1.25">Fast (1.25x)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm font-medium">Auto-generate voice for every published campaign</span>
                <Switch defaultChecked />
              </div>
            </CardContent>
            <CardFooter>
              <Button><Save className="h-4 w-4 mr-1" /> Save AI Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
