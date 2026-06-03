"use client";
import dynamic from "next/dynamic";

const InvestmentMap = dynamic(() => import("./InvestmentMap"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      Cargando mapa…
    </div>
  ),
});

export default function InvestmentMapClient() {
  return <InvestmentMap />;
}
