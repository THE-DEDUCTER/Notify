"use client";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import { Bell, LogOut, Menu, ShieldAlert } from "lucide-react";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { useState, useEffect } from "react";

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  if (!user || pathname === "/login") return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-primary" />
          <span className="font-bold text-xl tracking-tight text-primary">Notify</span>
          <span className="ml-2 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
            {user.role}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            {(user.role === 'Student' || user.role === 'Faculty') && (
              <>
                <Link href="/feed" className={`transition-colors hover:text-foreground ${pathname === '/feed' ? 'text-foreground font-semibold' : ''}`}>Feed</Link>
                <Link href="/my-complaints" className={`transition-colors hover:text-foreground ${pathname === '/my-complaints' ? 'text-foreground font-semibold' : ''}`}>My Complaints</Link>
                <Link href="/raise" className="px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm font-semibold">Raise Issue</Link>
              </>
            )}
            {user.role === 'Assistant' && (
              <>
                <Link href="/assistant/dashboard" className={`transition-colors hover:text-foreground ${pathname.startsWith('/assistant') ? 'text-foreground font-semibold' : ''}`}>Queue Dashboard</Link>
                <Link href="/feed" className={`transition-colors hover:text-foreground ${pathname === '/feed' ? 'text-foreground font-semibold' : ''}`}>Campus Feed</Link>
              </>
            )}
            {user.role === 'Admin' && (
              <>
                <Link href="/admin/dashboard" className={`transition-colors hover:text-foreground ${pathname === '/admin/dashboard' ? 'text-foreground font-semibold' : ''}`}>Overview</Link>
                <Link href="/admin/complaints" className={`transition-colors hover:text-foreground ${pathname === '/admin/complaints' ? 'text-foreground font-semibold' : ''}`}>Moderation Console</Link>
                <Link href="/feed" className={`transition-colors hover:text-foreground ${pathname === '/feed' ? 'text-foreground font-semibold' : ''}`}>Public Feed</Link>
              </>
            )}
            {user.role === 'SuperAdmin' && (
              <>
                <Link href="/superadmin/analytics" className={`transition-colors hover:text-foreground ${pathname.startsWith('/superadmin') ? 'text-foreground font-semibold' : ''}`}>Institutional SLA & Analytics</Link>
                <Link href="/admin/complaints" className={`transition-colors hover:text-foreground ${pathname === '/admin/complaints' ? 'text-foreground font-semibold' : ''}`}>Audit Console</Link>
                <Link href="/feed" className={`transition-colors hover:text-foreground ${pathname === '/feed' ? 'text-foreground font-semibold' : ''}`}>Campus Feed</Link>
              </>
            )}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full border border-background"></span>
            </button>
            <button onClick={logout} className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
            <button className="md:hidden p-2 text-muted-foreground hover:bg-muted rounded-md transition-colors">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
