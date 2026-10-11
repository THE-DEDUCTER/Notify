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

export interface ResolutionData {
  note: string;
  proofImageUrl?: string;
}

interface ComplaintsContextType {
  complaints: Complaint[];
  departments: Department[];
  assistants: User[];
  slaThresholds: SLAConfig;
  updateSlaThresholds: (thresholds: SLAConfig) => void;
  addComplaint: (data: {
    title: string;
    description: string;
    category: string;
    images?: string[];
    departmentId?: string;
  }) => Complaint;
  updateComplaintStatus: (id: string, newStatus: Status, note?: string) => void;
  resolveWithProof: (id: string, resolution: ResolutionData) => void;
  claimComplaint: (id: string, assistantId: string) => void;
  assignComplaint: (id: string, assistantId: string) => void;
  reassignDepartment: (id: string, departmentId: string, note?: string) => void;
  updateComplaintSeverity: (id: string, severity: Severity) => void;
  removeComplaint: (id: string, reason?: string) => void;
  voteComplaint: (id: string, type: 'up' | 'down') => void;
  addDepartment: (name: string) => Department;
}

const ComplaintsContext = createContext<ComplaintsContextType | undefined>(undefined);

const STORAGE_KEY = "notify_complaints_data_v3";
const SLA_STORAGE_KEY = "notify_sla_thresholds_v3";

const DEFAULT_SLA: SLAConfig = {
  Critical: 12,
  High: 24,
  Medium: 72,
  Low: 168,
};

export function ComplaintsProvider({ children }: { children: React.ReactNode }) {
  const [complaints, setComplaints] = useState<Complaint[]>(MOCK_COMPLAINTS);
  const [departments, setDepartments] = useState<Department[]>(MOCK_DEPARTMENTS);
  const [assistants] = useState<User[]>(MOCK_ASSISTANTS);
  const [slaThresholds, setSlaThresholds] = useState<SLAConfig>(DEFAULT_SLA);
  const [isLoaded, setIsLoaded] = useState(false);

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
              c.images.some((img) =>
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
      if (storedSLA) {
        setSlaThresholds(JSON.parse(storedSLA));
      }
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
      } catch (e) {
        console.warn("Failed to save complaints to localStorage", e);
      }
    }
  }, [complaints, isLoaded]);

  const updateSlaThresholds = (newThresholds: SLAConfig) => {
    setSlaThresholds(newThresholds);
    try {
      localStorage.setItem(SLA_STORAGE_KEY, JSON.stringify(newThresholds));
    } catch (e) {
      console.warn("Failed to persist SLA thresholds", e);
    }
  };

  const addComplaint = (data: {
    title: string;
    description: string;
    category: string;
    images?: string[];
    departmentId?: string;
  }): Complaint => {
    const initialSeverity = calculateSeverity(data.category, 0);
    const hours = slaThresholds[initialSeverity] || calculateSLAHours(initialSeverity);
    const now = new Date();
    const deadline = new Date(now.getTime() + hours * 3600 * 1000).toISOString();

    // Map category to reasonable default department if not specified
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

    const newComplaint: Complaint = {
      id: `comp_${Date.now()}`,
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
    return newComplaint;
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
          assignedAssistantId: undefined, // Reset assigned assistant since department changed
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
  };

  const voteComplaint = (id: string, type: 'up' | 'down') => {
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const newUp = type === 'up' ? c.upvotes + 1 : c.upvotes;
        const newDown = type === 'down' ? c.downvotes + 1 : c.downvotes;
        const netVotes = newUp - newDown;
        const updatedSeverity = calculateSeverity(c.category, netVotes);
        const updatedStatus = determineStatusFromVotes(c.status, newUp, newDown);

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
    return newDept;
  };

  return (
    <ComplaintsContext.Provider
      value={{
        complaints,
        departments,
        assistants,
        slaThresholds,
        updateSlaThresholds,
        addComplaint,
        updateComplaintStatus,
        resolveWithProof,
        claimComplaint,
        assignComplaint,
        reassignDepartment,
        updateComplaintSeverity,
        removeComplaint,
        voteComplaint,
        addDepartment,
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
