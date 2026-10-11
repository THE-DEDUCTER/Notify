import { Complaint, User, Department, Severity, Status } from "@/types";
import { calculateSLAHours } from "@/lib/rules";

export const MOCK_DEPARTMENTS: Department[] = [
  { id: "dept_1", name: "Maintenance & Plumbing" },
  { id: "dept_2", name: "IT & Network Services" },
  { id: "dept_3", name: "Campus Security" },
  { id: "dept_4", name: "Hostel Administration" },
  { id: "dept_5", name: "Electrical & Facilities" },
  { id: "dept_6", name: "Sanitation & Grounds" },
];

export const MOCK_ASSISTANTS: User[] = [
  { id: "ast_1", name: "John Builder", role: "Assistant", departmentId: "dept_1" },
  { id: "ast_2", name: "Sarah Tech", role: "Assistant", departmentId: "dept_2" },
  { id: "ast_3", name: "Officer Mark Vance", role: "Assistant", departmentId: "dept_3" },
  { id: "ast_4", name: "Elena Rostova", role: "Assistant", departmentId: "dept_4" },
  { id: "ast_5", name: "Dev Patel", role: "Assistant", departmentId: "dept_5" },
  { id: "ast_6", name: "Priya Sharma", role: "Assistant", departmentId: "dept_6" },
];

interface SeedTemplate {
  title: string;
  category: string;
  departmentId: string;
  description: string;
  severity: Severity;
  status: Status;
  upvotes: number;
  downvotes: number;
  hoursAgo: number;
  images: string[];
  assignedAssistantId?: string;
  historyNotes?: string;
}

