"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { Complaint, Department, User, Status, Severity } from "@/types";
import { MOCK_COMPLAINTS, MOCK_DEPARTMENTS, MOCK_ASSISTANTS } from "@/lib/mock/seed";
import { calculateSeverity, calculateSLAHours, determineStatusFromVotes } from "@/lib/rules";
import { CATEGORY_DEFAULT_IMAGES } from "@/components/domain/ComplaintThumbnail";

export interface SLAConfig {
  Critical: number;
  High: number;
  Medium: number;
  Low: number;
}

export interface VoteRulesConfig {
  upvotesToMedium: number;
  upvotesToCritical: number;
  downvotesToFlag: number;
  downvotesToRemove: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  details: string;
  type: "info" | "warning" | "critical" | "success";
}

export interface ResolutionData {
  note: string;
  proofImageUrl?: string;
}

interface ComplaintsContextType {
  complaints: Complaint[];
  departments: Department[];
  assistants: User[];
  slaThresholds: SLAConfig;
  voteRules: VoteRulesConfig;
  systemAuditLog: AuditLogEntry[];
  updateSlaThresholds: (thresholds: SLAConfig) => void;
  updateVoteRules: (rules: VoteRulesConfig) => void;
  addComplaint: (data: {
    title: string;
    description: string;
    category: string;
    images?: string[];
    departmentId?: string;
  }) => Complaint;
  deleteComplaint: (id: string, reason?: string) => void;
  updateComplaintStatus: (id: string, newStatus: Status, note?: string) => void;
  resolveWithProof: (id: string, resolution: ResolutionData) => void;
  claimComplaint: (id: string, assistantId: string) => void;
  assignComplaint: (id: string, assistantId: string) => void;
  reassignDepartment: (id: string, departmentId: string, note?: string) => void;
  updateComplaintSeverity: (id: string, severity: Severity) => void;
  removeComplaint: (id: string, reason?: string) => void;
  voteComplaint: (id: string, type: "up" | "down") => void;
  addDepartment: (name: string) => Department;
  addAssistant: (data: { name: string; departmentId: string }) => User;
  resetToFactoryDefaults: () => void;
}

const ComplaintsContext = createContext<ComplaintsContextType | undefined>(undefined);

const STORAGE_KEY = "notify_complaints_data_v4";
const SLA_STORAGE_KEY = "notify_sla_thresholds_v4";
const VOTE_RULES_KEY = "notify_vote_rules_v4";
const AUDIT_LOG_KEY = "notify_audit_log_v4";

const DEFAULT_SLA: SLAConfig = {
  Critical: 12,
  High: 24,
  Medium: 72,
  Low: 168,
};

const DEFAULT_VOTE_RULES: VoteRulesConfig = {
  upvotesToMedium: 10,
  upvotesToCritical: 25,
  downvotesToFlag: 5,
  downvotesToRemove: 10,
};

const INITIAL_AUDIT_LOG: AuditLogEntry[] = [
  {
    id: "log_1",
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    actor: "Automated SLA Monitor",
    action: "SLA Warning Dispatched",
    details: "Ticket #COMP_4 (Water Cooler Valve) exceeded 24h SLA target. Escalated to Dept Lead.",
    type: "warning",
  },
  {
    id: "log_2",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    actor: "Community Rule Engine",
    action: "Dynamic Escalation",
    details: "Ticket #COMP_15 (Lift Abrupt Stop) reached 49 community upvotes. Escalated to Critical.",
    type: "critical",
  },
  {
    id: "log_3",
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    actor: "Staff Lead (John Builder)",
    action: "Resolution Proof Submitted",
    details: "Submitted completion proof for #COMP_8 (Restroom Valve). Awaiting student verification.",
    type: "success",
  },
  {
    id: "log_4",
    timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    actor: "Automated Spam Filter",
    action: "Content Flagged",
    details: "Grievance #COMP_10 auto-flagged into 'Under Review' due to -13 net community downvotes.",
    type: "info",
  },
];

