import React, { useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase.js";

/**
 * ExportPasswordDialog — reusable secure export dialog.
 * 
 * Props:
 *   open       {boolean}  — whether dialog is visible
 *   onClose    {function} — called when user cancels
 *   onConfirm  {function} — called when password is verified successfully
 *   title      {string}   — optional custom title (default: "Secure Export")
 */
export default function ExportPasswordDialog({ open, onClose, onConfirm, title = "Secure Export" }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setError("");
    if (!password) {
      setError("Please enter your password.");
      return;
    }
    setLoading(true);
    try {
      const { data: isValid, error: rpcError } = await supabase.rpc("verify_user_password", {
        password,
      });
      if (rpcError) throw rpcError;
      if (!isValid) {
        setError("Incorrect password. Access denied.");
        setLoading(false);
        return;
      }
      // Password verified — trigger the export
      onConfirm();
      handleClose();
    } catch (err) {
      console.error("Export verification error:", err);
      setError("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPassword("");
    setError("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            Enter your account password to authorize this export. This prevents unauthorized users from downloading sensitive data.
          </p>
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleVerify()}
              autoFocus
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleVerify} disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Verify & Export
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
