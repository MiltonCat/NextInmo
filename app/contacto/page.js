"use client";
import { useState } from "react";
import emailjs from "@emailjs/browser";
import { WA_URL, CONTACT_EMAIL, PHONE_DISPLAY, LOCATION_DISPLAY, BUSINESS_HOURS } from "@/config";

const INITIAL = { name: "", email: "", phone: "", monto: "", objetivo: "", plazo: "", message: "", website: "" };

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_REGEX = /^[+\d\s()-]{6,}$/;

function validate(data) {
  const errs = {};
  if (!data.name.trim()) errs.name = "El nombre es requerido";
  else if (data.name.trim().length < 2) errs.name = "Ingresá un nombre válido";

  const email = data.email.trim();
  if (!email) errs.email = "El email es requerido";
  else if (email.length > 254 || !EMAIL_REGEX.test(email)) errs.email = "Ingresá un email válido";

  const phone = data.phone.trim();
  if (phone && !PHONE_REGEX.test(phone)) errs.phone = "Ingresá un teléfono válido";

  if (!data.message.trim()) errs.message = "El mensaje es requerido";
  else if (data.message.trim().length < 10) errs.message = "El mensaje debe tener al menos 10 caracteres";
  return errs;
}

const gridStyle = {
  backgroundImage: `
    linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)
  `,
  backgroundSize: "48px 48px",
};

