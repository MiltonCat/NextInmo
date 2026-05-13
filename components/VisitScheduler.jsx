"use client";
import { useState, useMemo } from "react";
import { WA_NUMBER } from "@/config";

const TIME_SLOTS = ["9:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];
const DAYS_HEADER = ["D", "L", "M", "M", "J", "V", "S"];
const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

function getCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  return days;
}

function formatDateLong(date) {
  return date.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

export default function VisitScheduler({ property, onClose }) {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [step, setStep] = useState(1);
  const [calYear, setCalYear] = useState(tomorrow.getFullYear());
  const [calMonth, setCalMonth] = useState(tomorrow.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [error, setError] = useState("");

  const calDays = useMemo(() => getCalendarDays(calYear, calMonth), [calYear, calMonth]);

  const isDisabled = (day) => {
    if (!day) return true;
    const d = new Date(calYear, calMonth, day);
    if (d < tomorrow) return true;
    if (d.getDay() === 0) return true;
    return false;
  };

  const isSelected = (day) => {
    if (!day || !selectedDate) return false;
    return selectedDate.getFullYear() === calYear &&
      selectedDate.getMonth() === calMonth &&
      selectedDate.getDate() === day;
  };

  const isToday = (day) => {
    if (!day) return false;
    return new Date(calYear, calMonth, day).toDateString() === today.toDateString();
  };

  const canGoPrev = calYear > tomorrow.getFullYear() || calMonth > tomorrow.getMonth();

  const prevMonth = () => {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
    else setCalMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
    else setCalMonth(m => m + 1);
  };

  const set = (field) => (e) => { setForm(f => ({ ...f, [field]: e.target.value })); setError(""); };

  const next = () => {
    if (step === 1 && !selectedDate) { setError("Elegí un día para continuar."); return; }
    if (step === 2 && !selectedTime) { setError("Seleccioná un horario para continuar."); return; }
    if (step === 3 && (!form.name.trim() || !form.phone.trim())) { setError("Nombre y teléfono son obligatorios."); return; }
    setError("");
    setStep(s => s + 1);
  };

  const handleSend = () => {
    let msg = `Hola, quiero agendar una visita.\n\n`;
    msg += `Propiedad: ${property.title}\n`;
    msg += `Ubicación: ${property.location}\n`;
    msg += `Día elegido: ${formatDateLong(selectedDate)}\n`;
    msg += `Horario elegido: ${selectedTime} hs\n\n`;
    msg += `Nombre: ${form.name}\n`;
    msg += `Teléfono: ${form.phone}\n`;
    if (form.email.trim()) msg += `Email: ${form.email}\n`;
    if (form.message.trim()) msg += `\nMensaje:\n${form.message}`;
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <div
        className="relative bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col"
        style={{ maxHeight: "92vh" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Progress bar */}
        <div className="h-px bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gray-900 transition-all duration-500 ease-out"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            {step > 1 && (
              <button
                onClick={() => { setStep(s => s - 1); setError(""); }}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition text-gray-400 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <span className="text-[11px] font-semibold text-gray-300 tracking-widest uppercase">
              {step === 1 ? "Día" : step === 2 ? "Horario" : step === 3 ? "Tus datos" : "Confirmación"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition text-gray-400 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-6 pb-2">

          {/* STEP 1 — Día */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Elegí el día</h2>
              <p className="text-sm text-gray-400 mb-6">Seleccioná cuándo te gustaría visitar esta propiedad.</p>

              <div className="flex items-center justify-between mb-5">
                <button
                  onClick={prevMonth}
                  disabled={!canGoPrev}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition disabled:opacity-20 disabled:cursor-not-allowed"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="text-sm font-semibold text-gray-800">{MONTHS[calMonth]} {calYear}</span>
                <button
                  onClick={nextMonth}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-7 mb-2">
                {DAYS_HEADER.map((d, i) => (
                  <div key={i} className={`text-center text-[11px] font-semibold py-1 ${i === 0 ? "text-gray-200" : "text-gray-300"}`}>
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-y-1">
                {calDays.map((day, i) => (
                  <button
                    key={i}
                    onClick={() => !isDisabled(day) && (setSelectedDate(new Date(calYear, calMonth, day)), setError(""))}
                    disabled={isDisabled(day)}
                    className={`
                      mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm transition
                      ${!day ? "invisible pointer-events-none" : ""}
                      ${isDisabled(day) ? "text-gray-200 cursor-not-allowed" : "hover:bg-gray-100 cursor-pointer"}
                      ${isSelected(day) ? "!bg-gray-900 !text-white font-semibold" : ""}
                      ${isToday(day) && !isSelected(day) ? "font-bold text-rose-400" : "text-gray-700"}
                    `}
                  >
                    {day}
                  </button>
                ))}
              </div>

              {selectedDate ? (
                <p className="text-xs text-center text-gray-500 mt-4 font-medium capitalize">
                  {formatDateLong(selectedDate)}
                </p>
              ) : (
                <p className="text-xs text-center text-gray-300 mt-4">Lun – Sáb · Domingos no disponibles</p>
              )}
            </div>
          )}

          {/* STEP 2 — Horario */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Elegí el horario</h2>
              <p className="text-sm text-gray-400 mb-6">Seleccioná el horario que mejor se adapte a vos.</p>
              <div className="grid grid-cols-3 gap-2.5">
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => { setSelectedTime(slot); setError(""); }}
                    className={`py-3.5 rounded-xl text-sm font-semibold border transition ${
                      selectedTime === slot
                        ? "bg-gray-900 text-white border-gray-900"
                        : "border-gray-150 text-gray-600 hover:border-gray-300 hover:text-gray-900 bg-gray-50"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3 — Datos */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Tus datos</h2>
              <p className="text-sm text-gray-400 mb-8">Te confirmamos la visita por WhatsApp.</p>
              <div className="space-y-6">
                {[
                  { label: "Nombre", field: "name", type: "text", placeholder: "Juan García", required: true },
                  { label: "Teléfono", field: "phone", type: "tel", placeholder: "+54 9 2944 000000", required: true },
                  { label: "Email", field: "email", type: "email", placeholder: "tucorreo@email.com", required: false },
                ].map(({ label, field, type, placeholder, required }) => (
                  <div key={field}>
                    <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
                      {label}{!required && <span className="ml-1 font-normal normal-case text-gray-300">· opcional</span>}
                    </label>
                    <input
                      type={type}
                      value={form[field]}
                      onChange={set(field)}
                      placeholder={placeholder}
                      className="w-full border-b border-gray-200 pb-2.5 text-sm text-gray-900 placeholder-gray-300 outline-none focus:border-gray-900 transition bg-transparent"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
                    Mensaje <span className="ml-1 font-normal normal-case text-gray-300">· opcional</span>
                  </label>
                  <textarea
                    value={form.message}
                    onChange={set("message")}
                    placeholder="¿Alguna consulta adicional?"
                    rows={2}
                    className="w-full border-b border-gray-200 pb-2.5 text-sm text-gray-900 placeholder-gray-300 outline-none focus:border-gray-900 transition bg-transparent resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4 — Confirmación */}
          {step === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Confirmá tu visita</h2>
              <p className="text-sm text-gray-400 mb-6">Revisá los datos antes de enviar.</p>

              <div className="space-y-0 mb-8">
                {[
                  { label: "Propiedad", value: property.title },
                  { label: "Día", value: formatDateLong(selectedDate) },
                  { label: "Horario", value: `${selectedTime} hs` },
                  { label: "Nombre", value: form.name },
                  { label: "Teléfono", value: form.phone },
                  ...(form.email ? [{ label: "Email", value: form.email }] : []),
                  ...(form.message ? [{ label: "Mensaje", value: form.message }] : []),
                ].map(({ label, value }) => (
                  <div key={label} className="flex gap-4 py-3.5 border-b border-gray-50 last:border-0">
                    <span className="text-[11px] font-semibold text-gray-300 uppercase tracking-widest w-20 shrink-0 pt-0.5">{label}</span>
                    <span className="text-sm text-gray-800 capitalize leading-relaxed">{value}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleSend}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-4 rounded-xl transition flex items-center justify-center gap-2.5 text-sm tracking-wide"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.554 4.118 1.528 5.855L.057 23.885l6.194-1.624A11.93 11.93 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.894a9.866 9.866 0 01-5.031-1.378l-.361-.214-3.741.981.999-3.648-.235-.374A9.861 9.861 0 012.106 12C2.106 6.58 6.58 2.106 12 2.106S21.894 6.58 21.894 12 17.42 21.894 12 21.894z" />
                </svg>
                Enviar solicitud por WhatsApp
              </button>
            </div>
          )}

          {error && <p className="text-xs text-rose-400 mt-4">{error}</p>}
        </div>

        {/* Footer — steps 1-3 */}
        {step < 4 && (
          <div className="px-6 py-5">
            <button
              onClick={next}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-4 rounded-xl transition text-sm tracking-wide"
            >
              Continuar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
