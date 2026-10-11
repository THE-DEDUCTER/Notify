"use client";
import React, { useState } from "react";
import { useComplaints, SLAConfig } from "@/lib/context/ComplaintsContext";
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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SuperAdminAnalyticsPage() {
  const {
    complaints,
    departments,
    assistants,
    slaThresholds,
    updateSlaThresholds,
    addDepartment,
  } = useComplaints();

  // Local SLA inputs
  const [localSLA, setLocalSLA] = useState<SLAConfig>({ ...slaThresholds });
  const [slaSaved, setSlaSaved] = useState(false);

  // New Department Modal
  const [showAddDept, setShowAddDept] = useState(false);
  const [newDeptName, setNewDeptName] = useState("");

  const handleSaveSLA = () => {
    updateSlaThresholds(localSLA);
    setSlaSaved(true);
    setTimeout(() => setSlaSaved(false), 3000);
  };

  const handleAddDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;
    addDepartment(newDeptName.trim());
    setNewDeptName("");
    setShowAddDept(false);
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
      const deptName = departments.find((d) => d.id === c.departmentId)?.name || c.departmentId;
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
    link.setAttribute("download", `notify_university_grievance_audit_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
              University Policy & Rule Engine
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Governance, SLA Rules & Institutional Audit
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Configure institutional turnaround thresholds, manage operating departments, and export certified compliance data.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleExportCSV}
            className="rounded-xl font-semibold shadow-xs"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Audit Report (CSV)
          </Button>
        </div>
      </div>

      {/* Main Grid: SLA Configuration & Department Management */}
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
                    Resolution SLA Targets
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Configure turnaround deadlines (in hours) enforced per severity
                  </p>
                </div>
              </div>
              {slaSaved && (
                <span className="text-xs font-bold text-green-600 dark:text-green-400 flex items-center gap-1 animate-pulse">
                  <Check className="w-3.5 h-3.5" /> Saved & Active
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
                  Life safety, electrical hazards, server outages
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
                  Disrupted water supply, library Wi-Fi, classroom equipment
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
                  Sanitation bins, non-critical lighting, dorm repairs
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
                  Broken park benches, cosmetic paint, signage requests
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={handleSaveSLA}
                className="rounded-xl font-semibold shadow-xs"
              >
                Apply & Save SLA Policy
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Operating Departments Directory */}
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
                    <div className="text-right">
                      <span className="font-mono text-xs font-bold text-primary px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                        {active} active
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Institutional Compliance Highlights */}
      <Card className="border-border bg-card shadow-xs">
        <CardHeader>
          <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-green-500" />
            University Anonymity & Data Protection Standard
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
              Tamper-Evident Status Auditing
            </strong>
            Every status transition, technician dispatch, and resolution proof submission is timestamped in an append-only ledger for complete institutional accountability.
          </div>
          <div className="p-4 rounded-xl border border-border bg-background">
            <strong className="text-foreground block mb-1">
              Democratic Prioritization
            </strong>
            Grievances with sustained community upvotes dynamically escalate in severity to ensure urgent institutional response.
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
              <h3 className="text-lg font-bold text-foreground mb-1">
                Add Operating Department
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                Creates a new routing destination for university grievances
              </p>

              <form onSubmit={handleAddDept} className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                    Department Name
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
    </div>
  );
}
