"use client";
import { useState } from "react";
import { ArrowBigUp, ArrowBigDown } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface VoteControllerProps {
  initialUpvotes: number;
  initialDownvotes: number;
  userVote?: 'up' | 'down' | null;
  onVoteChange?: (newNet: number) => void;
  onVote?: (type: 'up' | 'down') => void;
}

export function VoteController({ initialUpvotes, initialDownvotes, userVote = null, onVoteChange, onVote }: VoteControllerProps) {
  const [vote, setVote] = useState<'up' | 'down' | null>(userVote);
  
  // Calculate net
  const baseNet = initialUpvotes - initialDownvotes;
  const currentNet = baseNet + (vote === 'up' && userVote !== 'up' ? 1 : 0) 
                             - (vote === 'down' && userVote !== 'down' ? 1 : 0)
                             - (userVote === 'up' && vote !== 'up' ? 1 : 0)
                             + (userVote === 'down' && vote !== 'down' ? 1 : 0);

  const handleVote = (type: 'up' | 'down') => {
    const newVote = vote === type ? null : type;
    setVote(newVote);
    if (onVote) {
      onVote(type);
    }
    if (onVoteChange) {
       onVoteChange(currentNet);
    }
  };

  return (
    <div className="flex flex-col items-center bg-muted/30 rounded-xl p-1 w-12 border border-border/50 shadow-sm">
      <button 
        onClick={(e) => { e.preventDefault(); handleVote('up'); }}
        className={cn("p-1.5 rounded-lg hover:bg-muted transition-colors active:scale-95", vote === 'up' ? 'text-accent' : 'text-muted-foreground')}
      >
        <ArrowBigUp className="w-6 h-6" fill={vote === 'up' ? 'currentColor' : 'none'} />
      </button>
      <motion.span 
        key={currentNet}
        initial={{ y: -5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="font-bold text-sm my-0.5 text-foreground tabular-nums tracking-tighter"
      >
        {currentNet}
      </motion.span>
      <button 
        onClick={(e) => { e.preventDefault(); handleVote('down'); }}
        className={cn("p-1.5 rounded-lg hover:bg-muted transition-colors active:scale-95", vote === 'down' ? 'text-destructive' : 'text-muted-foreground')}
      >
        <ArrowBigDown className="w-6 h-6" fill={vote === 'down' ? 'currentColor' : 'none'} />
      </button>
    </div>
  );
}
