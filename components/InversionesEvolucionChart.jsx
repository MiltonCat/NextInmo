"use client";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

// `alto` existe porque este gráfico lo comparten /inversiones y /precio-m2, y
// no necesitan la misma altura. En /precio-m2 la curva es el contenido central
// de la página; en /inversiones es un dato más dentro de una sección con
// pestañas, un pie de cifras y una nota, y a 288 px empujaba todo eso fuera de
// pantalla. El default deja /precio-m2 exactamente como estaba.
//
// `variante="tira"` es el modo sparkline: sin ejes, sin grilla y sin tooltip,
// solo la curva. No es el mismo gráfico más chico —es otra cosa—. Un gráfico
// con ejes le pide a la persona que saque su propia conclusión; la tira
// acompaña a una conclusión que ya está escrita arriba en grande ("+57,7 % en
// 5 años"). Por eso no lleva controles: no hay nada que explorar, y unos ejes
// ilegibles a 140 px de alto serían peores que no tenerlos.
//
// Va con `aria-hidden`: todo lo que dice la tira ya está en el texto que la
// rodea, así que para un lector de pantalla es ruido.
export default function InversionesEvolucionChart({ data, alto = "h-48 sm:h-72", variante = "completo" }) {
  const esTira = variante === "tira";

  // El id del degradado no puede repetirse en el documento: en /inversiones
  // conviven la tira y el gráfico completo (dentro del desplegable), y dos
  // `<linearGradient>` con el mismo id hacen que el segundo se ignore.
  const gradId = `colorPrecio-${variante}`;

  return (
    <div className={`${alto} w-full`} aria-hidden={esTira ? "true" : undefined}>
      <ResponsiveContainer width="100%" height="100%" minHeight={esTira ? 96 : 176} minWidth={0}>
        <AreaChart
          data={data}
          margin={esTira ? { top: 4, right: 0, left: 0, bottom: 0 } : { top: 10, right: 5, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#E8325A" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#E8325A" stopOpacity={0} />
            </linearGradient>
          </defs>
          {!esTira && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
          {!esTira && (
            <XAxis dataKey="anio" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
          )}
          {/* En modo tira el eje Y sigue existiendo pero oculto: sin él,
              recharts encuadra la curva contra el borde y se pierde la forma,
              que es lo único que la tira tiene para mostrar. */}
          <YAxis
            tickFormatter={(value) => `$${value / 1000}k`}
            stroke="#9ca3af"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            domain={["dataMin - 200", "dataMax + 200"]}
            width={esTira ? 0 : 40}
            hide={esTira}
          />
          {!esTira && (
          <Tooltip
            formatter={(value, _name, props) => {
              const item = props.payload;
              return [
                <div key="tooltip" className="text-center">
                  <div className="text-lg font-semibold text-gray-900">USD {value.toLocaleString()}/m²</div>
                  {item.variacion && <div className="font-medium text-emerald-600">+{item.variacion}% vs año anterior</div>}
                  <div className="mt-1 text-xs text-gray-500">{item.contexto}</div>
                  <div className="mt-2 border-t border-gray-100 pt-2 text-xs text-gray-400">{item.fuente}</div>
                </div>,
                "Precio",
              ];
            }}
            /* Tooltip claro: este componente lo usan /inversiones y /precio-m2,
               y las dos son de fondo blanco desde 2026-08-09. */
            contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", background: "#ffffff", boxShadow: "0 4px 24px rgba(0,0,0,0.10)", padding: "12px" }}
          />
          )}
          <Area
            type="monotone"
            dataKey="precio"
            stroke="#E8325A"
            strokeWidth={esTira ? 2.5 : 3}
            fillOpacity={1}
            fill={`url(#${gradId})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
