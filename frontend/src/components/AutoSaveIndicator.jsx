import React from 'react';
import { Save, CheckCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Auto-save indicator component
 * Shows the current auto-save status with visual feedback
 */
export default function AutoSaveIndicator({ isSaved, isSaving, lastSavedTime }) {
  return (
    <div className={cn(
      "flex items-center gap-2 text-xs transition-all duration-300",
      isSaved ? "text-green-600" : "text-muted-foreground"
    )}>
      {isSaving ? (
        <>
          <Clock className="h-3 w-3 animate-spin" />
          <span>Saving...</span>
        </>
      ) : isSaved ? (
        <>
          <CheckCircle className="h-3 w-3" />
          <span>Saved</span>
        </>
      ) : (
        <>
          <Save className="h-3 w-3" />
          <span>Auto-save enabled</span>
        </>
      )}
      
      {lastSavedTime && (
        <span className="text-muted-foreground">
          • Last saved: {new Date(lastSavedTime).toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}

/**
 * Auto-save toast notification
 * Shows a temporary notification when data is auto-saved
 */
export function AutoSaveToast({ show, message }) {
  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-bounce">
      <CheckCircle className="h-4 w-4" />
      <span className="text-sm">{message || 'Data auto-saved'}</span>
    </div>
  );
}