import { Suspense } from "react";
import { ComplaintDetailClient } from "./client-page";

async function ComplaintDetailLoader({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ComplaintDetailClient id={id} />;
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="p-12 text-center text-muted-foreground font-medium animate-pulse">Loading complaint details...</div>}>
      <ComplaintDetailLoader params={params} />
    </Suspense>
  );
}
