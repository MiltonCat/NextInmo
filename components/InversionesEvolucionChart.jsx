"use client";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

export default function InversionesEvolucionChart({ data }) {
  return (
    <div className="h-48 sm:h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 5, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPrecio" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#E8325A" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#E8325A" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis dataKey="anio" stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} />
          <YAxis
            tickFormatter={(value) => `$${value / 1000}k`}
            stroke="#4b5563"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            domain={["dataMin - 200", "dataMax + 200"]}
            width={40}
          />
          <Tooltip
            formatter={(value, _name, props) => {
              const item = props.payload;
              return [
                <div key="tooltip" className="text-center">
                  <div className="font-bold text-lg text-white">USD {value.toLocaleString()}/m²</div>
                  {item.variacion && <div className="text-green-400 font-medium">+{item.variacion}% vs año anterior</div>}
                  <div className="text-xs text-gray-400 mt-1">{item.contexto}</div>
                  <div className="text-xs text-gray-500 mt-2 border-t border-gray-700 pt-2">{item.fuente}</div>
                </div>,
                "Precio",
              ];
            }}
            contentStyle={{ borderRadius: "12px", border: "1px solid #1f2937", background: "#111118", boxShadow: "0 4px 24px rgba(0,0,0,0.5)", padding: "12px" }}
          />
          <Area type="monotone" dataKey="precio" stroke="#E8325A" strokeWidth={3} fillOpacity={1} fill="url(#colorPrecio)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
