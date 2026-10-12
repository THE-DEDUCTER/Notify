"use client";
import React, { useState, useEffect } from "react";
import {
  useComplaints,
  SLAConfig,
  VoteRulesConfig,
  AuditLogEntry,
} from "@/lib/context/ComplaintsContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Crown,
  Settings,
  Building2,
  Download,
  Check,
  Plus,
  ShieldCheck,
  BarChart3,
  Clock,
  Layers,
  Sparkles,
  FileSpreadsheet,
  Users,
  UserPlus,
  Sliders,
  AlertOctagon,
  RotateCcw,
  Activity,
  ShieldAlert,
  CheckCircle2,
  Search,
  Filter,
  AlertTriangle,
  X,
  Flame,
  ThumbsUp,
  ThumbsDown,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SuperAdminAnalyticsPage() {
  const {
    complaints,
    departments,
    assistants,
    slaThresholds,
    voteRules,
    systemAuditLog,
    updateSlaThresholds,
    updateVoteRules,
    addDepartment,
    addAssistant,
    resetToFactoryDefaults,
  } = useComplaints();

  // Hydration safety flag for client rendering timestamps
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Local SLA inputs
  const [localSLA, setLocalSLA] = useState<SLAConfig>({ ...slaThresholds });
  const [slaSaved, setSlaSaved] = useState(false);

  // Local Vote Rules inputs
  const [localVoteRules, setLocalVoteRules] = useState<VoteRulesConfig>({
    ...voteRules,
  });
  const [voteRulesSaved, setVoteRulesSaved] = useState(false);

  // Modals
  const [showAddDept, setShowAddDept] = useState(false);
  const [newDeptName, setNewDeptName] = useState("");

  const [showAddAssistant, setShowAddAssistant] = useState(false);
  const [newAssistantName, setNewAssistantName] = useState("");
  const [newAssistantDept, setNewAssistantDept] = useState(
    departments[0]?.id || "dept_estate"
  );

  const [showResetModal, setShowResetModal] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Audit Log Filter / Search
  const [auditSearch, setAuditSearch] = useState("");
  const [auditFilterType, setAuditFilterType] = useState<string>("all");

  // Keep local configs in sync if context changes
  useEffect(() => {
    setLocalSLA(slaThresholds);
  }, [slaThresholds]);

  useEffect(() => {
    setLocalVoteRules(voteRules);
  }, [voteRules]);

  const handleSaveSLA = () => {
    updateSlaThresholds(localSLA);
    setSlaSaved(true);
    setTimeout(() => setSlaSaved(false), 3000);
  };

  const handleSaveVoteRules = () => {
    updateVoteRules(localVoteRules);
    setVoteRulesSaved(true);
    setTimeout(() => setVoteRulesSaved(false), 3000);
  };

  const handleAddDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;
    addDepartment(newDeptName.trim());
    setNewDeptName("");
    setShowAddDept(false);
  };

  const handleAddAssistant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssistantName.trim()) return;
    addAssistant({
      name: newAssistantName.trim(),
      departmentId: newAssistantDept,
    });
    setNewAssistantName("");
    setShowAddAssistant(false);
  };

  const handleConfirmReset = () => {
    resetToFactoryDefaults();
    setShowResetModal(false);
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 4000);
  };

  // CSV Export Generator
  const handleExportCSV = () => {
    const headers = [
      "Ticket ID",
      "Title",
      "Category",
      "Department",
      "Severity",
      "Status",
      "Upvotes",
      "Downvotes",
      "Net Votes",
      "Created At",
      "SLA Deadline",
      "Resolved At",
    ];

    const rows = complaints.map((c) => {
      const deptName =
        departments.find((d) => d.id === c.departmentId)?.name ||
        c.departmentId;
      return [
        c.id,
        `"${c.title.replace(/"/g, '""')}"`,
        c.category,
        `"${deptName}"`,
        c.severity,
        c.status,
        c.upvotes,
        c.downvotes,
        c.upvotes - c.downvotes,
        c.createdAt,
        c.slaDeadline || "N/A",
        c.resolvedAt || "N/A",
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `notify_university_grievance_audit_${Date.now()}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // KPI Calculations
  const totalComplaints = complaints.length;
  const activeComplaints = complaints.filter(
    (c) => c.status !== "Resolved" && c.status !== "Closed" && c.status !== "Removed"
  ).length;
  const resolvedCount = complaints.filter(
    (c) => c.status === "Resolved" || c.status === "Closed"
  ).length;
  const totalVotesCast = complaints.reduce(
    (acc, curr) => acc + curr.upvotes + curr.downvotes,
    0
  );

  // Filtered Audit Log
  const filteredAuditLog = systemAuditLog.filter((entry) => {
    const matchesSearch =
      entry.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
      entry.details.toLowerCase().includes(auditSearch.toLowerCase()) ||
      entry.actor.toLowerCase().includes(auditSearch.toLowerCase());
    const matchesType =
      auditFilterType === "all" || entry.type === auditFilterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 py-4 sm:py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5" />
              Institutional Authority
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              University Policy, Roster & System Engine
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Governance & Super Admin Suite
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Configure turnaround SLAs, democratic voting thresholds, manage staff rosters, and inspect tamper-evident audit streams.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={handleExportCSV}
            className="rounded-xl font-semibold shadow-xs"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Audit (CSV)
          </Button>

          <Button
            variant="outline"
            onClick={() => setShowResetModal(true)}
            className="rounded-xl font-semibold border-destructive/30 text-destructive hover:bg-destructive/10"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Factory Reset
          </Button>
        </div>
      </div>

      {/* Success Notification: Reset */}
      <AnimatePresence>
        {resetSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl border border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400 flex items-center gap-2 text-sm font-medium shadow-xs"
          >
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>System baseline has been successfully restored to factory defaults. All test data re-initialized.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Institutional KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-border bg-card shadow-xs">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between text-muted-foreground mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Reports</span>
              <FileSpreadsheet className="w-4 h-4 text-primary" />
            </div>
            <div className="text-2xl font-black text-foreground">{totalComplaints}</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">{resolvedCount} completed</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-xs">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between text-muted-foreground mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider">Active Queue</span>
              <Activity className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-amber-500">{activeComplaints}</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">In resolution pipeline</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-xs">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between text-muted-foreground mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider">Divisions</span>
              <Building2 className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-black text-foreground">{departments.length}</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Operational units</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-xs">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between text-muted-foreground mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider">Field Staff</span>
              <Users className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-foreground">{assistants.length}</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Deployed technicians</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-xs col-span-2 lg:col-span-1">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between text-muted-foreground mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider">Engagement</span>
              <Flame className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl font-black text-foreground">{totalVotesCast}</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Community votes cast</p>
          </CardContent>
        </Card>
      </div>

      {/* Grid Row 1: SLA Policy Configuration & Dynamic Voting Rules */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Card 1: SLA Policy Configuration */}
        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="pb-4 border-b border-border/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-foreground">
                    Resolution SLA Deadlines
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Turnaround time limits (in hours) enforced per ticket severity
                  </p>
                </div>
              </div>
              {slaSaved && (
                <span className="text-xs font-bold text-green-600 dark:text-green-400 flex items-center gap-1 animate-pulse">
                  <Check className="w-3.5 h-3.5" /> Saved
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 p-3.5 rounded-xl border border-destructive/20 bg-destructive/5">
                <label className="text-xs font-bold text-destructive block">
                  Critical Severity
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="1"
                    max="168"
                    value={localSLA.Critical}
                    onChange={(e) =>
                      setLocalSLA({ ...localSLA, Critical: parseInt(e.target.value) || 12 })
                    }
                    className="h-9 font-mono font-bold text-sm bg-background border-border"
                  />
                  <span className="text-xs font-mono text-muted-foreground">hours</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Power loss, gas/water breaches, server outages
                </p>
              </div>

              <div className="space-y-1.5 p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5">
                <label className="text-xs font-bold text-amber-600 dark:text-amber-400 block">
                  High Severity
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="1"
                    max="168"
                    value={localSLA.High}
                    onChange={(e) =>
                      setLocalSLA({ ...localSLA, High: parseInt(e.target.value) || 24 })
                    }
                    className="h-9 font-mono font-bold text-sm bg-background border-border"
                  />
                  <span className="text-xs font-mono text-muted-foreground">hours</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Library Wi-Fi, lab equipment, AC failures
                </p>
              </div>

              <div className="space-y-1.5 p-3.5 rounded-xl border border-blue-500/20 bg-blue-500/5">
                <label className="text-xs font-bold text-blue-600 dark:text-blue-400 block">
                  Medium Severity
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="1"
                    max="336"
                    value={localSLA.Medium}
                    onChange={(e) =>
                      setLocalSLA({ ...localSLA, Medium: parseInt(e.target.value) || 72 })
                    }
                    className="h-9 font-mono font-bold text-sm bg-background border-border"
                  />
                  <span className="text-xs font-mono text-muted-foreground">hours</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Dorm furniture, lighting, hygiene facilities
                </p>
              </div>

              <div className="space-y-1.5 p-3.5 rounded-xl border border-muted bg-muted/20">
                <label className="text-xs font-bold text-muted-foreground block">
                  Low Severity
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="1"
                    max="720"
                    value={localSLA.Low}
                    onChange={(e) =>
                      setLocalSLA({ ...localSLA, Low: parseInt(e.target.value) || 168 })
                    }
                    className="h-9 font-mono font-bold text-sm bg-background border-border"
                  />
                  <span className="text-xs font-mono text-muted-foreground">hours</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Cosmetic paint, broken benches, signage
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={handleSaveSLA}
                className="rounded-xl font-semibold shadow-xs"
              >
                Apply & Save SLA Targets
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Community Voting & Escalation Rules */}
        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="pb-4 border-b border-border/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-foreground">
                    Community Voting & Escalation Thresholds
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Dynamic vote triggers that automate priority escalation and moderation
                  </p>
                </div>
              </div>
              {voteRulesSaved && (
                <span className="text-xs font-bold text-green-600 dark:text-green-400 flex items-center gap-1 animate-pulse">
                  <Check className="w-3.5 h-3.5" /> Saved
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 p-3.5 rounded-xl border border-purple-500/20 bg-purple-500/5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-purple-700 dark:text-purple-300 block">
                    Escalate to Medium
                  </label>
                  <ThumbsUp className="w-3.5 h-3.5 text-purple-500" />
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={localVoteRules.upvotesToMedium}
                    onChange={(e) =>
                      setLocalVoteRules({
                        ...localVoteRules,
                        upvotesToMedium: parseInt(e.target.value) || 10,
                      })
                    }
                    className="h-9 font-mono font-bold text-sm bg-background border-border"
                  />
                  <span className="text-xs font-mono text-muted-foreground">upvotes</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Upvotes required to lift Low tickets to Medium priority
                </p>
              </div>

              <div className="space-y-1.5 p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-rose-700 dark:text-rose-300 block">
                    Escalate to Critical
                  </label>
                  <Flame className="w-3.5 h-3.5 text-rose-500" />
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="5"
                    max="500"
                    value={localVoteRules.upvotesToCritical}
                    onChange={(e) =>
                      setLocalVoteRules({
                        ...localVoteRules,
                        upvotesToCritical: parseInt(e.target.value) || 50,
                      })
                    }
                    className="h-9 font-mono font-bold text-sm bg-background border-border"
                  />
                  <span className="text-xs font-mono text-muted-foreground">upvotes</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Mass student consensus forcing immediate Critical escalation
                </p>
              </div>

              <div className="space-y-1.5 p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-600 dark:text-amber-400 block">
                    Flag for Review
                  </label>
                  <ThumbsDown className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="1"
                    max="50"
                    value={localVoteRules.downvotesToFlag}
                    onChange={(e) =>
                      setLocalVoteRules({
                        ...localVoteRules,
                        downvotesToFlag: parseInt(e.target.value) || 5,
                      })
                    }
                    className="h-9 font-mono font-bold text-sm bg-background border-border"
                  />
                  <span className="text-xs font-mono text-muted-foreground">downvotes</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Downvote threshold to place ticket into Flagged moderation
                </p>
              </div>

              <div className="space-y-1.5 p-3.5 rounded-xl border border-destructive/20 bg-destructive/5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-destructive block">
                    Auto-Quarantine
                  </label>
                  <AlertOctagon className="w-3.5 h-3.5 text-destructive" />
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="5"
                    max="100"
                    value={localVoteRules.downvotesToRemove}
                    onChange={(e) =>
                      setLocalVoteRules({
                        ...localVoteRules,
                        downvotesToRemove: parseInt(e.target.value) || 15,
                      })
                    }
                    className="h-9 font-mono font-bold text-sm bg-background border-border"
                  />
                  <span className="text-xs font-mono text-muted-foreground">downvotes</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Overwhelming negative feedback automatically unpublishes ticket
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={handleSaveVoteRules}
                className="rounded-xl font-semibold shadow-xs"
              >
                Apply & Save Voting Rules
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid Row 2: Operating Departments & Field Staff Roster */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Operating Departments Directory */}
        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="pb-4 border-b border-border/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-foreground">
                    Operating Departments
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Active university operational divisions and dispatch units
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowAddDept(true)}
                className="h-8 text-xs rounded-xl"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Division
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-3">
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {departments.map((dept) => {
                const deptTickets = complaints.filter(
                  (c) => c.departmentId === dept.id && c.status !== "Removed"
                );
                const active = deptTickets.filter(
                  (c) => c.status !== "Resolved" && c.status !== "Closed"
                ).length;
                const assignedAssistants = assistants.filter(
                  (a) => a.departmentId === dept.id
                );

                return (
                  <div
                    key={dept.id}
                    className="p-3.5 rounded-xl border border-border bg-background flex items-center justify-between gap-3 shadow-xs"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-foreground">
                        {dept.name}
                      </h4>
                      <p className="text-[11px] text-muted-foreground">
                        {assignedAssistants.length} field technician(s) assigned
                      </p>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-primary px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                        {active} active
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Field Staff Roster & Allocation */}
        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="pb-4 border-b border-border/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-foreground">
                    Field Technician Roster
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Staff technicians authorized for ticket claim and resolution
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowAddAssistant(true)}
                className="h-8 text-xs rounded-xl"
              >
                <UserPlus className="w-3.5 h-3.5 mr-1" />
                Deploy Staff
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-3">
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {assistants.map((ast) => {
                const dept = departments.find((d) => d.id === ast.departmentId);
                const assignedTickets = complaints.filter(
                  (c) => c.assignedAssistantId === ast.id && c.status !== "Closed"
                ).length;

                return (
                  <div
                    key={ast.id}
                    className="p-3.5 rounded-xl border border-border bg-background flex items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center border border-primary/20 shrink-0">
                        {ast.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-foreground">
                          {ast.name}
                        </h4>
                        <p className="text-[11px] text-muted-foreground">
                          {dept?.name || "General Facility Support"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-xs font-semibold text-muted-foreground px-2 py-0.5 rounded-full bg-muted border border-border">
                        {assignedTickets} workload
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live System Audit Log Stream */}
      <Card className="border-border bg-card shadow-xs">
        <CardHeader className="pb-4 border-b border-border/60">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-foreground">
                  Institutional Audit Trail & Governance Ledger
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Tamper-evident real-time record of all status escalations, policy overrides, and withdrawals
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Filter audit actions..."
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  className="h-8 pl-8 text-xs w-44 sm:w-56 bg-background"
                />
              </div>

              <select
                value={auditFilterType}
                onChange={(e) => setAuditFilterType(e.target.value)}
                className="h-8 px-2.5 text-xs rounded-xl border border-border bg-background text-foreground font-medium focus:outline-none"
              >
                <option value="all">All Severities</option>
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {filteredAuditLog.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-xs">
                No audit entries match the current filter criteria.
              </div>
            ) : (
              filteredAuditLog.map((entry) => {
                const badgeColor =
                  entry.type === "critical"
                    ? "bg-destructive/10 text-destructive border-destructive/20"
                    : entry.type === "warning"
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                    : entry.type === "success"
                    ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
                    : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";

                return (
                  <div
                    key={entry.id}
                    className="p-3.5 rounded-xl border border-border bg-background flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs hover:border-border/80 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0 mt-0.5 ${badgeColor}`}
                      >
                        {entry.type}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="text-xs font-bold text-foreground">
                            {entry.action}
                          </h5>
                          <span className="text-[11px] text-muted-foreground font-medium">
                            by {entry.actor}
                          </span>
                        </div>
                        <p className="text-xs text-foreground/80 mt-0.5">
                          {entry.details}
                        </p>
                      </div>
                    </div>
                    <div className="sm:text-right shrink-0">
                      <span className="text-[11px] font-mono text-muted-foreground">
                        {isMounted ? entry.timestamp.split("T")[0] + " " + entry.timestamp.split("T")[1]?.slice(0, 5) : entry.timestamp}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Institutional Compliance Highlights */}
      <Card className="border-border bg-card shadow-xs">
        <CardHeader>
          <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-green-500" />
            University Anonymity & Data Protection Standards
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3 text-xs leading-relaxed text-muted-foreground">
          <div className="p-4 rounded-xl border border-border bg-background">
            <strong className="text-foreground block mb-1">
              Zero Identification Stored
            </strong>
            Student identity numbers, institutional email accounts, and device fingerprints are completely decoupled at grievance creation time.
          </div>
          <div className="p-4 rounded-xl border border-border bg-background">
            <strong className="text-foreground block mb-1">
              Student Withdrawal Sovereignty
            </strong>
            Students retain full sovereign control to withdraw or permanently delete their submitted grievances if issues resolve independently.
          </div>
          <div className="p-4 rounded-xl border border-border bg-background">
            <strong className="text-foreground block mb-1">
              Democratic Escalation Engine
            </strong>
            Grievances with sustained student consensus dynamically escalate in severity according to the institutional thresholds defined above.
          </div>
        </CardContent>
      </Card>

      {/* Add Department Modal */}
      <AnimatePresence>
        {showAddDept && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border rounded-2xl max-w-sm w-full p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setShowAddDept(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-bold text-foreground mb-1">
                Add Operating Department
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                Creates a new routing division for campus grievances
              </p>

              <form onSubmit={handleAddDept} className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                    Division Name
                  </label>
                  <Input
                    required
                    placeholder="e.g. Sports Facilities & Athletics"
                    value={newDeptName}
                    onChange={(e) => setNewDeptName(e.target.value)}
                    className="h-10 text-sm bg-background border-border"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddDept(false)}
                    className="rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="rounded-xl font-semibold shadow-xs"
                  >
                    Create Division
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Assistant / Technician Modal */}
      <AnimatePresence>
        {showAddAssistant && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border rounded-2xl max-w-sm w-full p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setShowAddAssistant(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-bold text-foreground mb-1">
                Deploy Field Technician
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                Authorize a staff member to handle and resolve tickets
              </p>

              <form onSubmit={handleAddAssistant} className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                    Staff Full Name
                  </label>
                  <Input
                    required
                    placeholder="e.g. Marcus Vance"
                    value={newAssistantName}
                    onChange={(e) => setNewAssistantName(e.target.value)}
                    className="h-10 text-sm bg-background border-border"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                    Assigned Division
                  </label>
                  <select
                    value={newAssistantDept}
                    onChange={(e) => setNewAssistantDept(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm font-medium text-foreground focus:outline-none"
                  >
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddAssistant(false)}
                    className="rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="rounded-xl font-semibold shadow-xs"
                  >
                    Deploy Staff
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Factory Reset Modal */}
      <AnimatePresence>
        {showResetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setShowResetModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    Reset to Factory Baseline?
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Irreversible Institutional Action
                  </p>
                </div>
              </div>

              <p className="text-sm text-foreground/80 leading-relaxed mb-6">
                This operation will purge all modified tickets, reset SLA thresholds and community voting rules to university factory defaults, and restore verified demonstration data.
              </p>

              <div className="flex justify-end gap-2.5">
                <Button
                  variant="outline"
                  onClick={() => setShowResetModal(false)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleConfirmReset}
                  className="rounded-xl font-semibold shadow-xs"
                >
                  <RotateCcw className="w-4 h-4 mr-1.5" />
                  Confirm Factory Reset
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
