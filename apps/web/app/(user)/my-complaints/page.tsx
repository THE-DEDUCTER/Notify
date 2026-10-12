"use client";
import { useState } from "react";
import Link from "next/link";
import { useComplaints } from "@/lib/context/ComplaintsContext";
import { ComplaintCard } from "@/components/domain/ComplaintCard";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList,
  Trash2,
  AlertTriangle,
  X,
  CheckCircle2,
  PlusCircle,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { Button } from "@/components/ui/button";

export default function MyComplaintsPage() {
  const { user } = useAuth();
  const { complaints, deleteComplaint } = useComplaints();

  // State for withdrawal modal
  const [ticketToWithdraw, setTicketToWithdraw] = useState<string | null>(null);
  const [withdrawReason, setWithdrawReason] = useState("Resolved on its own");
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Show complaints raised by this user or tagged in seed for demo
  const myComplaints = complaints.filter(
    (c) =>
      c.raiserId === user?.id ||
      c.raiserId === "current_user" ||
      c.id === "comp_1" ||
      c.id === "comp_4" ||
      c.id === "comp_8"
  );

  const handleConfirmWithdraw = () => {
    if (!ticketToWithdraw) return;
    deleteComplaint(ticketToWithdraw, withdrawReason);
    const id = ticketToWithdraw;
    setTicketToWithdraw(null);
    setSuccessToast(`Grievance #${id.toUpperCase()} has been permanently withdrawn.`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
              Student Grievance Ledger
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              Anonymous Tracking
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            My Submitted Issues
          </h1>
          <p className="text-muted-foreground mt-1 text-base">
            Track real-time lifecycle, technician notes, or withdraw your reports anytime.
          </p>
        </div>

        <Link href="/raise">
          <Button className="rounded-xl font-semibold shadow-xs">
            <PlusCircle className="w-4 h-4 mr-2" />
            Raise New Grievance
          </Button>
        </Link>
      </div>

      {/* Success Notification */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 rounded-xl border border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400 flex items-center justify-between text-sm font-medium shadow-xs"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{successToast}</span>
            </div>
            <button
              onClick={() => setSuccessToast(null)}
              className="text-green-700 dark:text-green-400 hover:opacity-75"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grievances List */}
      <div className="flex flex-col gap-5">
        <AnimatePresence mode="popLayout">
          {myComplaints.map((complaint) => (
            <motion.div
              layout
              key={complaint.id}
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative group"
            >
              <ComplaintCard complaint={complaint} />

              {/* Raiser Actions Footer Bar */}
              <div className="mt-2 flex items-center justify-between px-3 py-1.5 rounded-xl border border-border/50 bg-muted/20 text-xs">
                <span className="text-muted-foreground font-mono">
                  Ticket #{complaint.id.toUpperCase()} • Your Submission
                </span>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/complaint/${complaint.id}`}
                    className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                  >
                    View Status Timeline
                    <ExternalLink className="w-3 h-3" />
                  </Link>

                  <span className="text-border">•</span>

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setTicketToWithdraw(complaint.id);
                    }}
                    className="text-xs font-bold text-destructive hover:text-destructive/80 transition-colors flex items-center gap-1 px-2 py-0.5 rounded hover:bg-destructive/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Withdraw / Delete
                  </button>
                </div>
              </div>
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
            <h3 className="text-lg font-bold text-foreground mb-1">
              No active grievances
            </h3>
            <p className="text-muted-foreground max-w-sm text-sm mb-6">
              You haven't reported any issues, or all previous grievances have been resolved and closed.
            </p>
            <Link href="/raise">
              <Button className="rounded-xl font-semibold">
                Report Campus Issue Now
              </Button>
            </Link>
          </motion.div>
        )}
      </div>

      {/* Modal: Confirm Grievance Withdrawal */}
      <AnimatePresence>
        {ticketToWithdraw && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setTicketToWithdraw(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    Withdraw This Grievance?
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Ticket #{ticketToWithdraw.toUpperCase()}
                  </p>
                </div>
              </div>

              <p className="text-sm text-foreground/80 leading-relaxed mb-4">
                Withdrawing this grievance will permanently remove it from the public campus feed, cancel technician dispatch, and halt SLA tracking.
              </p>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                    Select Reason For Withdrawal
                  </label>
                  <select
                    value={withdrawReason}
                    onChange={(e) => setWithdrawReason(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm font-medium text-foreground focus:outline-none"
                  >
                    <option value="Resolved on its own">Issue resolved on its own</option>
                    <option value="Submitted by mistake / duplicate">Submitted by mistake / duplicate</option>
                    <option value="No longer urgent / cancelled">No longer urgent / cancelled</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2.5">
                <Button
                  variant="outline"
                  onClick={() => setTicketToWithdraw(null)}
                  className="rounded-xl"
                >
                  Keep Issue Active
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleConfirmWithdraw}
                  className="rounded-xl font-semibold shadow-xs"
                >
                  <Trash2 className="w-4 h-4 mr-1.5" />
                  Confirm Withdrawal
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
