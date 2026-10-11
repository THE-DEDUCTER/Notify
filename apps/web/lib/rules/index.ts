import { Severity, Status } from "@/types";

const CATEGORY_BASE_SEVERITY: Record<string, Severity> = {
  "Safety": "High",
  "Electrical": "High",
  "Plumbing/Water": "High",
  "Wi-Fi/IT": "Medium",
  "Sanitation": "Medium",
  "Furniture": "Medium",
  "Hostel": "Medium",
  "Classroom/Lab": "Medium",
  "Canteen": "Low",
  "Library": "Low",
  "Other": "Low",
};

export function calculateSeverity(category: string, netVotes: number): Severity {
  const base = CATEGORY_BASE_SEVERITY[category] || "Low";
  
  if (netVotes >= 25) return "Critical";
  
  if (netVotes >= 10) {
    if (base === "Low") return "Medium";
    if (base === "Medium") return "High";
    return "Critical";
  }
  
  return base;
}

export function determineStatusFromVotes(currentStatus: Status, upvotes: number, downvotes: number): Status {
  const netDownvotes = downvotes - upvotes;
  
  if (downvotes >= 10 && upvotes === 0) return "Removed";
  if (netDownvotes >= 5 && currentStatus === "Submitted") return "Under Review";
  
  return currentStatus;
}

export function calculateSLAHours(severity: Severity): number {
  switch (severity) {
    case "Critical": return 12;
    case "High": return 24;
    case "Medium": return 72;
    case "Low": return 168; 
    default: return 168;
  }
}
