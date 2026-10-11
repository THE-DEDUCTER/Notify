"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useComplaints } from "@/lib/context/ComplaintsContext";
import { Complaint, Department, Severity, Status } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SLACountdown } from "@/components/domain/SLACountdown";
import {
  ShieldAlert,
  Search,
  Filter,
  Building2,
  AlertTriangle,
  History,
  Trash2,
  Check,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  X,
  ArrowUpDown,
  CheckCircle2,
  Flame,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

export default function AdminComplaintsPage() {
  const {
    complaints,
    departments,
    reassignDepartment,
    updateComplaintSeverity,
    removeComplaint,
    updateComplaintStatus,
  } = useComplaints();

  // Filters
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState<string>("all");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [flaggedOnly, setFlaggedOnly] = useState<boolean>(false);

  // Reassignment Modal state
  const [reassignModalTicket, setReassignModalTicket] = useState<Complaint | null>(null);
  const [targetDeptId, setTargetDeptId] = useState<string>("");
  const [reassignReason, setReassignReason] = useState<string>("");

  // Severity Override Modal state
  const [severityModalTicket, setSeverityModalTicket] = useState<Complaint | null>(null);
  const [targetSeverity, setTargetSeverity] = useState<Severity>("High");

  // Audit Log Modal state
  const [auditModalTicket, setAuditModalTicket] = useState<Complaint | null>(null);

  // Filter complaints
  const filtered = complaints
    .filter((c) => {
      if (flaggedOnly) {
        return (
          c.status === "Under Review" ||
          (c.downvotes >= 5 && c.downvotes > c.upvotes)
        );
      }
      if (selectedDept !== "all" && c.departmentId !== selectedDept) return false;
      if (selectedSeverity !== "all" && c.severity !== selectedSeverity) return false;
      if (selectedStatus !== "all" && c.status !== selectedStatus) return false;

      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleOpenReassign = (ticket: Complaint) => {
    setReassignModalTicket(ticket);
    setTargetDeptId(ticket.departmentId);
    setReassignReason("");
  };

  const handleConfirmReassign = () => {
    if (!reassignModalTicket || !targetDeptId) return;
    reassignDepartment(
      reassignModalTicket.id,
      targetDeptId,
      reassignReason.trim() || "Reassigned by Administrator to improve resolution routing"
    );
    setReassignModalTicket(null);
  };

  const handleOpenSeverity = (ticket: Complaint) => {
    setSeverityModalTicket(ticket);
    setTargetSeverity(ticket.severity);
  };

  const handleConfirmSeverity = () => {
    if (!severityModalTicket) return;
    updateComplaintSeverity(severityModalTicket.id, targetSeverity);
    setSeverityModalTicket(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 py-4 sm:py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              Incident Management & Moderation
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              Total Records: {complaints.length}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            All Campus Grievances & Moderation
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Reassign departments, manage spam/disapproved reports, elevate severities, and view full audit trails.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant={flaggedOnly ? "destructive" : "outline"}
            onClick={() => setFlaggedOnly(!flaggedOnly)}
            className="rounded-xl font-semibold text-xs h-10 shadow-xs"
          >
            <Flame className="w-3.5 h-3.5 mr-1.5" />
            {flaggedOnly ? "Showing Flagged Only" : "Filter Flagged / Downvoted"}
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 p-4 rounded-2xl border border-border bg-card shadow-xs">
        {/* Keyword Search */}
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by ticket ID, title, keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 bg-background border-border rounded-xl text-sm"
          />
        </div>

        {/* Department Filter */}
        <div>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm font-medium text-foreground focus:outline-none"
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* Severity Filter */}
        <div>
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm font-medium text-foreground focus:outline-none"
          >
            <option value="all">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm font-medium text-foreground focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Pending Confirmation">Pending Confirmation</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
            <option value="Under Review">Under Review</option>
            <option value="Removed">Removed</option>
          </select>
        </div>
      </div>

      {/* Main Table View */}
      <div className="border border-border rounded-2xl bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 border-b border-border text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="py-3 px-4">Ticket</th>
                <th className="py-3 px-4">Department & Category</th>
                <th className="py-3 px-3 text-center">Severity</th>
                <th className="py-3 px-3 text-center">Votes</th>
                <th className="py-3 px-3">Status / SLA</th>
                <th className="py-3 px-4 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filtered.map((ticket) => {
                const dept = departments.find((d) => d.id === ticket.departmentId);
                const netVotes = ticket.upvotes - ticket.downvotes;
                const isUnderReview = ticket.status === "Under Review";
                const isRemoved = ticket.status === "Removed";

                return (
                  <tr
                    key={ticket.id}
                    className={`hover:bg-muted/20 transition-colors ${
                      isRemoved
                        ? "opacity-50 bg-muted/10"
                        : isUnderReview
                        ? "bg-amber-500/5"
                        : ""
                    }`}
                  >
                    {/* Ticket ID & Title */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-foreground">
                          {ticket.id.toUpperCase()}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          • {format(new Date(ticket.createdAt), "MMM d")}
                        </span>
                        <span className="text-[11px] font-medium text-primary/80">
                          Anonymous
                        </span>
                      </div>
                      <Link
                        href={`/complaint/${ticket.id}`}
                        className="font-bold text-foreground hover:text-primary transition-colors line-clamp-1 text-sm block"
                      >
                        {ticket.title}
                      </Link>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {ticket.description}
                      </p>
                    </td>

                    {/* Department & Category */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-semibold text-foreground text-xs">
                        {dept?.name || "Unassigned"}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {ticket.category}
                      </div>
                    </td>

                    {/* Severity Pill */}
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleOpenSeverity(ticket)}
                        title="Click to override severity"
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold border transition-transform hover:scale-105 bg-severity-${ticket.severity.toLowerCase()}`}
                      >
                        {ticket.severity}
                      </button>
                    </td>

                    {/* Votes */}
                    <td className="py-3.5 px-3 text-center whitespace-nowrap font-mono text-xs">
                      <span
                        className={`font-bold ${
                          netVotes < 0
                            ? "text-destructive"
                            : netVotes > 0
                            ? "text-green-600 dark:text-green-400"
                            : "text-muted-foreground"
                        }`}
                      >
                        {netVotes > 0 ? `+${netVotes}` : netVotes}
                      </span>
                      <div className="text-[10px] text-muted-foreground">
                        +{ticket.upvotes} / -{ticket.downvotes}
                      </div>
                    </td>

                    {/* Status & SLA */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium border bg-muted text-muted-foreground block w-fit mb-1">
                        {ticket.status}
                      </span>
                      {ticket.slaDeadline && ticket.status !== "Resolved" && ticket.status !== "Closed" && (
                        <SLACountdown deadline={ticket.slaDeadline} />
                      )}
                    </td>

                    {/* Admin Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenReassign(ticket)}
                          className="h-8 text-xs rounded-xl px-2.5"
                          title="Reassign department"
                        >
                          <Building2 className="w-3.5 h-3.5 mr-1" />
                          Reassign
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setAuditModalTicket(ticket)}
                          className="h-8 text-xs rounded-xl px-2.5 text-muted-foreground hover:text-foreground"
                          title="Audit Trail"
                        >
                          <History className="w-3.5 h-3.5 mr-1" />
                          Audit
                        </Button>

                        {ticket.status !== "Removed" ? (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              removeComplaint(ticket.id, "Removed by Administrator via Moderation Console")
                            }
                            className="h-8 text-xs rounded-xl px-2"
                            title="Remove spam or policy violation"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updateComplaintStatus(ticket.id, "Submitted", "Restored from Removed state by Administrator")
                            }
                            className="h-8 text-xs rounded-xl px-2 text-green-600"
                            title="Restore"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center text-muted-foreground">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-muted-foreground/60" />
            <h4 className="font-bold text-foreground text-sm">No complaints found</h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              No tickets matched the specified search and filter criteria.
            </p>
          </div>
        )}
      </div>

      {/* Modal: Reassign Department */}
      <AnimatePresence>
        {reassignModalTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setReassignModalTicket(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-bold text-foreground mb-1">
                Reassign Department
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                Routing ticket #{reassignModalTicket.id.toUpperCase()} to another division
              </p>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                    Target Department
                  </label>
                  <select
                    value={targetDeptId}
                    onChange={(e) => setTargetDeptId(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-border bg-background text-sm font-semibold text-foreground focus:outline-none"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                    Reassignment Note / Reason
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Issue was misfiled under hostel; requires plumbing technicians."
                    value={reassignReason}
                    onChange={(e) => setReassignReason(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none text-foreground"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setReassignModalTicket(null)}
                    className="rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirmReassign}
                    className="rounded-xl font-semibold shadow-xs"
                  >
                    Confirm Reassignment
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Severity Override */}
      <AnimatePresence>
        {severityModalTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border rounded-2xl max-w-sm w-full p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setSeverityModalTicket(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-bold text-foreground mb-1">
                Override Severity
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                Recalculates turnaround SLA deadline accordingly
              </p>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {(["Critical", "High", "Medium", "Low"] as Severity[]).map((sev) => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setTargetSeverity(sev)}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all text-center ${
                        targetSeverity === sev
                          ? "border-primary ring-2 ring-primary/20 bg-primary/10 text-primary"
                          : "border-border hover:border-primary/40 text-foreground bg-background"
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setSeverityModalTicket(null)}
                    className="rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirmSeverity}
                    className="rounded-xl font-semibold shadow-xs"
                  >
                    Update Severity
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Audit Trail Inspector */}
      <AnimatePresence>
        {auditModalTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border rounded-2xl max-w-xl w-full p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setAuditModalTicket(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-1">
                <History className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold text-foreground">
                  Audit Trail & History
                </h3>
              </div>
              <p className="text-xs text-muted-foreground mb-6">
                Ticket #{auditModalTicket.id.toUpperCase()} • {auditModalTicket.title}
              </p>

              <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                {auditModalTicket.history.map((event, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                    <div className="flex-1 p-3 rounded-xl border border-border bg-background">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-bold text-foreground">
                          {event.status}
                        </span>
                        <span className="font-mono text-muted-foreground text-[10px]">
                          {format(new Date(event.timestamp), "MMM d, yyyy • h:mm a")}
                        </span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        {event.note || "Status updated"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-4 border-t border-border mt-4">
                <Button
                  onClick={() => setAuditModalTicket(null)}
                  className="rounded-xl font-medium"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
