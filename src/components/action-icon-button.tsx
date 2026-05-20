"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function ActionIconButton({
  label,
  className,
  variant = "outline",
  type = "button",
  asChild = false,
  children,
}: {
  label: string;
  className?: string;
  variant?: "outline" | "ghost" | "default" | "destructive" | "secondary";
  type?: "button" | "submit";
  asChild?: boolean;
  children: React.ReactNode;
}) {
  const { pending } = useFormStatus();

  const button = (
    <Button
      asChild={asChild}
      type={asChild ? undefined : type}
      size="icon-sm"
      variant={variant}
      aria-label={label}
      className={cn("shrink-0", className)}
      disabled={pending}
    >
      {pending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        children
      )}
    </Button>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent sideOffset={6}>{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
