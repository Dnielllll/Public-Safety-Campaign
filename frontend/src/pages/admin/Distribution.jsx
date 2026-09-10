import React, { useState, useEffect } from "react";
import { Share2, Globe, MessageCircle, Mail, Facebook, Smartphone, Volume2, Send, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { supabase, supabaseHelpers } from "@/lib/supabase.js";
import { notificationApi } from "@/lib/apiGateway.js";

const channels = [
  { id: "website", label: "Website", icon: Globe },
  { id: "sms", label: "SMS", icon: MessageCircle },
  { id: "email", label: "Email", icon: Mail },
  { id: "facebook", label: "Facebook", icon: Facebook },
  { id: "mobile_app", label: "Mobile App", icon: Smartphone },
  { id: "voice_announcement", label: "AI Voice Announcement", icon: Volume2 },
];

export default function Distribution() {
  const [campaigns, setCampaigns] = useState([]);
  const [campaign, setCampaign] = useState("");
  const [selected, setSelected] = useState(["website", "sms"]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState(null);
  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [loadingPhoneNumbers, setLoadingPhoneNumbers] = useState(false);

  const toggle = (id) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  useEffect(() => {
    fetchApprovedCampaigns();
  }, []);

  useEffect(() => {
    if (selected.includes("sms")) {
      fetchPhoneNumbers();
    }
  }, [selected]);

  const fetchPhoneNumbers = async () => {
    setLoadingPhoneNumbers(true);
    try {
      // Fetch phone numbers directly from Supabase
      const { data, error } = await supabase
        .from('users')
        .select('phone')
        .not('phone', 'is', null)
        .not('phone', 'eq', '');

      if (error) throw error;
      const numbers = data?.map(u => u.phone).filter(Boolean) || [];
      setPhoneNumbers(numbers);
    } catch (error) {
      console.error("Error fetching phone numbers:", error);
    } finally {
      setLoadingPhoneNumbers(false);
    }
  };

  const fetchApprovedCampaigns = async () => {
    setLoading(true);
    try {
      // Fetch campaigns directly from Supabase
      const { data, error } = await supabaseHelpers.getCampaigns();
      if (error) throw error;

      // Filter for approved or published campaigns
      const approved = data?.filter(c => c.status === 'approved' || c.status === 'published') || [];
      setCampaigns(approved);
      if (approved.length > 0) {
        setCampaign(approved[0].id.toString());
      }
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!campaign || selected.length === 0) {
      alert("Please select a campaign and at least one channel.");
      return;
    }

    setPublishing(true);
    setPublishResult(null);

    try {
      // Handle SMS distribution via notification-service (through API gateway)
      if (selected.includes("sms")) {
        if (phoneNumbers.length === 0) {
          setPublishResult({
            success: false,
            message: "No resident phone numbers found. Please ensure residents have phone numbers in the system.",
          });
          setPublishing(false);
          return;
        }

        // Get the selected campaign object
        const selectedCampaign = campaigns.find(c => c.id.toString() === campaign);

        try {
          const data = await notificationApi.bulkSMS({
            phone_numbers: phoneNumbers,
            campaign_title: selectedCampaign?.title || "",
            campaign_description: selectedCampaign?.description || "",
            provider: "iprog",
          });
          setPublishResult({
            success: data.success ?? true,
            message: data.accepted
              ? `Bulk SMS queued for ${phoneNumbers.length} recipients`
              : (data.success ? "SMS distribution completed" : "SMS distribution partially failed"),
            details: data.distribution_result,
          });
        } catch (smsError) {
          console.error("SMS API Error:", smsError);
          setPublishResult({
            success: false,
            message: smsError.message || "Failed to send SMS. Check if the notification service is running.",
          });
        }
      } else {
        setPublishResult({
          success: true,
          message: "Campaign published successfully to selected channels.",
        });
      }
    } catch (error) {
      console.error("Error publishing:", error);
      setPublishResult({
        success: false,
        message: error.response?.data?.message || "Failed to publish campaign",
      });
    } finally {
      setPublishing(false);
    }
  };

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
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Select value={campaign} onValueChange={setCampaign} disabled={campaigns.length === 0}>
              <SelectTrigger className="max-w-md">
                <SelectValue placeholder={campaigns.length === 0 ? "No approved campaigns" : "Select a campaign"} />
              </SelectTrigger>
              <SelectContent>
                {campaigns.map((c) => (
                  <SelectItem key={c.id} value={c.id.toString()}>{c.title || "Untitled Campaign"}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
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
                className={`flex flex-col items-start gap-2 rounded-lg border p-4 text-left transition-colors ${
                  active ? "border-primary bg-primary/5" : "border-border hover:bg-secondary/50"
                }`}
              >
                <div className="flex items-center gap-3 w-full">
                  <Icon className={`h-5 w-5 ${active ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="text-sm font-medium">{ch.label}</span>
                  {active && <Badge className="ml-auto text-[10px]">Selected</Badge>}
                </div>
                {ch.id === "sms" && active && (
                  <div className="text-xs text-muted-foreground">
                    {loadingPhoneNumbers ? (
                      <span className="flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Loading phone numbers...
                      </span>
                    ) : phoneNumbers.length > 0 ? (
                      `${phoneNumbers.length} resident${phoneNumbers.length !== 1 ? 's' : ''} will receive SMS`
                    ) : (
                      <span className="text-amber-600">No phone numbers available</span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </CardContent>
        <CardFooter className="flex-col gap-4">
          <Button onClick={handlePublish} disabled={publishing || !campaign || selected.length === 0} className="w-full">
            {publishing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
            Publish to {selected.length} Channel{selected.length !== 1 && "s"}
          </Button>

          {publishResult && (
            <div className={`flex items-start gap-3 rounded-lg border p-4 w-full ${
              publishResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
            }`}>
              {publishResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              )}
              <div className="flex-1">
                <p className={`font-medium text-sm ${publishResult.success ? "text-green-800" : "text-red-800"}`}>
                  {publishResult.message}
                </p>
                {publishResult.details && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    <p>Total: {publishResult.details.total} recipients</p>
                    <p>Successful: {publishResult.details.success_count}</p>
                    {publishResult.details.failure_count > 0 && (
                      <p className="text-red-600">Failed: {publishResult.details.failure_count}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
