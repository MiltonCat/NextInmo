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
      {/* Márgenes al mínimo que tolera el dibujo: la nube de puntos tiene que
          usar el alto que se le dio, no dejarlo en aire. `top` baja de 24 a 14
          porque ahí solo va la etiqueta de nombre del punto más alto, y
          `right` de 24 a 12. `bottom` se queda en 28: ahí vive el rótulo
          "Riesgo →", que está posicionado con offset -12 y se corta si se
          achica. */}
      <ScatterChart margin={{ top: 14, right: 12, bottom: 28, left: 4 }}>
        <ReferenceArea x1={0} x2={5} y1={11} y2={22} fill="#10b981" fillOpacity={0.05} />
        <ReferenceArea x1={5} x2={10} y1={11} y2={22} fill="#f59e0b" fillOpacity={0.05} />
        <ReferenceArea x1={0} x2={5} y1={0} y2={11} fill="#0ea5e9" fillOpacity={0.04} />
        <ReferenceArea x1={5} x2={10} y1={0} y2={11} fill="#E8325A" fillOpacity={0.04} />
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          type="number"
          dataKey="riesgo"
          name="Riesgo"
          domain={[0, 10]}
          stroke="#9ca3af"
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
          stroke="#9ca3af"
          fontSize={10}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${v}%`}
          width={36}
        />
        <Tooltip
          cursor={{ strokeDasharray: "3 3", stroke: "rgba(0,0,0,0.12)" }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0].payload;
            return (
              // El tooltip conserva sombra —suave— porque flota sobre el
              // gráfico: es el único caso de la página donde el borde solo no
              // alcanza para despegarlo del fondo.
              <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">{d.nombre}</p>
                <p className="text-[11px] text-gray-500">Riesgo: <span className="font-semibold tabular-nums text-gray-900">{d.riesgo}/10</span></p>
                <p className="text-[11px] text-gray-500">Retorno est.: <span className="font-semibold tabular-nums text-gray-900">~{d.retorno}% anual</span></p>
              </div>
            );
          }}
        />
        {/* Las líneas de referencia eran blancas translúcidas, invisibles sobre
            fondo claro. */}
        <ReferenceLine x={5} stroke="rgba(0,0,0,0.08)" strokeDasharray="4 4" />
        <ReferenceLine y={11} stroke="rgba(0,0,0,0.08)" strokeDasharray="4 4" />
        <Scatter data={data} shape={<MatrixDot />} />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
