import React from "react";
import { cn } from "@/lib/utils";

function Avatar({ className, ...props }) {
  return (
    <div
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-secondary items-center justify-center font-display font-semibold text-primary",
        className
      )}
      {...props}
    />
  );
}

function AvatarImage({ className, ...props }) {
  return <img className={cn("aspect-square h-full w-full object-cover", className)} {...props} />;
}

function AvatarFallback({ className, ...props }) {
  return <span className={cn("text-sm", className)} {...props} />;
}

export { Avatar, AvatarImage, AvatarFallback };
