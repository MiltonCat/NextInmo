"use client";
import dynamic from "next/dynamic";

const InversionesEvolucionChart = dynamic(
  () => import("@/components/InversionesEvolucionChart"),
  { ssr: false, loading: () => <div className="h-64 bg-gray-100 rounded-xl animate-pulse" /> }
);

export default function PrecioM2Chart({ data }) {
  return <InversionesEvolucionChart data={data} />;
}
