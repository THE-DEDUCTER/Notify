"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useComplaints } from "@/lib/context/ComplaintsContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SLACountdown } from "@/components/domain/SLACountdown";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Building2,
  TrendingUp,
  ExternalLink,
  ChevronRight,
  Flame,
  ArrowUpRight,
  Trash2,
  Check,
} from "lucide-react";
import { useCurrentTime, isBreachedSafe } from "@/lib/hooks/useCurrentTime";

export default function AdminDashboard() {
  const { complaints, departments, removeComplaint, updateComplaintStatus } = useComplaints();
  const now = useCurrentTime();

  // Metrics
  const activeComplaints = complaints.filter(
    (c) => c.status !== "Resolved" && c.status !== "Closed" && c.status !== "Removed"
  );
  
  const totalActive = activeComplaints.length;

  const breachedComplaints = activeComplaints.filter((c) =>
    isBreachedSafe(c.slaDeadline, now)
  );
  const totalBreached = breachedComplaints.length;

  const flaggedComplaints = complaints.filter(
    (c) =>
      c.status === "Under Review" ||
      (c.downvotes >= 5 && c.downvotes > c.upvotes && c.status !== "Removed")
  );

  const resolvedComplaints = complaints.filter(
    (c) => c.status === "Resolved" || c.status === "Closed"
  );
  const totalResolved = resolvedComplaints.length;

  const resolutionRate =
    complaints.length > 0
      ? Math.round((totalResolved / (totalActive + totalResolved)) * 100)
      : 100;

  // Department matrix calculation
  const deptMatrix = departments.map((dept) => {
    const deptTickets = complaints.filter((c) => c.departmentId === dept.id && c.status !== "Removed");
    const active = deptTickets.filter((c) => c.status !== "Resolved" && c.status !== "Closed");
    const breached = active.filter((c) => isBreachedSafe(c.slaDeadline, now));
    const resolved = deptTickets.filter((c) => c.status === "Resolved" || c.status === "Closed");
    const complianceRate =
      deptTickets.length > 0
        ? Math.round(((deptTickets.length - breached.length) / deptTickets.length) * 100)
        : 100;

    return {
      id: dept.id,
      name: dept.name,
      total: deptTickets.length,
      active: active.length,
      breached: breached.length,
      resolved: resolved.length,
      complianceRate,
    };
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 py-4 sm:py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              Administrative Console
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              University Operations Center
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Campus SLA & Incident Overview
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Monitor real-time resolution speed, SLA compliance across departments, and auto-flagged submissions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/complaints">
            <Button className="rounded-xl font-semibold shadow-xs">
              Moderation Console
              <ArrowUpRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Total Active Incidents
            </CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-foreground">{totalActive}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {departments.length} university service divisions
            </p>
          </CardContent>
        </Card>

        <Card className={totalBreached > 0 ? "border-destructive/40 bg-destructive/5" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-destructive">
              SLA Breaches
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-destructive">{totalBreached}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalActive > 0 ? Math.round((totalBreached / totalActive) * 100) : 0}% of active workload past deadline
            </p>
          </CardContent>
        </Card>

        <Card className={flaggedComplaints.length > 0 ? "border-amber-500/40 bg-amber-500/5" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Auto-Flagged For Review
            </CardTitle>
            <Flame className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
              {flaggedComplaints.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Downvoted or spam signals needing decision
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Resolution Efficiency
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-green-600 dark:text-green-400">
              {resolutionRate}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalResolved} grievances successfully resolved
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Department Performance Matrix & Urgent Attention */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Department Performance Matrix (2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Department Performance Matrix
              </h2>
              <p className="text-xs text-muted-foreground">
                Workload distribution and SLA compliance benchmarks
              </p>
            </div>
            <span className="text-xs font-mono text-muted-foreground">
              Updated Live
            </span>
          </div>

          <div className="border border-border rounded-2xl bg-card overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/40 border-b border-border text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-3 text-center">Active</th>
                    <th className="py-3 px-3 text-center">Breached</th>
                    <th className="py-3 px-3 text-center">Resolved</th>
                    <th className="py-3 px-4 text-right">Compliance Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {deptMatrix.map((dept) => (
                    <tr
                      key={dept.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-semibold text-foreground flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span>{dept.name}</span>
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono font-medium">
                        {dept.active}
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono">
                        {dept.breached > 0 ? (
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-destructive/10 text-destructive border border-destructive/20">
                            {dept.breached}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono text-muted-foreground">
                        {dept.resolved}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-20 bg-muted rounded-full h-2 overflow-hidden hidden sm:block">
                            <div
                              className={`h-full rounded-full ${
                                dept.complianceRate >= 80
                                  ? "bg-green-500"
                                  : dept.complianceRate >= 50
                                  ? "bg-amber-500"
                                  : "bg-destructive"
                              }`}
                              style={{ width: `${dept.complianceRate}%` }}
                            />
                          </div>
                          <span
                            className={`font-mono text-xs font-bold ${
                              dept.complianceRate >= 80
                                ? "text-green-600 dark:text-green-400"
                                : dept.complianceRate >= 50
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-destructive"
                            }`}
                          >
                            {dept.complianceRate}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Urgent Action / Flagged Sidebar (1 Column) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">
              Needs Moderation
            </h2>
            <Link
              href="/admin/complaints"
              className="text-xs font-semibold text-primary hover:underline"
            >
              View All ({flaggedComplaints.length})
            </Link>
          </div>

          <div className="space-y-3">
            {flaggedComplaints.slice(0, 3).map((complaint) => (
              <div
                key={complaint.id}
                className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 shadow-xs space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-bold text-foreground line-clamp-1">
                    {complaint.title}
                  </h4>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-destructive/10 text-destructive border border-destructive/20 shrink-0">
                    -{complaint.downvotes - complaint.upvotes} Votes
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {complaint.description}
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => removeComplaint(complaint.id, "Removed by Administrator from Overview")}
                    className="h-8 text-xs rounded-lg flex-1"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    Remove
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      updateComplaintStatus(
                        complaint.id,
                        "Submitted",
                        "Flag dismissed by Administrator"
                      )
                    }
                    className="h-8 text-xs rounded-lg flex-1"
                  >
                    <Check className="w-3.5 h-3.5 mr-1" />
                    Dismiss Flag
                  </Button>
                </div>
              </div>
            ))}

            {flaggedComplaints.length === 0 && (
              <div className="p-8 border border-dashed border-border rounded-xl text-center bg-card">
                <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-xs font-bold text-foreground">Clean Moderation Queue</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  No grievances currently flagged for spam or community disapproval.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Critical SLA Breaches Feed */}
      <div className="space-y-4 pt-4 border-t border-border/60">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              SLA Breach Watchlist
            </h2>
            <p className="text-xs text-muted-foreground">
              Tickets that have exceeded target turnaround window or are within 4 hours of expiry
            </p>
          </div>
          <span className="text-xs font-mono text-destructive font-bold">
            {breachedComplaints.length} overdue
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {breachedComplaints.map((c) => (
            <Link
              key={c.id}
              href={`/complaint/${c.id}`}
              className="p-4 rounded-xl border border-destructive/30 bg-destructive/5 hover:border-destructive transition-all shadow-xs group block"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-muted text-foreground">
                  {c.id.toUpperCase()}
                </span>
                {c.slaDeadline && <SLACountdown deadline={c.slaDeadline} />}
              </div>
              <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-1">
                {c.title}
              </h4>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                {c.description}
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-destructive/10 pt-2">
                <span>{departments.find((d) => d.id === c.departmentId)?.name}</span>
                <span className="font-semibold text-destructive">Take Action →</span>
              </div>
            </Link>
          ))}

          {breachedComplaints.length === 0 && (
            <div className="col-span-full py-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
              All active tickets are currently within acceptable SLA windows.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
