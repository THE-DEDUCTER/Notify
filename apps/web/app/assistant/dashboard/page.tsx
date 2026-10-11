"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import { useComplaints, ResolutionData } from "@/lib/context/ComplaintsContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SLACountdown } from "@/components/domain/SLACountdown";
import {
  Wrench,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
  Check,
  UploadCloud,
  FileCheck2,
  ExternalLink,
  ChevronDown,
  Building2,
  Layers,
  Sparkles,
  X,
  Camera,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCurrentTime, isBreachedSafe } from "@/lib/hooks/useCurrentTime";

const PROOF_PHOTO_PRESETS = [
  {
    label: "Plumbing Joint Replaced",
    url: "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?q=80&w=800&auto=format&fit=crop",
  },
  {
    label: "Electrical Conduit Fixed",
    url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=800&auto=format&fit=crop",
  },
  {
    label: "Area Cleaned & Sanitized",
    url: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=800&auto=format&fit=crop",
  },
  {
    label: "Door & Hardware Repaired",
    url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800&auto=format&fit=crop",
  },
];

export default function AssistantDashboard() {
  const { user } = useAuth();
  const {
    complaints,
    departments,
    claimComplaint,
    updateComplaintStatus,
    resolveWithProof,
  } = useComplaints();
  const now = useCurrentTime();

  // Assistant default department or selected department
  const [selectedDeptId, setSelectedDeptId] = useState<string>(
    user?.departmentId || "dept_1"
  );
  const [activeTab, setActiveTab] = useState<
    "all" | "mine" | "unassigned" | "critical" | "pending"
  >("all");
  const [search, setSearch] = useState("");

  // Resolution modal state
  const [resolvingTicketId, setResolvingTicketId] = useState<string | null>(null);
  const [proofNote, setProofNote] = useState("");
  const [selectedProofImg, setSelectedProofImg] = useState<string>(
    PROOF_PHOTO_PRESETS[0].url
  );

  const currentDept = departments.find((d) => d.id === selectedDeptId);

  // Complaints in this department (excluding permanently removed spam)
  const deptComplaints = complaints.filter(
    (c) => c.departmentId === selectedDeptId && c.status !== "Removed"
  );

  // Compute metrics
  const myAssignedCount = deptComplaints.filter(
    (c) =>
      c.assignedAssistantId === user?.id &&
      c.status !== "Resolved" &&
      c.status !== "Closed"
  ).length;

  const unassignedCount = deptComplaints.filter(
    (c) => !c.assignedAssistantId && c.status === "Submitted"
  ).length;

  const breachedOrCriticalCount = deptComplaints.filter((c) => {
    if (c.status === "Resolved" || c.status === "Closed") return false;
    const isCritical = c.severity === "Critical";
    const isBreached = isBreachedSafe(c.slaDeadline, now);
    return isCritical || isBreached;
  }).length;

  const pendingConfirmationCount = deptComplaints.filter(
    (c) => c.status === "Pending Confirmation"
  ).length;

  // Filter complaints based on tab & search
  const filteredComplaints = deptComplaints
    .filter((c) => {
      if (activeTab === "mine") {
        return (
          c.assignedAssistantId === user?.id &&
          c.status !== "Resolved" &&
          c.status !== "Closed"
        );
      }
      if (activeTab === "unassigned") {
        return !c.assignedAssistantId && c.status === "Submitted";
      }
      if (activeTab === "critical") {
        const isCritical = c.severity === "Critical";
        const isBreached = isBreachedSafe(c.slaDeadline, now);
        return (
          (isCritical || isBreached) &&
          c.status !== "Resolved" &&
          c.status !== "Closed"
        );
      }
      if (activeTab === "pending") {
        return c.status === "Pending Confirmation";
      }
      return true;
    })
    .filter((c) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      // Prioritize unresolved critical items
      const aBreached =
        isBreachedSafe(a.slaDeadline, now) ? 2 : a.severity === "Critical" ? 1 : 0;
      const bBreached =
        isBreachedSafe(b.slaDeadline, now) ? 2 : b.severity === "Critical" ? 1 : 0;
      if (aBreached !== bBreached) return bBreached - aBreached;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const handleOpenResolve = (id: string) => {
    setResolvingTicketId(id);
    setProofNote("");
    setSelectedProofImg(PROOF_PHOTO_PRESETS[0].url);
  };

  const handleConfirmResolve = () => {
    if (!resolvingTicketId) return;
    resolveWithProof(resolvingTicketId, {
      note:
        proofNote.trim() ||
        "Technician completed on-site repairs and confirmed system operation. Photo evidence attached.",
      proofImageUrl: selectedProofImg,
    });
    setResolvingTicketId(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 py-4 sm:py-6">
      {/* Top Header & Department Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5" />
              Operations Queue
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              Staff Portal • {user?.name || "Field Assistant"}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            {currentDept?.name || "Department"} Dispatch
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage incident lifecycle, accept work tickets, and upload resolution proof for student sign-off.
          </p>
        </div>

        {/* Department Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-card border border-border px-3 py-2 rounded-xl shadow-xs">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            <select
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
              className="bg-transparent text-sm font-semibold text-foreground focus:outline-none cursor-pointer pr-2"
            >
              {departments.map((d) => (
                <option key={d.id} value={d.id} className="bg-popover text-foreground">
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card
          onClick={() => setActiveTab("mine")}
          className={`cursor-pointer transition-all hover:border-primary/50 ${
            activeTab === "mine" ? "border-primary ring-2 ring-primary/20 bg-primary/5" : ""
          }`}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Assigned To Me
            </CardTitle>
            <Wrench className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-foreground">{myAssignedCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Active tickets in progress</p>
          </CardContent>
        </Card>

        <Card
          onClick={() => setActiveTab("unassigned")}
          className={`cursor-pointer transition-all hover:border-primary/50 ${
            activeTab === "unassigned" ? "border-primary ring-2 ring-primary/20 bg-primary/5" : ""
          }`}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Unassigned Queue
            </CardTitle>
            <Layers className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-foreground">{unassignedCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Available to claim</p>
          </CardContent>
        </Card>

        <Card
          onClick={() => setActiveTab("critical")}
          className={`cursor-pointer transition-all hover:border-destructive/50 ${
            activeTab === "critical"
              ? "border-destructive ring-2 ring-destructive/20 bg-destructive/5"
              : ""
          }`}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              SLA Risk & Critical
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-destructive">
              {breachedOrCriticalCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Requires immediate dispatch</p>
          </CardContent>
        </Card>

        <Card
          onClick={() => setActiveTab("pending")}
          className={`cursor-pointer transition-all hover:border-primary/50 ${
            activeTab === "pending" ? "border-primary ring-2 ring-primary/20 bg-primary/5" : ""
          }`}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Pending Verification
            </CardTitle>
            <FileCheck2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-foreground">
              {pendingConfirmationCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting student sign-off</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
          {[
            { id: "all", label: "All Department Tickets", count: deptComplaints.length },
            { id: "mine", label: "My Assigned", count: myAssignedCount },
            { id: "unassigned", label: "Unassigned", count: unassignedCount },
            { id: "critical", label: "SLA Urgent", count: breachedOrCriticalCount },
            { id: "pending", label: "Awaiting Confirmation", count: pendingConfirmationCount },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                  : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {tab.label}
              <span
                className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  activeTab === tab.id
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 bg-card border-border rounded-xl text-sm"
          />
        </div>
      </div>

      {/* Queue Tickets List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredComplaints.map((complaint) => {
            const isBreached = isBreachedSafe(complaint.slaDeadline, now);
            const isAssignedToMe = complaint.assignedAssistantId === user?.id;

            return (
              <motion.div
                key={complaint.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className={`p-5 rounded-2xl border bg-card transition-all shadow-xs hover:shadow-md ${
                  isBreached
                    ? "border-destructive/40 bg-destructive/5"
                    : complaint.severity === "Critical"
                    ? "border-destructive/30"
                    : "border-border"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Left Column: Complaint Details */}
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-muted text-foreground border border-border">
                        {complaint.id.toUpperCase()}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold border bg-severity-${complaint.severity.toLowerCase()}`}
                      >
                        {complaint.severity}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium border bg-muted text-muted-foreground">
                        {complaint.status}
                      </span>
                      <span className="text-xs text-muted-foreground font-medium">
                        • {complaint.category}
                      </span>
                      <span className="text-xs text-muted-foreground font-medium">
                        • Raiser: <strong className="text-foreground">Anonymous</strong> (ID: {complaint.raiserId})
                      </span>
                      {complaint.slaDeadline && complaint.status !== "Resolved" && (
                        <SLACountdown deadline={complaint.slaDeadline} />
                      )}
                    </div>

                    <Link
                      href={`/complaint/${complaint.id}`}
                      className="group flex items-center gap-1.5"
                    >
                      <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                        {complaint.title}
                      </h3>
                      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>

                    <p className="text-sm text-foreground/85 leading-relaxed">
                      {complaint.description}
                    </p>

                    {/* Attached Photo Evidence Preview */}
                    {complaint.images && complaint.images.length > 0 && (
                      <div className="flex items-center gap-3 pt-2">
                        {complaint.images.map((img, idx) => (
                          <a
                            key={idx}
                            href={img}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative w-20 h-16 rounded-xl overflow-hidden border border-border group shrink-0"
                          >
                            <img
                              src={img}
                              alt="Grievance evidence"
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <ExternalLink className="w-3.5 h-3.5 text-white" />
                            </div>
                          </a>
                        ))}
                        <span className="text-xs text-muted-foreground">
                          {complaint.images.length} photo attachment(s)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex flex-col sm:flex-row md:flex-col items-stretch md:items-end gap-2.5 shrink-0 pt-2 md:pt-0">
                    {/* Unassigned Ticket Action */}
                    {!complaint.assignedAssistantId && (
                      <Button
                        onClick={() => claimComplaint(complaint.id, user?.id || "ast_1")}
                        className="rounded-xl font-semibold shadow-xs"
                      >
                        <Wrench className="w-4 h-4 mr-2" />
                        Claim Ticket
                      </Button>
                    )}

                    {/* Assigned Ticket Workflow */}
                    {complaint.assignedAssistantId && (
                      <div className="flex flex-col gap-2 w-full sm:w-auto">
                        <div className="text-xs text-muted-foreground font-mono md:text-right">
                          {isAssignedToMe ? (
                            <span className="text-primary font-semibold">● Assigned to you</span>
                          ) : (
                            <span>Assigned to staff ID {complaint.assignedAssistantId}</span>
                          )}
                        </div>

                        {complaint.status === "Assigned" && (
                          <Button
                            variant="outline"
                            onClick={() =>
                              updateComplaintStatus(
                                complaint.id,
                                "In Progress",
                                "Technician dispatched on-site"
                              )
                            }
                            className="rounded-xl font-medium"
                          >
                            Begin Work (In Progress)
                          </Button>
                        )}

                        {complaint.status === "In Progress" && (
                          <Button
                            onClick={() => handleOpenResolve(complaint.id)}
                            className="bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold shadow-sm"
                          >
                            <FileCheck2 className="w-4 h-4 mr-2" />
                            Complete & Upload Proof
                          </Button>
                        )}

                        {complaint.status === "Pending Confirmation" && (
                          <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold text-center">
                            Awaiting student verification
                          </div>
                        )}

                        {complaint.status === "Resolved" && (
                          <div className="px-3 py-1.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-xs font-semibold text-center flex items-center justify-center gap-1.5">
                            <Check className="w-3.5 h-3.5" />
                            Resolved
                          </div>
                        )}
                      </div>
                    )}

                    <Link href={`/complaint/${complaint.id}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-muted-foreground hover:text-foreground w-full"
                      >
                        Inspect Thread
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredComplaints.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl bg-card/40">
            <CheckCircle2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-base font-bold text-foreground">No tickets in this view</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              All tickets matching "{activeTab}" for {currentDept?.name} have been processed or moved to other states.
            </p>
          </div>
        )}
      </div>

      {/* Resolution Proof Upload Dialog */}
      <AnimatePresence>
        {resolvingTicketId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setResolvingTicketId(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-600 flex items-center justify-center">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    Resolution Proof Submission
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Ticket #{resolvingTicketId} • Photo & Technician Notes
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Proof Photo Selector */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                    Select Completion Proof Photo
                  </label>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    {PROOF_PHOTO_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setSelectedProofImg(preset.url)}
                        className={`relative rounded-xl overflow-hidden border-2 p-1 text-left transition-all ${
                          selectedProofImg === preset.url
                            ? "border-primary ring-2 ring-primary/20"
                            : "border-border/60 hover:border-primary/40"
                        }`}
                      >
                        <img
                          src={preset.url}
                          alt={preset.label}
                          className="h-20 w-full object-cover rounded-lg"
                        />
                        <span className="block text-[11px] font-semibold text-foreground mt-1 truncate">
                          {preset.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Technician Work Notes */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                    Technician Work Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Specify parts replaced, test results, or completion details..."
                    value={proofNote}
                    onChange={(e) => setProofNote(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none text-foreground"
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">
                    This note and photo will be displayed to the student to confirm work quality.
                  </p>
                </div>

                {/* Modal Buttons */}
                <div className="flex justify-end gap-2.5 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setResolvingTicketId(null)}
                    className="rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirmResolve}
                    className="bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold shadow-xs"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Submit For Student Sign-Off
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
