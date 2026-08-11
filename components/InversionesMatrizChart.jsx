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

// El techo del eje de retorno se calcula, no se fija.
//
// Estaba en 22 % porque el punto más alto decía 18. Al pasar el retorno a
// calcularse desde los supuestos del simulador (ver MATRIX_DATA), el máximo
// bajó a ~13,6 y los tres puntos quedaban apretados en la mitad de abajo, con
// un tercio del gráfico vacío arriba: la separación entre ellos —que es lo
// único que la matriz tiene para decir— se volvía ilegible.
//
// Redondea hacia arriba al múltiplo de 2 siguiente y deja 2 puntos de aire para
// la etiqueta del nombre, que se dibuja 16 px por encima del punto. Con los
// valores de hoy da 16 %. Si mañana el modelo mueve la valorización, el eje
// acompaña solo.
//
// El eje de riesgo se queda en 0–10 fijo: es una escala declarada, no un dato,
// y reescalarla haría que los puntos se muevan sin que nada haya cambiado.
const techoRetorno = (data) =>
  Math.ceil((Math.max(...data.map((d) => d.retorno)) + 2) / 2) * 2;

export default function InversionesMatrizChart({ data }) {
  const maxY = techoRetorno(data);
  return (
    <ResponsiveContainer width="100%" height="100%">
      {/* Márgenes al mínimo que tolera el dibujo: la nube de puntos tiene que
          usar el alto que se le dio, no dejarlo en aire. `top` baja de 24 a 14
          porque ahí solo va la etiqueta de nombre del punto más alto, y
          `right` de 24 a 12. `bottom` se queda en 28: ahí vive el rótulo
          "Riesgo →", que está posicionado con offset -12 y se corta si se
          achica. */}
      <ScatterChart margin={{ top: 14, right: 12, bottom: 28, left: 4 }}>
        <ReferenceArea x1={0} x2={5} y1={maxY / 2} y2={maxY} fill="#10b981" fillOpacity={0.05} />
        <ReferenceArea x1={5} x2={10} y1={maxY / 2} y2={maxY} fill="#f59e0b" fillOpacity={0.05} />
        <ReferenceArea x1={0} x2={5} y1={0} y2={maxY / 2} fill="#0ea5e9" fillOpacity={0.04} />
        <ReferenceArea x1={5} x2={10} y1={0} y2={maxY / 2} fill="#E8325A" fillOpacity={0.04} />
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
          domain={[0, maxY]}
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
                {/* Coma decimal: el retorno dejó de ser un entero escrito a
                    mano y ahora sale de una cuenta (9,6 · 11 · 13,6). Sin
                    formatear, React lo imprime como "9.6". */}
                <p className="text-[11px] text-gray-500">Retorno est.: <span className="font-semibold tabular-nums text-gray-900">~{d.retorno.toLocaleString("es-AR", { maximumFractionDigits: 1 })}% anual</span></p>
              </div>
            );
          }}
        />
        {/* Las líneas de referencia eran blancas translúcidas, invisibles sobre
            fondo claro. */}
        <ReferenceLine x={5} stroke="rgba(0,0,0,0.08)" strokeDasharray="4 4" />
        <ReferenceLine y={maxY / 2} stroke="rgba(0,0,0,0.08)" strokeDasharray="4 4" />
        <Scatter data={data} shape={<MatrixDot />} />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
