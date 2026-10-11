"use client";
import { useAuth } from "@/lib/context/AuthContext";
import { Role } from "@/types";
import { ShieldAlert, User, Wrench, Shield, Crown } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const { login } = useAuth();

  const roles: { id: Role; label: string; icon: any; desc: string }[] = [
    { id: "Student", label: "Student / Faculty", icon: User, desc: "Raise issues and track resolutions." },
    { id: "Assistant", label: "Assistant", icon: Wrench, desc: "Manage assigned tasks and SLAs." },
    { id: "Admin", label: "Administrator", icon: Shield, desc: "Oversee operations and flagged items." },
    { id: "SuperAdmin", label: "Super Admin", icon: Crown, desc: "Manage institution rules and data." },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden bg-background">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[100px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-md w-full relative z-10"
      >
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 mb-6">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-3">Notify</h1>
          <p className="text-muted-foreground">Smart Campus Grievance & Resolution</p>
        </div>

        <div className="bg-card border border-border shadow-2xl shadow-black/5 rounded-2xl p-6 sm:p-8">
          <h2 className="text-lg font-semibold mb-6 text-center text-foreground">Select a role to continue</h2>
          
          <div className="grid gap-3">
            {roles.map((r) => (
              <motion.button
                key={r.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => login(r.id)}
                className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-primary/30 transition-all group text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <r.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-medium text-foreground group-hover:text-primary transition-colors">{r.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{r.desc}</div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
