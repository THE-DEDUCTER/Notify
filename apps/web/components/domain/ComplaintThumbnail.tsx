"use client";
import React, { useState } from "react";
import {
  ShieldAlert,
  Zap,
  Droplets,
  Wifi,
  Trash2,
  Armchair,
  Home,
  BookOpen,
  HelpCircle,
} from "lucide-react";

export const CATEGORY_DEFAULT_IMAGES: Record<string, string> = {
  "Safety": "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80",
  "Electrical": "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80",
  "Plumbing/Water": "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=600&q=80",
  "Wi-Fi/IT": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80",
  "Sanitation": "https://images.unsplash.com/photo-1528323273322-d81458248d40?auto=format&fit=crop&w=600&q=80",
  "Furniture": "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=600&q=80",
  "Hostel": "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=600&q=80",
  "Classroom/Lab": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
  "Library": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
  "Other": "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=600&q=80",
};

interface ComplaintThumbnailProps {
  images?: string[];
  category: string;
  className?: string;
}

export function ComplaintThumbnail({
  images,
  category,
  className = "w-24 h-24 sm:w-28 sm:h-28",
}: ComplaintThumbnailProps) {
  const [hasError, setHasError] = useState(false);

  // If complaint has images and first image is not empty, use it. Otherwise use category fallback image.
  const candidateUrl =
    images && images.length > 0 && images[0]?.trim()
      ? images[0]
      : CATEGORY_DEFAULT_IMAGES[category] || CATEGORY_DEFAULT_IMAGES["Other"];

  const imageCount = images?.length || 1;

  // Category Icon & styling for offline / network failure fallback
  const getCategoryIcon = () => {
    switch (category) {
      case "Safety":
        return <ShieldAlert className="w-8 h-8 text-red-500" />;
      case "Electrical":
        return <Zap className="w-8 h-8 text-amber-500" />;
      case "Plumbing/Water":
        return <Droplets className="w-8 h-8 text-blue-500" />;
      case "Wi-Fi/IT":
        return <Wifi className="w-8 h-8 text-cyan-500" />;
      case "Sanitation":
        return <Trash2 className="w-8 h-8 text-emerald-500" />;
      case "Furniture":
        return <Armchair className="w-8 h-8 text-purple-500" />;
      case "Hostel":
        return <Home className="w-8 h-8 text-indigo-500" />;
      case "Classroom/Lab":
      case "Library":
        return <BookOpen className="w-8 h-8 text-blue-400" />;
      default:
        return <HelpCircle className="w-8 h-8 text-muted-foreground" />;
    }
  };

  return (
    <div
      className={`shrink-0 relative rounded-xl overflow-hidden border border-border/60 bg-muted/50 mt-0.5 ${className}`}
    >
      {!hasError ? (
        <img
          src={candidateUrl}
          alt={`${category} issue evidence`}
          loading="lazy"
          onError={() => setHasError(true)}
          className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-card/80">
          {getCategoryIcon()}
          <span className="text-[10px] font-bold text-muted-foreground mt-1 truncate max-w-full px-1">
            {category}
          </span>
        </div>
      )}

      {imageCount > 1 && !hasError && (
        <div className="absolute bottom-1.5 right-1.5 bg-background/80 backdrop-blur-md text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm text-foreground">
          +{imageCount - 1}
        </div>
      )}
    </div>
  );
}