export default function ContactPage() {
  const [formData, setFormData] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.website) return;
    const errs = validate(formData);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setStatus("sending");

    try {
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
        {
          from_name: formData.name,
          from_email: formData.email,
          phone: formData.phone || "No proporcionado",
          monto: formData.monto || "No indicado",
          objetivo: formData.objetivo || "No indicado",
          plazo: formData.plazo || "No indicado",
          message: formData.message,
        },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
      );
      setStatus("success");
      setFormData(INITIAL);
      setErrors({});
    } catch (err) {
      console.error("EmailJS error:", err);
      setStatus("error");
    }
  };

  const fieldClass = (name) =>
    `w-full border rounded-xl px-4 py-2.5 outline-none transition focus:ring-2 bg-white text-[#222222] placeholder-[#717171] text-sm ${
      errors[name]
        ? "border-red-300 focus:ring-red-100"
        : "border-gray-200 focus:ring-primary-100 focus:border-primary-400"
    }`;

  return (
    <div className="min-h-screen bg-white" style={gridStyle}>
      <section className="relative overflow-hidden pt-24 pb-16 bg-transparent">
        <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-transparent to-white/80 pointer-events-none" />

        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary-500/30 bg-primary-500/10 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
            <span className="text-primary-500 text-xs font-semibold tracking-widest uppercase">Contacto</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-[#222222] mb-4 font-jakarta">
            Hablemos de tu inversión
          </h1>
          <p className="text-[#484848] text-base max-w-xl mx-auto">
            Completá el formulario y me contacto en menos de 48 horas con una propuesta personalizada.
          </p>
        </div>
      </section>

      <section className="py-16 bg-transparent border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

            {/* Columna izquierda */}
            <div>
              <p className="text-primary-500 text-xs font-semibold tracking-widest uppercase mb-3">Información</p>
              <h2 className="text-2xl font-bold text-[#222222] font-jakarta mb-3">
                Estoy para ayudarte
              </h2>
              <p className="text-[#717171] text-sm mb-8 leading-relaxed">
                ¿Tenés alguna pregunta sobre mis propiedades o necesitás asesoramiento?
                Escribime y me contacto a la brevedad.
              </p>

              <div className="space-y-5 mb-10">
                {[
                  {
                    icon: (
                      <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    ),
                    label: "Ubicación",
                    value: LOCATION_DISPLAY,
                  },
                  {
                    icon: (
                      <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    ),
                    label: "WhatsApp",
                    value: PHONE_DISPLAY,
                    href: WA_URL,
                  },
                  {
                    icon: (
                      <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    ),
                    label: "Email",
                    value: CONTACT_EMAIL,
                    href: `mailto:${CONTACT_EMAIL}`,
                  },
                  {
                    icon: (
                      <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ),
                    label: "Horario de atención",
                    value: BUSINESS_HOURS,
                  },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center flex-shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-[#222222] text-sm">{item.label}</p>
                      {item.href ? (
                        <a href={item.href} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-500 text-sm transition">
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-[#717171] text-sm">{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bloque de confianza */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4">
                <p className="text-xs font-semibold text-[#717171] uppercase tracking-widest">Por qué trabajar conmigo</p>
                {[
                  { valor: "600+", texto: "propiedades relevadas como base de análisis" },
                  { valor: "10+", texto: "años en el mercado inmobiliario de la Patagonia" },
                  { valor: "<48h", texto: "tiempo de respuesta garantizado" },
                ].map((item) => (
                  <div key={item.valor} className="flex items-center gap-4">
                    <span className="text-xl font-bold text-primary-500 w-14 flex-shrink-0">{item.valor}</span>
                    <p className="text-[#484848] text-sm leading-snug">{item.texto}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Columna derecha — formulario */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
              {status === "success" && (
                <div className="mb-5 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
                  <span className="text-green-500 text-xl">✓</span>
                  <div>
                    <p className="font-semibold text-green-800 text-sm">¡Mensaje enviado!</p>
                    <p className="text-green-700 text-xs mt-0.5">
                      Te respondo a la brevedad en tu email o por WhatsApp.
                    </p>
                  </div>
                </div>
              )}

              {status === "error" && (
                <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                  <span className="text-red-500 text-xl">✕</span>
                  <div>
                    <p className="font-semibold text-red-800 text-sm">Hubo un error al enviar</p>
                    <p className="text-red-700 text-xs mt-0.5">
                      Escribime directamente a{" "}
                      <a href={`mailto:${CONTACT_EMAIL}`} className="underline">{CONTACT_EMAIL}</a>{" "}
                      o por{" "}
                      <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="underline">WhatsApp</a>.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                {/* Honeypot — invisible para humanos, los bots lo completan */}
                <div style={{ position: "absolute", left: "-9999px", opacity: 0, pointerEvents: "none" }} aria-hidden="true">
                  <input
                    type="text"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#222222] mb-1">
                    Nombre completo <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={fieldClass("name")}
                    placeholder="Tu nombre"
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#222222] mb-1">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={fieldClass("email")}
                    placeholder="tu@email.com"
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#222222] mb-1">
                    Teléfono <span className="text-[#717171] text-xs">(opcional)</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={fieldClass("phone")}
                    placeholder="+54 294 ..."
                  />
                  {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-[#222222] mb-1">Monto disponible</label>
                    <select name="monto" value={formData.monto} onChange={handleChange} className={fieldClass("monto")}>
                      <option value="">Seleccioná...</option>
                      <option value="Menos de USD 50K">Menos de USD 50K</option>
                      <option value="USD 50K - 100K">USD 50K – 100K</option>
                      <option value="USD 100K - 200K">USD 100K – 200K</option>
                      <option value="USD 200K - 500K">USD 200K – 500K</option>
                      <option value="Más de USD 500K">Más de USD 500K</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#222222] mb-1">Objetivo</label>
                    <select name="objetivo" value={formData.objetivo} onChange={handleChange} className={fieldClass("objetivo")}>
                      <option value="">Seleccioná...</option>
                      <option value="Renta mensual">Renta mensual</option>
                      <option value="Reventa">Reventa</option>
                      <option value="Diversificación">Diversificación</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#222222] mb-1">Plazo estimado</label>
                    <select name="plazo" value={formData.plazo} onChange={handleChange} className={fieldClass("plazo")}>
                      <option value="">Seleccioná...</option>
                      <option value="Menos de 1 año">Menos de 1 año</option>
                      <option value="1 a 3 años">1 a 3 años</option>
                      <option value="3 a 5 años">3 a 5 años</option>
                      <option value="Más de 5 años">Más de 5 años</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#222222] mb-1">
                    Mensaje <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="4"
                    className={fieldClass("message")}
                    placeholder="Contame tu objetivo, presupuesto o la propiedad que te interesa..."
                  />
                  {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 text-sm"
                >
                  {status === "sending" ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Enviando...
                    </>
                  ) : (
                    "Enviar mensaje"
                  )}
                </button>

                <div className="flex items-center gap-3 mt-1">
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-[#717171] text-xs">o</span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>

                <a
                  href={WA_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 border border-gray-200 hover:border-primary-300 text-[#484848] hover:text-primary-600 py-3 rounded-xl font-medium transition-all duration-200 text-sm"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Escribime por WhatsApp
                </a>

                <p className="text-xs text-center text-[#717171]">
                  Me contacto en menos de 48 horas con una propuesta personalizada.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