export function ComplaintsProvider({ children }: { children: React.ReactNode }) {
  const [complaints, setComplaints] = useState<Complaint[]>(MOCK_COMPLAINTS);
  const [departments, setDepartments] = useState<Department[]>(MOCK_DEPARTMENTS);
  const [assistants, setAssistants] = useState<User[]>(MOCK_ASSISTANTS);
  const [slaThresholds, setSlaThresholds] = useState<SLAConfig>(DEFAULT_SLA);
  const [voteRules, setVoteRules] = useState<VoteRulesConfig>(DEFAULT_VOTE_RULES);
  const [systemAuditLog, setSystemAuditLog] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOG);
  const [isLoaded, setIsLoaded] = useState(false);

  const addAuditEntry = (
    actor: string,
    action: string,
    details: string,
    type: "info" | "warning" | "critical" | "success" = "info"
  ) => {
    const entry: AuditLogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      actor,
      action,
      details,
      type,
    };
    setSystemAuditLog((prev) => [entry, ...prev.slice(0, 49)]); // keep recent 50
  };

  // Sync with localStorage on client mount without breaking hydration
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const sanitized = parsed.map((c: Complaint) => {
            if (
              !c.images ||
              c.images.length === 0 ||
              c.images.some(
                (img) =>
                  img.includes("photo-1584282862025") ||
                  img.includes("photo-1555627685") ||
                  img.includes("photo-1551717752")
              )
            ) {
              const defaultImg =
                CATEGORY_DEFAULT_IMAGES[c.category] || CATEGORY_DEFAULT_IMAGES["Other"];
              return { ...c, images: [defaultImg] };
            }
            return c;
          });
          setComplaints(sanitized);
        }
      }

      const storedSLA = localStorage.getItem(SLA_STORAGE_KEY);
      if (storedSLA) setSlaThresholds(JSON.parse(storedSLA));

      const storedVotes = localStorage.getItem(VOTE_RULES_KEY);
      if (storedVotes) setVoteRules(JSON.parse(storedVotes));

      const storedLogs = localStorage.getItem(AUDIT_LOG_KEY);
      if (storedLogs) setSystemAuditLog(JSON.parse(storedLogs));
    } catch (e) {
      console.warn("Failed to read from localStorage", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
        localStorage.setItem(SLA_STORAGE_KEY, JSON.stringify(slaThresholds));
        localStorage.setItem(VOTE_RULES_KEY, JSON.stringify(voteRules));
        localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(systemAuditLog));
      } catch (e) {
        console.warn("Failed to save complaints to localStorage", e);
      }
    }
  }, [complaints, slaThresholds, voteRules, systemAuditLog, isLoaded]);

  const updateSlaThresholds = (newThresholds: SLAConfig) => {
    setSlaThresholds(newThresholds);
    addAuditEntry(
      "SuperAdmin Policy Desk",
      "Institutional SLA Updated",
      `Adjusted turnaround windows: Critical=${newThresholds.Critical}h, High=${newThresholds.High}h, Medium=${newThresholds.Medium}h, Low=${newThresholds.Low}h.`,
      "info"
    );
  };

  const updateVoteRules = (newRules: VoteRulesConfig) => {
    setVoteRules(newRules);
    addAuditEntry(
      "SuperAdmin Policy Desk",
      "Community Voting Rules Updated",
      `Dynamic escalation thresholds modified: Escalation threshold to Medium=${newRules.upvotesToMedium}, Critical=${newRules.upvotesToCritical}.`,
      "info"
    );
  };

  const addComplaint = (data: {
    title: string;
    description: string;
    category: string;
    images?: string[];
    departmentId?: string;
  }): Complaint => {
    const initialSeverity = calculateSeverity(data.category, 0, voteRules);
    const hours = slaThresholds[initialSeverity] || calculateSLAHours(initialSeverity);
    const now = new Date();
    const deadline = new Date(now.getTime() + hours * 3600 * 1000).toISOString();

    let targetDept = data.departmentId;
    if (!targetDept) {
      if (data.category === "Wi-Fi/IT") targetDept = "dept_2";
      else if (data.category === "Safety") targetDept = "dept_3";
      else if (data.category === "Hostel") targetDept = "dept_4";
      else if (data.category === "Electrical") targetDept = "dept_5";
      else if (data.category === "Sanitation") targetDept = "dept_6";
      else targetDept = "dept_1"; // Maintenance
    }

    const defaultImg =
      CATEGORY_DEFAULT_IMAGES[data.category] || CATEGORY_DEFAULT_IMAGES["Other"];
    const resolvedImages =
      data.images && data.images.length > 0 ? data.images : [defaultImg];

    const newId = `comp_${Date.now()}`;
    const newComplaint: Complaint = {
      id: newId,
      title: data.title,
      description: data.description,
      category: data.category,
      severity: initialSeverity,
      status: "Submitted",
      isAnonymous: true,
      raiserId: "current_user",
      departmentId: targetDept,
      upvotes: 1,
      downvotes: 0,
      createdAt: now.toISOString(),
      slaDeadline: deadline,
      images: resolvedImages,
      history: [
        {
          status: "Submitted",
          timestamp: now.toISOString(),
          note: "Grievance submitted anonymously by campus community member",
        },
      ],
    };

    setComplaints((prev) => [newComplaint, ...prev]);
    addAuditEntry(
      "Anonymous Raiser",
      "New Grievance Submitted",
      `Ticket #${newId.toUpperCase()} created in category "${data.category}". SLA set to ${hours}h.`,
      "info"
    );

    return newComplaint;
  };

  const deleteComplaint = (id: string, reason?: string) => {
    const target = complaints.find((c) => c.id === id);
    setComplaints((prev) => prev.filter((c) => c.id !== id));
    addAuditEntry(
      "Student / Raiser",
      "Grievance Withdrawn & Deleted",
      `Ticket #${id.toUpperCase()} ("${target?.title || "Grievance"}") was permanently withdrawn. ${reason ? `Reason: ${reason}` : ""}`,
      "warning"
    );
  };

  const updateComplaintStatus = (id: string, newStatus: Status, note?: string) => {
    const timestamp = new Date().toISOString();
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const updatedHistory = [
          ...c.history,
          {
            status: newStatus,
            timestamp,
            note: note || `Status updated to ${newStatus}`,
          },
        ];
        return {
          ...c,
          status: newStatus,
          resolvedAt: newStatus === "Resolved" || newStatus === "Closed" ? timestamp : c.resolvedAt,
          history: updatedHistory,
        };
      })
    );
    addAuditEntry(
      "Lifecycle Event",
      `Status Transition: ${newStatus}`,
      `Ticket #${id.toUpperCase()} transitioned to ${newStatus}. Note: ${note || "None"}`,
      newStatus === "Resolved" || newStatus === "Closed" ? "success" : "info"
    );
  };

  const resolveWithProof = (id: string, resolution: ResolutionData) => {
    const timestamp = new Date().toISOString();
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const images = resolution.proofImageUrl ? [...c.images, resolution.proofImageUrl] : c.images;
        return {
          ...c,
          status: "Pending Confirmation" as Status,
          images,
          history: [
            ...c.history,
            {
              status: "Pending Confirmation" as Status,
              timestamp,
              note: resolution.note || "Assistant marked work completed with proof evidence. Awaiting student verification.",
            },
          ],
        };
      })
    );
    addAuditEntry(
      "Field Technician",
      "Proof Uploaded & Awaiting Sign-Off",
      `Ticket #${id.toUpperCase()} completed on-site with attached photo evidence. Sent to student for verification.`,
      "success"
    );
  };

  const claimComplaint = (id: string, assistantId: string) => {
    const timestamp = new Date().toISOString();
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        return {
          ...c,
          assignedAssistantId: assistantId,
          status: c.status === "Submitted" ? "In Progress" : c.status,
          history: [
            ...c.history,
            {
              status: "In Progress" as Status,
              timestamp,
              note: "Assigned assistant accepted the ticket and initiated investigation",
            },
          ],
        };
      })
    );
    addAuditEntry(
      "Field Staff",
      "Ticket Claimed",
      `Ticket #${id.toUpperCase()} claimed by Staff ID ${assistantId}. Status moved to In Progress.`,
      "info"
    );
  };

  const assignComplaint = (id: string, assistantId: string) => {
    const timestamp = new Date().toISOString();
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        return {
          ...c,
          assignedAssistantId: assistantId,
          status: c.status === "Submitted" ? "Assigned" : c.status,
          history: [
            ...c.history,
            {
              status: "Assigned" as Status,
              timestamp,
              note: `Ticket officially assigned to Assistant ID ${assistantId}`,
            },
          ],
        };
      })
    );
  };

  const reassignDepartment = (id: string, departmentId: string, note?: string) => {
    const timestamp = new Date().toISOString();
    const targetDept = departments.find((d) => d.id === departmentId)?.name || departmentId;
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        return {
          ...c,
          departmentId,
          assignedAssistantId: undefined,
          history: [
            ...c.history,
            {
              status: c.status,
              timestamp,
              note: note || `Department reassigned to ${targetDept} by administrator`,
            },
          ],
        };
      })
    );
    addAuditEntry(
      "Administrator",
      "Department Reassigned",
      `Ticket #${id.toUpperCase()} routed to ${targetDept}. Note: ${note || "None"}`,
      "info"
    );
  };

  const updateComplaintSeverity = (id: string, severity: Severity) => {
    const timestamp = new Date().toISOString();
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const hours = slaThresholds[severity] || calculateSLAHours(severity);
        const deadline = new Date(new Date(c.createdAt).getTime() + hours * 3600 * 1000).toISOString();
        return {
          ...c,
          severity,
          slaDeadline: deadline,
          history: [
            ...c.history,
            {
              status: c.status,
              timestamp,
              note: `Severity adjusted to ${severity}. SLA adjusted to ${hours}h.`,
            },
          ],
        };
      })
    );
    addAuditEntry(
      "Administrator",
      "Severity Adjusted",
      `Ticket #${id.toUpperCase()} severity changed to ${severity}. SLA recomputed.`,
      severity === "Critical" ? "critical" : "info"
    );
  };

  const removeComplaint = (id: string, reason?: string) => {
    const timestamp = new Date().toISOString();
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        return {
          ...c,
          status: "Removed" as Status,
          history: [
            ...c.history,
            {
              status: "Removed" as Status,
              timestamp,
              note: reason || "Complaint removed by administration due to policy violation or duplicate report",
            },
          ],
        };
      })
    );
    addAuditEntry(
      "Moderator",
      "Grievance Marked Removed",
      `Ticket #${id.toUpperCase()} removed from campus feeds. Reason: ${reason || "Policy violation"}`,
      "warning"
    );
  };

  const voteComplaint = (id: string, type: "up" | "down") => {
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const newUp = type === "up" ? c.upvotes + 1 : c.upvotes;
        const newDown = type === "down" ? c.downvotes + 1 : c.downvotes;
        const netVotes = newUp - newDown;
        const updatedSeverity = calculateSeverity(c.category, netVotes, voteRules);
        const updatedStatus = determineStatusFromVotes(c.status, newUp, newDown, voteRules);

        return {
          ...c,
          upvotes: newUp,
          downvotes: newDown,
          severity: updatedSeverity,
          status: updatedStatus,
        };
      })
    );
  };

  const addDepartment = (name: string): Department => {
    const newDept: Department = {
      id: `dept_${Date.now()}`,
      name,
    };
    setDepartments((prev) => [...prev, newDept]);
    addAuditEntry("SuperAdmin", "New Operating Division Created", `Added "${name}" to campus routing table.`, "success");
    return newDept;
  };

  const addAssistant = (data: { name: string; departmentId: string }): User => {
    const newAssistant: User = {
      id: `ast_${Date.now()}`,
      name: data.name,
      role: "Assistant",
      departmentId: data.departmentId,
    };
    setAssistants((prev) => [...prev, newAssistant]);
    const deptName = departments.find((d) => d.id === data.departmentId)?.name || data.departmentId;
    addAuditEntry("SuperAdmin Staffing", "Technician Staff Added", `Appointed ${data.name} to ${deptName}.`, "info");
    return newAssistant;
  };

  const resetToFactoryDefaults = () => {
    setComplaints(MOCK_COMPLAINTS);
    setDepartments(MOCK_DEPARTMENTS);
    setAssistants(MOCK_ASSISTANTS);
    setSlaThresholds(DEFAULT_SLA);
    setVoteRules(DEFAULT_VOTE_RULES);
    setSystemAuditLog(INITIAL_AUDIT_LOG);

    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(SLA_STORAGE_KEY);
      localStorage.removeItem(VOTE_RULES_KEY);
      localStorage.removeItem(AUDIT_LOG_KEY);
    } catch (e) {
      console.warn("Failed to clear localStorage", e);
    }
    addAuditEntry("SuperAdmin", "System State Restored", "All complaints, SLA policies, and staff tables reset to initial factory benchmarks.", "warning");
  };

  return (
    <ComplaintsContext.Provider
      value={{
        complaints,
        departments,
        assistants,
        slaThresholds,
        voteRules,
        systemAuditLog,
        updateSlaThresholds,
        updateVoteRules,
        addComplaint,
        deleteComplaint,
        updateComplaintStatus,
        resolveWithProof,
        claimComplaint,
        assignComplaint,
        reassignDepartment,
        updateComplaintSeverity,
        removeComplaint,
        voteComplaint,
        addDepartment,
        addAssistant,
        resetToFactoryDefaults,
      }}
    >
      {children}
    </ComplaintsContext.Provider>
  );
}

export function useComplaints() {
  const context = useContext(ComplaintsContext);
  if (!context) throw new Error("useComplaints must be used within a ComplaintsProvider");
  return context;
}
