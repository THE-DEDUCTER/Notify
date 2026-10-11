"use client";
import { useState } from "react";
import { useComplaints } from "@/lib/context/ComplaintsContext";
import { ComplaintCard } from "@/components/domain/ComplaintCard";
import { Input } from "@/components/ui/input";
import { Search, AlertTriangle, Layers, Flame, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = [
  "All",
  "Safety",
  "Electrical",
  "Plumbing/Water",
  "Wi-Fi/IT",
  "Sanitation",
  "Furniture",
  "Hostel",
];

export default function FeedPage() {
  const { complaints } = useComplaints();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Pending" | "Resolved">("All");

  const severityScore = { Critical: 4, High: 3, Medium: 2, Low: 1 };

  const filteredComplaints = complaints
    .filter((c) => c.status !== "Removed")
    .filter((c) => {
      if (selectedCategory !== "All" && c.category !== selectedCategory) return false;
      if (statusFilter === "Active" && (c.status === "Resolved" || c.status === "Closed")) return false;
      if (statusFilter === "Pending" && c.status !== "Pending Confirmation") return false;
      if (statusFilter === "Resolved" && c.status !== "Resolved" && c.status !== "Closed") return false;

      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.category.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      // 1. Critical severity takes top priority
      const aScore = severityScore[a.severity];
      const bScore = severityScore[b.severity];
      if (aScore !== bScore) return bScore - aScore;

      // 2. Net community votes
      const aVotes = a.upvotes - a.downvotes;
      const bVotes = b.upvotes - b.downvotes;
      if (aVotes !== bVotes) return bVotes - aVotes;

      // 3. Recency
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const criticalCount = complaints.filter(
    (c) => c.severity === "Critical" && c.status !== "Resolved" && c.status !== "Closed" && c.status !== "Removed"
  ).length;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
              Live Campus Board
            </span>
            {criticalCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-destructive/10 text-destructive border border-destructive/20 flex items-center gap-1 animate-pulse">
                <Flame className="w-3 h-3" />
                {criticalCount} Critical Active
              </span>
            )}
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Campus Feed</h1>
          <p className="text-muted-foreground mt-1 text-base">
            Discover, upvote, and track issues across campus facilities anonymously.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search keywords, labs, dorms..."
            className="pl-10 h-11 bg-card border-border shadow-sm rounded-xl focus-visible:ring-primary/20 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              selectedCategory === cat
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Secondary Status Filter Pills */}
      <div className="flex items-center justify-between gap-4 mb-6 pb-2 border-b border-border/50 text-xs font-medium text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-muted-foreground font-semibold">Status:</span>
          {(["All", "Active", "Pending", "Resolved"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                statusFilter === st
                  ? "bg-muted text-foreground font-bold shadow-xs"
                  : "hover:text-foreground"
              }`}
            >
              {st === "Pending" ? "Awaiting Student Confirmation" : st}
            </button>
          ))}
        </div>
        <div className="text-muted-foreground text-xs font-mono">
          Showing {filteredComplaints.length} grievances
        </div>
      </div>

      {/* Grievances List */}
      <div className="flex flex-col gap-4">
        <AnimatePresence mode="popLayout">
          {filteredComplaints.map((complaint) => (
            <motion.div
              layout
              key={complaint.id}
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <ComplaintCard complaint={complaint} />
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredComplaints.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border rounded-2xl bg-card/50 text-center px-4"
          >
            <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center text-muted-foreground mb-4">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1">No complaints found</h3>
            <p className="text-muted-foreground max-w-sm text-sm">
              We couldn't find any issues matching "{search || selectedCategory}". Try clearing your filters.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
