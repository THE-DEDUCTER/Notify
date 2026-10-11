"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { calculateSeverity } from "@/lib/rules";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, CheckCircle2, AlertTriangle, UploadCloud } from "lucide-react";

import { useComplaints } from "@/lib/context/ComplaintsContext";

const categorySchema = z.object({
  category: z.string().min(1, "Please select a category"),
});

const detailsSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100),
  description: z.string().min(20, "Description must be at least 20 characters"),
});

const CATEGORIES = [
  "Electrical", "Plumbing/Water", "Wi-Fi/IT", "Hostel", 
  "Classroom/Lab", "Sanitation", "Canteen", "Library", "Safety", "Other"
];

export default function RaiseComplaintPage() {
  const router = useRouter();
  const { addComplaint } = useComplaints();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ category: "", title: "", description: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const catForm = useForm({ resolver: zodResolver(categorySchema), defaultValues: { category: formData.category } });
  const detForm = useForm({ resolver: zodResolver(detailsSchema), defaultValues: { title: formData.title, description: formData.description } });

  const onCategorySubmit = (data: any) => {
    setFormData(prev => ({ ...prev, category: data.category }));
    setStep(2);
  };

  const onDetailsSubmit = (data: any) => {
    setFormData(prev => ({ ...prev, title: data.title, description: data.description }));
    setStep(3); 
  };

  const severityPreview = formData.category ? calculateSeverity(formData.category, 0) : "Low";

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Raise an Issue</h1>
        <p className="text-muted-foreground mt-2 text-lg">Your identity remains completely anonymous.</p>
      </div>

      <div className="flex items-center gap-2 mb-10">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`h-2 flex-1 rounded-full transition-colors ${step >= s ? 'bg-primary' : 'bg-muted'}`} />
          </div>
        ))}
      </div>

      <div className="bg-card border border-border shadow-sm rounded-2xl p-6 sm:p-10 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-xl font-bold mb-6">Select a Category</h2>
              <form onSubmit={catForm.handleSubmit(onCategorySubmit)} className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => catForm.setValue("category", cat)}
                      className={`p-4 rounded-xl border text-sm font-medium transition-all text-center ${
                        catForm.watch("category") === cat 
                        ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20' 
                        : 'border-border hover:border-primary/40 text-foreground bg-card'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                {catForm.formState.errors.category && (
                  <p className="text-destructive text-sm font-medium">{catForm.formState.errors.category.message as string}</p>
                )}
                <div className="flex justify-end pt-4">
                  <Button type="submit" size="lg" className="rounded-xl font-medium px-8">Next <ArrowRight className="w-4 h-4 ml-2" /></Button>
                </div>
              </form>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-xl font-bold mb-6">Issue Details</h2>
              <form onSubmit={detForm.handleSubmit(onDetailsSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Title</label>
                  <input
                    {...detForm.register("title")}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Short description of the issue"
                  />
                  {detForm.formState.errors.title && (
                    <p className="text-destructive text-sm font-medium">{detForm.formState.errors.title.message as string}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Detailed Description</label>
                  <textarea
                    {...detForm.register("description")}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 min-h-[140px] focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                    placeholder="Provide location, impact, and any other relevant details..."
                  />
                  {detForm.formState.errors.description && (
                    <p className="text-destructive text-sm font-medium">{detForm.formState.errors.description.message as string}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Photos (Optional, max 3)</label>
                  <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/30 hover:border-primary/40 transition-colors cursor-pointer bg-background/50">
                    <UploadCloud className="w-8 h-8 mb-3" />
                    <span className="text-sm font-medium">Click to upload or drag and drop</span>
                    <span className="text-xs mt-1">PNG, JPG up to 5MB (Location metadata will be stripped)</span>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button type="button" variant="outline" size="lg" className="rounded-xl font-medium px-6" onClick={() => setStep(1)}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </Button>
                  <Button type="submit" size="lg" className="rounded-xl font-medium px-8">Review <ArrowRight className="w-4 h-4 ml-2" /></Button>
                </div>
              </form>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="flex items-center gap-3 mb-6">
                <CheckCircle2 className="w-8 h-8 text-primary" />
                <h2 className="text-xl font-bold">Review & Submit</h2>
              </div>
              
              <div className="bg-muted/30 rounded-xl p-6 border border-border space-y-5 mb-8">
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1.5">Category</div>
                  <div className="font-medium text-foreground">{formData.category}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1.5">Title</div>
                  <div className="font-medium text-foreground">{formData.title}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1.5">Description</div>
                  <div className="text-sm leading-relaxed text-foreground/90 bg-background/50 p-3 rounded-lg border border-border/50">{formData.description}</div>
                </div>
                <div className="pt-5 border-t border-border flex items-center justify-between">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Estimated Initial Severity</div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border bg-severity-${severityPreview.toLowerCase()} shadow-sm`}>
                    {severityPreview}
                  </span>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-xl p-4 flex items-start gap-3 mb-8 shadow-sm">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800 dark:text-amber-400 font-medium">
                  By submitting this issue, you confirm the details are accurate. The community will be able to view and vote on this issue anonymously.
                </p>
              </div>

              <div className="flex justify-between">
                <Button type="button" variant="outline" size="lg" className="rounded-xl font-medium px-6" onClick={() => setStep(2)}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button 
                  size="lg" 
                  disabled={isSubmitting}
                  className="rounded-xl font-semibold px-8 shadow-sm" 
                  onClick={() => {
                    setIsSubmitting(true);
                    addComplaint({
                      title: formData.title,
                      description: formData.description,
                      category: formData.category,
                      images: [
                        "https://images.unsplash.com/photo-1584282862025-06a147610360?q=80&w=800&auto=format&fit=crop"
                      ],
                    });
                    router.push('/feed');
                  }}
                >
                  {isSubmitting ? "Submitting..." : "Submit Grievance"}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
