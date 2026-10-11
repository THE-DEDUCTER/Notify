"use client";
import { useState } from "react";
import { useComplaints } from "@/lib/context/ComplaintsContext";
import { ComplaintCard } from "@/components/domain/ComplaintCard";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardList, Filter } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";

export default function MyComplaintsPage() {
  const { user } = useAuth();
  const { complaints } = useComplaints();
  
  // Show complaints raised by this user or tagged in seed
  const myComplaints = complaints.filter(
    (c) => c.raiserId === user?.id || c.raiserId === "current_user" || c.id === "comp_1" || c.id === "comp_4" || c.id === "comp_8"
  );

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">My Complaints</h1>
          <p className="text-muted-foreground mt-2 text-lg">Track the status of issues you have reported.</p>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <AnimatePresence mode="popLayout">
          {myComplaints.map(complaint => (
            <motion.div
              layout
              key={complaint.id}
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <ComplaintCard complaint={complaint} />
            </motion.div>
          ))}
        </AnimatePresence>
        
        {myComplaints.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-border rounded-2xl bg-card/50 text-center px-4"
          >
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center text-muted-foreground mb-4">
              <ClipboardList className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">No complaints yet</h3>
            <p className="text-muted-foreground max-w-sm">You haven't reported any issues yet. When you do, they will appear here.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
