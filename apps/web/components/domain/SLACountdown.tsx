"use client";
import { useEffect, useState } from "react";
import { formatDistanceToNow, isPast } from "date-fns";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface SLACountdownProps {
  deadline: string;
}

export function SLACountdown({ deadline }: SLACountdownProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  
  const date = new Date(deadline);
  const breached = isPast(date);
  
  return (
    <div className={cn(
      "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium font-mono border whitespace-nowrap",
      breached 
        ? "bg-destructive/10 text-destructive border-destructive/20 animate-pulse" 
        : "bg-muted text-muted-foreground border-border"
    )}>
      <Clock className="w-3.5 h-3.5" />
      <span>{breached ? "SLA Breached" : formatDistanceToNow(date, { addSuffix: true })}</span>
    </div>
  );
}
