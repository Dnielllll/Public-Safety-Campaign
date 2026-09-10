import React, { useState } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-secondary hover:text-secondary-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        accent: "bg-accent text-accent-foreground hover:bg-accent/90",
        ghost: "hover:bg-secondary hover:text-secondary-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, onClick, disabled, loading, type, children, ...props }, ref) => {
    const [internalLoading, setInternalLoading] = useState(false);
    const Comp = asChild ? Slot : "button";
    // For submit buttons, rely on external loading prop only (form handles submission)
    const isSubmitButton = type === "submit";
    const isLoading = loading || (!isSubmitButton && internalLoading);
    const finalDisabled = disabled || isLoading;

    const handleClick = async (e) => {
      // For submit buttons, don't intercept — let the form's onSubmit handle it
      if (isSubmitButton) {
        if (onClick) onClick(e);
        return;
      }

      if (internalLoading) return;
      setInternalLoading(true);

      try {
        if (onClick) {
          const result = onClick(e);
          if (result && typeof result.then === "function") {
            await result;
            return;
          }
        }
        // For sync clicks (nav, toggles, etc.) show spinner briefly
        await new Promise((resolve) => setTimeout(resolve, 600));
      } finally {
        setInternalLoading(false);
      }
    };

    if (asChild) {
      return (
        <Comp
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          disabled={finalDisabled}
          type={type}
          onClick={onClick}
          {...props}
        >
          {children}
        </Comp>
      );
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={finalDisabled}
        type={type}
        onClick={handleClick}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {size !== "icon" && <span className="opacity-70">{children}</span>}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

