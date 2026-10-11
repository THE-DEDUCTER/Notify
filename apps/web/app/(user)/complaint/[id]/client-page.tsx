"use client";
import { notFound } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { useComplaints } from "@/lib/context/ComplaintsContext";
import { VoteController } from "@/components/domain/VoteController";
import { SLACountdown } from "@/components/domain/SLACountdown";
import { StatusStepper } from "@/components/domain/StatusStepper";
import { Button } from "@/components/ui/button";
import { MapPin, User as UserIcon, Calendar, Info, XCircle, CheckCircle } from "lucide-react";
import { format } from "date-fns";

export function ComplaintDetailClient({ id }: { id: string }) {
  const complaintId = id;
  const { user } = useAuth();
  const { complaints, departments, assistants, updateComplaintStatus, voteComplaint } = useComplaints();
  
  const complaint = complaints.find(c => c.id === complaintId);

  if (!complaint) notFound();

  const department = departments.find(d => d.id === complaint.departmentId);
  const assistant = assistants.find(a => a.id === complaint.assignedAssistantId);
  
  const isRaiser = user?.role === 'Student' || user?.role === 'Faculty';
  const isPendingConfirmation = complaint.status === "Pending Confirmation";

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="flex flex-col md:flex-row gap-6 mb-8 bg-card border border-border p-6 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="shrink-0 pt-1 relative z-10">
          <VoteController 
            initialUpvotes={complaint.upvotes} 
            initialDownvotes={complaint.downvotes} 
            onVote={(type) => voteComplaint(complaint.id, type)}
          />
        </div>
        
        <div className="flex-1 min-w-0 relative z-10">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border bg-severity-${complaint.severity.toLowerCase()} shadow-sm`}>
              {complaint.severity} Severity
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold border bg-muted text-muted-foreground shadow-sm">
              {complaint.status}
            </span>
            {complaint.slaDeadline && (
              <SLACountdown deadline={complaint.slaDeadline} />
            )}
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mb-4 leading-tight">
            {complaint.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              <span className="font-medium">{complaint.category}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <UserIcon className="w-4 h-4" />
              <span className="font-medium">{complaint.isAnonymous ? 'Anonymous' : 'Student'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span className="font-medium">{format(new Date(complaint.createdAt), 'MMM d, yyyy • h:mm a')}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border p-6 sm:p-8 rounded-2xl shadow-sm mb-8 overflow-hidden">
        <h2 className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground mb-6">Status Timeline</h2>
        <StatusStepper currentStatus={complaint.status} history={complaint.history} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <div className="bg-card border border-border p-6 sm:p-8 rounded-2xl shadow-sm">
            <h2 className="text-lg font-extrabold text-foreground mb-5">Description</h2>
            <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap text-[15px]">
              {complaint.description}
            </p>
            
            {complaint.images && complaint.images.length > 0 && (
              <div className="mt-8 pt-8 border-t border-border/50">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground mb-4">Attached Evidence</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {complaint.images.map((img, idx) => (
                    <div key={idx} className="relative aspect-[4/3] rounded-xl overflow-hidden border border-border shadow-sm group bg-muted">
                      <img src={img} alt={`Attachment ${idx + 1}`} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {isRaiser && isPendingConfirmation && (
            <div className="bg-primary/5 border border-primary/20 p-6 sm:p-8 rounded-2xl shadow-sm">
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-primary mb-2">Resolution Confirmation Required</h3>
                  <p className="text-sm text-foreground/80 mb-6 leading-relaxed">
                    The assigned assistant has marked this issue as resolved. Please verify if the problem has been fixed to your satisfaction. 
                    <span className="block mt-2 font-bold opacity-80 text-primary">Auto-closes in 5 days if no response.</span>
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button onClick={() => updateComplaintStatus(complaint.id, "Closed", "Confirmed resolved by student")} className="bg-green-600 hover:bg-green-700 text-white shadow-sm font-semibold h-11 px-6 rounded-xl">
                      <CheckCircle className="w-4 h-4 mr-2" /> Confirm Resolution
                    </Button>
                    <Button onClick={() => updateComplaintStatus(complaint.id, "Reopened", "Rejected by student: issue requires further work")} variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10 font-semibold h-11 px-6 rounded-xl">
                      <XCircle className="w-4 h-4 mr-2" /> Reject & Reopen
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-6">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">Assignment Details</h2>
            
            <div>
              <div className="text-xs text-muted-foreground mb-1.5 font-medium">Department</div>
              <div className="font-semibold text-[15px]">{department?.name || 'Unassigned'}</div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground mb-1.5 font-medium">Assigned Assistant</div>
              <div className="font-semibold text-[15px] flex items-center gap-3">
                {assistant ? (
                  <>
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold border border-primary/20">
                      {assistant.name.charAt(0)}
                    </div>
                    {assistant.name}
                  </>
                ) : (
                  <span className="text-muted-foreground italic font-normal">Pending Assignment</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-muted/40 border border-border p-5 rounded-2xl flex items-start gap-3">
            <Info className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
              This grievance was raised anonymously. The identity of the raiser is masked from the community, assistants, and administrators.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