const TEMPLATES: SeedTemplate[] = [
  {
    title: "Emergency exit door jammed shut on West Wing Ground Floor",
    category: "Safety",
    departmentId: "dept_3",
    description: "The fire emergency push-bar exit door near Staircase B is completely jammed and will not budge. In case of emergency evacuation, this presents a severe safety hazard for students in Classrooms 101-108.",
    severity: "Critical",
    status: "In Progress",
    upvotes: 42,
    downvotes: 1,
    hoursAgo: 4,
    assignedAssistantId: "ast_3",
    images: ["https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80"],
    historyNotes: "Campus security dispatched lock technician to clear the jammed hinge mechanism.",
  },
  {
    title: "Air conditioner in Computer Science Lab 4 leaking condensation onto workstations",
    category: "Electrical",
    departmentId: "dept_5",
    description: "The ceiling split unit above workstation row 3 has been dripping dirty condensate water directly over power strips and two desktop monitors since this morning. Puddles are forming near high-voltage wiring.",
    severity: "Critical",
    status: "In Progress",
    upvotes: 38,
    downvotes: 0,
    hoursAgo: 6,
    assignedAssistantId: "ast_5",
    images: ["https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80"],
    historyNotes: "Power isolated to row 3. HVAC technician replacing blocked drain pipe.",
  },
  {
    title: "Wi-Fi access point in Central Library 2nd floor dropping connection continuously",
    category: "Wi-Fi/IT",
    departmentId: "dept_2",
    description: "Students studying on the entire second floor reading zone are experiencing connection drops every 3-5 minutes on the 'Campus_Student_5G' SSID. High packet loss is making research and coursework submission impossible.",
    severity: "High",
    status: "Assigned",
    upvotes: 29,
    downvotes: 2,
    hoursAgo: 14,
    assignedAssistantId: "ast_2",
    images: ["https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80"],
  },
  {
    title: "Broken water purifier dispenser on 3rd floor Boys Hostel Block C",
    category: "Plumbing/Water",
    departmentId: "dept_1",
    description: "The primary RO water cooler dispenser valve is broken off, leaking water continuously across the corridor tiles and leaving over 80 hostel residents without clean drinking water on this floor.",
    severity: "High",
    status: "In Progress",
    upvotes: 31,
    downvotes: 1,
    hoursAgo: 26,
    assignedAssistantId: "ast_1",
    images: ["https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=600&q=80"],
    historyNotes: "Replacement valve requisitioned from central store.",
  },
  {
    title: "Uncollected trash bins overflowing outside Student Activities Center",
    category: "Sanitation",
    departmentId: "dept_6",
    description: "Food waste and beverage cups have been overflowing from the 3 large outdoor bins near the canteen entrance for 2 days. The area has started smelling terrible and attracts stray animals.",
    severity: "Medium",
    status: "Pending Confirmation",
    upvotes: 19,
    downvotes: 2,
    hoursAgo: 36,
    assignedAssistantId: "ast_6",
    images: ["https://images.unsplash.com/photo-1528323273322-d81458248d40?auto=format&fit=crop&w=600&q=80"],
    historyNotes: "Grounds crew thoroughly cleared the area, sanitized bins, and installed two additional high-capacity disposal units.",
  },
  {
    title: "Main staircase handrail loose between 2nd and 3rd floor - Science Block",
    category: "Safety",
    departmentId: "dept_1",
    description: "The metal handrail on the north stairwell is detached from its wall anchor bracket. It wobbles violently when held and someone could lose balance during peak transition hours.",
    severity: "High",
    status: "Submitted",
    upvotes: 24,
    downvotes: 1,
    hoursAgo: 8,
    images: ["https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=600&q=80"],
  },
  {
    title: "Fluorescent light flickering vigorously in Lecture Hall B-204",
    category: "Electrical",
    departmentId: "dept_5",
    description: "Three overhead fluorescent tubes above rows 4-6 have severe strobe flickering. Prof. Sharma had to cancel projector slides because it causes intense eye strain and headaches.",
    severity: "Medium",
    status: "Resolved",
    upvotes: 16,
    downvotes: 0,
    hoursAgo: 48,
    assignedAssistantId: "ast_5",
    images: ["https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80"],
    historyNotes: "Ballasts and all 3 tubes replaced with high-efficiency flicker-free LED fixtures.",
  },
  {
    title: "Restroom flush valve stuck open causing continuous water overflow - Academic Block 1",
    category: "Plumbing/Water",
    departmentId: "dept_1",
    description: "The center stall flush valve in the ground floor men's restroom is stuck open at full pressure. Water has begun pooling outside the restroom door and gallons of fresh water are being wasted.",
    severity: "High",
    status: "Pending Confirmation",
    upvotes: 22,
    downvotes: 1,
    hoursAgo: 18,
    assignedAssistantId: "ast_1",
    images: ["https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80"],
    historyNotes: "Internal diaphragm valve replaced and tested under line pressure.",
  },
  {
    title: "Dim street lighting on path connecting Hostel 4 to Dining Hall",
    category: "Safety",
    departmentId: "dept_5",
    description: "Two solar LED pathway lamps along the walkway between Girls Hostel 4 and the Mess dining hall are dead. The pathway is pitch black after 8 PM, making students feel unsafe walking back from late dinner.",
    severity: "Critical",
    status: "In Progress",
    upvotes: 45,
    downvotes: 0,
    hoursAgo: 13,
    assignedAssistantId: "ast_5",
    images: ["https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=600&q=80"],
    historyNotes: "Batteries tested; temporary floodlight setup installed while awaiting controller replacement.",
  },
  {
    title: "Cancel Monday morning exams - let everyone sleep in",
    category: "Other",
    departmentId: "dept_4",
    description: "Nobody likes 8 AM tests on Monday. Cancel all of them university wide and start class at noon.",
    severity: "Low",
    status: "Under Review",
    upvotes: 1,
    downvotes: 14,
    hoursAgo: 12,
    images: ["https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80"],
    historyNotes: "Auto-flagged due to negative community vote ratio. Awaiting moderator review.",
  },
  {
    title: "Broken glass panel on student notice board outside Dean's Office",
    category: "Safety",
    departmentId: "dept_1",
    description: "The sliding glass door on the main administrative notice board was shattered, leaving sharp shards dangling above the bench where students wait for office appointments.",
    severity: "High",
    status: "Resolved",
    upvotes: 18,
    downvotes: 1,
    hoursAgo: 72,
    assignedAssistantId: "ast_1",
    images: ["https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80"],
    historyNotes: "Glass shards cleaned up immediately. Heavy-duty acrylic sheet installed.",
  },
  {
    title: "Water pressure extremely low in Girls Hostel shower stalls during morning hours",
    category: "Hostel",
    departmentId: "dept_4",
    description: "Between 7:00 AM and 9:00 AM, the overhead water supply pressure in 2nd floor bathrooms drops to a trickle. Over 60 residents are facing delays getting ready for morning lectures.",
    severity: "Medium",
    status: "Submitted",
    upvotes: 27,
    downvotes: 0,
    hoursAgo: 10,
    images: ["https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=600&q=80"],
  },
  {
    title: "Stray dogs entering campus near South Gate after midnight",
    category: "Safety",
    departmentId: "dept_3",
    description: "The wire fencing adjacent to South Gate has a 4-foot breach. Packs of aggressive dogs enter the campus grounds and chase students returning late from the 24/7 central library.",
    severity: "High",
    status: "Assigned",
    upvotes: 33,
    downvotes: 2,
    hoursAgo: 20,
    assignedAssistantId: "ast_3",
    images: ["https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=600&q=80"],
  },
  {
    title: "Projector bulb burnt out in Seminar Hall 1 before guest lecture",
    category: "Wi-Fi/IT",
    departmentId: "dept_2",
    description: "The ceiling mounted 4K laser projector in Seminar Hall 1 shuts down with an overheating lamp indicator after 30 seconds. National conference keynote is scheduled in 2 days.",
    severity: "Medium",
    status: "In Progress",
    upvotes: 14,
    downvotes: 0,
    hoursAgo: 16,
    assignedAssistantId: "ast_2",
    images: ["https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80"],
  },
  {
    title: "Elevator #2 in Administrative Building stopping abruptly between floors",
    category: "Electrical",
    departmentId: "dept_5",
    description: "The main passenger lift jerked and stopped between floor 3 and 4 with 5 faculty members inside before slowly recovering. Needs immediate safety sensor inspection before someone gets trapped.",
    severity: "Critical",
    status: "In Progress",
    upvotes: 49,
    downvotes: 0,
    hoursAgo: 3,
    assignedAssistantId: "ast_5",
    images: ["https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80"],
    historyNotes: "Elevator shut down with caution tape. OEM maintenance team scheduled for morning inspection.",
  },
  {
    title: "Bench in Campus Green quad shattered by fallen tree branch",
    category: "Furniture",
    departmentId: "dept_6",
    description: "During yesterday evening's thunderstorm, a heavy oak limb crashed onto the stone picnic table and bench near the clocktower. Timber and stone pieces are scattered on the lawn.",
    severity: "Low",
    status: "Submitted",
    upvotes: 11,
    downvotes: 1,
    hoursAgo: 15,
    images: ["https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=600&q=80"],
  },
  {
    title: "Faulty electrical socket sparking in Study Lounge 102",
    category: "Electrical",
    departmentId: "dept_5",
    description: "Wall outlet #4 next to the window emitted audible electrical buzzing and blue sparks when a laptop charger was plugged in. Burning plastic odor was reported.",
    severity: "Critical",
    status: "Pending Confirmation",
    upvotes: 35,
    downvotes: 0,
    hoursAgo: 9,
    assignedAssistantId: "ast_5",
    images: ["https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80"],
    historyNotes: "Breaker tripped, outlet receptacle replaced with commercial grade surge-suppressed socket.",
  },
  {
    title: "Free pizza coupons giveaway click this link now spam",
    category: "Other",
    departmentId: "dept_2",
    description: "Get 100% free Domino's coupon code for everyone at university click short link bit.ly/freepizza2026",
    severity: "Low",
    status: "Removed",
    upvotes: 0,
    downvotes: 18,
    hoursAgo: 5,
    images: ["https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=600&q=80"],
    historyNotes: "Removed by admin as phishing/spam attempt.",
  },
];

