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

export function calculateSeverity(
  category: string,
  netVotes: number,
  rules?: { upvotesToMedium?: number; upvotesToCritical?: number }
): Severity {
  const base = CATEGORY_BASE_SEVERITY[category] || "Low";
  const upMed = rules?.upvotesToMedium ?? 10;
  const upCrit = rules?.upvotesToCritical ?? 25;

  if (netVotes >= upCrit) return "Critical";

  if (netVotes >= upMed) {
    if (base === "Low") return "Medium";
    if (base === "Medium") return "High";
    return "Critical";
  }

  return base;
}

export function determineStatusFromVotes(
  currentStatus: Status,
  upvotes: number,
  downvotes: number,
  rules?: { downvotesToFlag?: number; downvotesToRemove?: number }
): Status {
  const netDownvotes = downvotes - upvotes;
  const downRemove = rules?.downvotesToRemove ?? 10;
  const downFlag = rules?.downvotesToFlag ?? 5;

  if (downvotes >= downRemove && upvotes === 0) return "Removed";
  if (netDownvotes >= downFlag && currentStatus === "Submitted") return "Under Review";

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
