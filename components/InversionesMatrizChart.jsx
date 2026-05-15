"use client";
import {
  CartesianGrid, ReferenceArea, ReferenceLine,
  ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis,
} from "recharts";

function MatrixDot(props) {
  const { cx, cy, payload } = props;
  return (
    <g>
      <circle cx={cx} cy={cy} r={16} fill={payload.color} opacity={0.15} />
      <circle cx={cx} cy={cy} r={7} fill={payload.color} opacity={0.9} />
      <text x={cx} y={cy - 16} textAnchor="middle" fill="#6b7280" fontSize={9} fontWeight={600}>
        {payload.nombre}
      </text>
    </g>
  );
}

export default function InversionesMatrizChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 24, right: 24, bottom: 28, left: 8 }}>
        <ReferenceArea x1={0} x2={5} y1={11} y2={22} fill="#10b981" fillOpacity={0.05} />
        <ReferenceArea x1={5} x2={10} y1={11} y2={22} fill="#f59e0b" fillOpacity={0.05} />
        <ReferenceArea x1={0} x2={5} y1={0} y2={11} fill="#0ea5e9" fillOpacity={0.04} />
        <ReferenceArea x1={5} x2={10} y1={0} y2={11} fill="#E8325A" fillOpacity={0.04} />
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
        <XAxis
          type="number"
          dataKey="riesgo"
          name="Riesgo"
          domain={[0, 10]}
          stroke="#4b5563"
          fontSize={10}
          tickLine={false}
          axisLine={false}
          label={{ value: "Riesgo →", position: "insideBottom", offset: -12, fill: "#4b5563", fontSize: 10 }}
        />
        <YAxis
          type="number"
          dataKey="retorno"
          name="Retorno"
          domain={[0, 22]}
          stroke="#4b5563"
          fontSize={10}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${v}%`}
          width={36}
        />
        <Tooltip
          cursor={{ strokeDasharray: "3 3", stroke: "rgba(255,255,255,0.08)" }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0].payload;
            return (
              <div className="bg-[#1a1a2e] border border-gray-700 rounded-xl p-3 shadow-xl">
                <p className="text-white text-xs font-bold mb-2">{d.nombre}</p>
                <p className="text-gray-400 text-xs">Riesgo: <span className="text-gray-200 font-semibold">{d.riesgo}/10</span></p>
                <p className="text-gray-400 text-xs">Retorno est.: <span className="text-primary-500 font-semibold">~{d.retorno}% anual</span></p>
              </div>
            );
          }}
        />
        <ReferenceLine x={5} stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
        <ReferenceLine y={11} stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
        <Scatter data={data} shape={<MatrixDot />} />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
