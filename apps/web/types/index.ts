export type Role = 'Student' | 'Faculty' | 'Assistant' | 'Admin' | 'SuperAdmin';
export type Severity = 'Low' | 'Medium' | 'High' | 'Critical';
export type Status = 'Submitted' | 'Under Review' | 'Assigned' | 'In Progress' | 'Pending Confirmation' | 'Resolved' | 'Reopened' | 'Closed' | 'Removed';

export interface User {
  id: string;
  name: string;
  role: Role;
  departmentId?: string; 
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: Severity;
  status: Status;
  isAnonymous: boolean; 
  raiserId: string;
  assignedAssistantId?: string;
  departmentId: string;
  upvotes: number;
  downvotes: number;
  createdAt: string; 
  slaDeadline?: string; 
  resolvedAt?: string;
  images: string[]; 
  history: { status: Status; timestamp: string; note?: string }[];
}

export interface Department {
  id: string;
  name: string;
}
