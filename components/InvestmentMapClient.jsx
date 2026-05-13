"use client";
import dynamic from "next/dynamic";

const InvestmentMap = dynamic(() => import("./InvestmentMap"), { ssr: false });

export default function InvestmentMapClient() {
  return <InvestmentMap />;
}
