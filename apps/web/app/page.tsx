import Link from "next/link";
import { ArrowRight, ShieldAlert, Zap, Lock, BarChart3, Building } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex-1 flex flex-col relative overflow-hidden bg-background">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[500px] opacity-30 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-accent/30 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen" />
      </div>

      <div className="container mx-auto px-6 pt-32 pb-24 relative z-10 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-medium text-sm mb-8 border border-primary/20">
          <ShieldAlert className="w-4 h-4" />
          <span>Notify University OS v1.0</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground mb-8 max-w-4xl leading-[1.1]">
          The modern standard for <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">campus maintenance</span>.
        </h1>
        
        <p className="text-xl text-muted-foreground mb-12 max-w-2xl leading-relaxed">
          Report issues anonymously, track resolution timelines in real-time, and hold departments accountable with automated SLAs. 
        </p>
        
        <Link 
          href="/login" 
          className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold text-lg hover:bg-primary/90 hover:scale-105 transition-all shadow-xl shadow-primary/20"
        >
          Access Portal <ArrowRight className="w-5 h-5" />
        </Link>
      </div>

      {/* Feature Grid */}
      <div className="container mx-auto px-6 pb-32 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-card/50 backdrop-blur-md border border-border p-8 rounded-3xl">
            <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mb-6">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">100% Anonymous</h3>
            <p className="text-muted-foreground leading-relaxed">Your identity is cryptographically masked. Speak up about campus issues without fear of retaliation.</p>
          </div>
          
          <div className="bg-card/50 backdrop-blur-md border border-border p-8 rounded-3xl">
            <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mb-6">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">SLA Enforcement</h3>
            <p className="text-muted-foreground leading-relaxed">Every complaint is bound by a strict Service Level Agreement timer. If it breaches, admins are alerted.</p>
          </div>
          
          <div className="bg-card/50 backdrop-blur-md border border-border p-8 rounded-3xl">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mb-6">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Community Voting</h3>
            <p className="text-muted-foreground leading-relaxed">Upvote critical issues to automatically raise their severity and prioritize them for the maintenance team.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
