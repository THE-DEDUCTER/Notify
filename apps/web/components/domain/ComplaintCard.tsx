"use client";
import Link from "next/link";
import { Complaint } from "@/types";
import { VoteController } from "./VoteController";
import { SLACountdown } from "./SLACountdown";
import { MapPin } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";
import { useComplaints } from "@/lib/context/ComplaintsContext";

import { ComplaintThumbnail } from "./ComplaintThumbnail";

function RelativeTime({ date }: { date: string | Date }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <span>Just now</span>;
  return <span>{formatDistanceToNow(new Date(date), { addSuffix: true })}</span>;
}

export function ComplaintCard({ complaint }: { complaint: Complaint }) {
  const { voteComplaint } = useComplaints();
  const isCritical = complaint.severity === 'Critical';

  return (
    <Link href={`/complaint/${complaint.id}`} className="block group">
      <div className={`flex gap-3.5 sm:gap-4 p-3.5 sm:p-5 rounded-2xl border bg-card transition-all hover:shadow-lg hover:-translate-y-0.5 ${isCritical ? 'border-red-200/60 dark:border-red-900/40 shadow-sm shadow-red-100 dark:shadow-none' : 'border-border hover:border-primary/20'}`}>
        <div onClick={e => e.preventDefault()} className="shrink-0">
          <VoteController 
            initialUpvotes={complaint.upvotes} 
            initialDownvotes={complaint.downvotes} 
            onVote={(type) => voteComplaint(complaint.id, type)}
          />
        </div>
        
        <ComplaintThumbnail
          images={complaint.images}
          category={complaint.category}
          className="w-20 h-20 sm:w-28 sm:h-28"
        />
        
        <div className="flex-1 min-w-0 flex flex-col py-0.5">
          <div className="flex items-start justify-between gap-4 mb-1.5">
            <h3 className="font-semibold text-[17px] text-foreground group-hover:text-primary transition-colors truncate">
              {complaint.title}
            </h3>
            {complaint.slaDeadline && complaint.status !== 'Resolved' && complaint.status !== 'Closed' && (
              <SLACountdown deadline={complaint.slaDeadline} />
            )}
          </div>

          <p className="text-muted-foreground text-sm line-clamp-2 mb-4 leading-relaxed">
            {complaint.description}
          </p>

          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs mt-auto">
            <span className={`px-2.5 py-0.5 rounded-full font-medium border bg-severity-${complaint.severity.toLowerCase()}`}>
              {complaint.severity}
            </span>
            <span className="px-2.5 py-0.5 rounded-full font-medium border bg-muted text-muted-foreground">
              {complaint.status}
            </span>
            <div className="flex items-center gap-1 text-muted-foreground ml-2">
              <MapPin className="w-3.5 h-3.5" />
              <span>{complaint.category}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground ml-auto whitespace-nowrap">
              <RelativeTime date={complaint.createdAt} />
              <span className="mx-1.5">•</span>
              <span className="text-primary/80 font-medium">{complaint.isAnonymous ? 'Anonymous' : 'Student'}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