// Fixed reference epoch in milliseconds for deterministic SSR consistency
const BASE_EPOCH = 1773000000000;

export function generateSeedData(): Complaint[] {
  return TEMPLATES.map((tmpl, idx) => {
    const id = `comp_${idx + 1}`;
    const createdAt = new Date(BASE_EPOCH - tmpl.hoursAgo * 3600 * 1000).toISOString();
    const slaHours = calculateSLAHours(tmpl.severity);
    const slaDeadline = new Date(new Date(createdAt).getTime() + slaHours * 3600 * 1000).toISOString();

    const history = [
      {
        status: "Submitted" as Status,
        timestamp: createdAt,
        note: "Grievance raised anonymously by campus community member",
      },
    ];

    if (tmpl.status !== "Submitted") {
      history.push({
        status: tmpl.status,
        timestamp: new Date(new Date(createdAt).getTime() + Math.min(2, tmpl.hoursAgo) * 3600 * 1000).toISOString(),
        note: tmpl.historyNotes || `Status updated to ${tmpl.status}`,
      });
    }

    return {
      id,
      title: tmpl.title,
      description: tmpl.description,
      category: tmpl.category,
      severity: tmpl.severity,
      status: tmpl.status,
      isAnonymous: true,
      raiserId: `user_${(idx % 4) + 1}`,
      assignedAssistantId: tmpl.assignedAssistantId,
      departmentId: tmpl.departmentId,
      upvotes: tmpl.upvotes,
      downvotes: tmpl.downvotes,
      createdAt,
      slaDeadline,
      resolvedAt: tmpl.status === "Resolved" || tmpl.status === "Closed" ? new Date(BASE_EPOCH).toISOString() : undefined,
      images: tmpl.images,
      history,
    };
  });
}

export const MOCK_COMPLAINTS = generateSeedData();
