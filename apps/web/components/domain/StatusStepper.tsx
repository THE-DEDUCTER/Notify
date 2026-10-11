"use client";
import { Check } from "lucide-react";
import { Status } from "@/types";

interface StatusStepperProps {
  currentStatus: Status;
  history: { status: Status; timestamp: string }[];
}

const STATUS_FLOW: Status[] = [
  "Submitted", "Under Review", "Assigned", "In Progress", "Pending Confirmation", "Resolved"
];

export function StatusStepper({ currentStatus, history }: StatusStepperProps) {
  const isClosed = currentStatus === "Closed";
  const isReopened = currentStatus === "Reopened";
  const isRemoved = currentStatus === "Removed";

  const activeFlow = (isClosed || isReopened || isRemoved) ? [...STATUS_FLOW.slice(0, 4), currentStatus] : STATUS_FLOW;
  const activeIndex = activeFlow.indexOf(currentStatus);

  return (
    <div className="py-6 overflow-x-auto no-scrollbar">
      <div className="flex items-center min-w-[600px] px-2">
        {activeFlow.map((step, idx) => {
          const isCompleted = idx < activeIndex || isClosed;
          const isCurrent = idx === activeIndex && !isClosed;
          
          const hist = history.find(h => h.status === step);
          const timeLabel = hist ? new Date(hist.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' }) : null;

          return (
            <div key={step} className="flex-1 flex flex-col relative group">
              {idx < activeFlow.length - 1 && (
                <div className={`absolute top-4 left-1/2 w-full h-[2px] -z-10 transition-colors duration-500 ${
                  isCompleted ? 'bg-primary' : 'bg-muted'
                }`} />
              )}
              
              <div className="flex flex-col items-center text-center gap-2 z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isCompleted 
                    ? 'bg-primary border-primary text-primary-foreground' 
                    : isCurrent 
                      ? 'bg-background border-primary text-primary shadow-sm shadow-primary/20 ring-4 ring-primary/10 scale-110' 
                      : 'bg-muted border-muted-foreground/20 text-muted-foreground'
                }`}>
                  {isCompleted ? <Check className="w-4 h-4 font-bold" /> : <div className="w-2.5 h-2.5 rounded-full bg-current" />}
                </div>
                
                <div className="flex flex-col items-center">
                  <span className={`text-xs font-bold ${isCurrent ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step}
                  </span>
                  {timeLabel && (
                    <span className="text-[10px] text-muted-foreground mt-0.5">{timeLabel}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
