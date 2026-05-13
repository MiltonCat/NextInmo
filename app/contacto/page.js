"use client";
import { useState } from "react";
import emailjs from "@emailjs/browser";
import { WA_URL, CONTACT_EMAIL, PHONE_DISPLAY, LOCATION_DISPLAY, BUSINESS_HOURS } from "@/config";

const INITIAL = { name: "", email: "", phone: "", monto: "", objetivo: "", plazo: "", message: "" };

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
    linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px)
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
    `w-full border rounded-xl px-4 py-2.5 outline-none transition focus:ring-2 bg-white text-gray-800 placeholder-gray-400 ${
      errors[name]
        ? "border-red-300 focus:ring-red-100"
        : "border-gray-200 focus:ring-rose-100 focus:border-rose-400"
    }`;

  return (
    <div className="min-h-screen bg-white">
      <section className="relative overflow-hidden pt-24 pb-16 bg-[#0A0F1C]" style={gridStyle}>
        <div className="absolute inset-0 bg-gradient-to-b from-rose-950/30 via-transparent to-white" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
            <span className="text-rose-400 text-xs font-semibold tracking-widest uppercase">Contacto</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 font-jakarta">
            Hablemos de tu inversión
          </h1>
          <p className="text-gray-400 text-base max-w-xl mx-auto">
            Completá el formulario y te contactamos en menos de 48 horas con una propuesta personalizada.
          </p>
        </div>
      </section>

      <section className="py-16 bg-[#F8F9FC]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <p className="text-rose-500 text-xs font-semibold tracking-widest uppercase mb-3">Información</p>
              <h2 className="text-2xl font-black text-gray-800 font-jakarta mb-3">
                Estamos aquí para ayudarte
              </h2>
              <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                ¿Tenés alguna pregunta sobre nuestras propiedades o necesitás asesoramiento?
                Escribinos y te contactamos a la brevedad.
              </p>

              <div className="space-y-5">
                {[
                  {
                    icon: (
                      <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    ),
                    label: "Ubicación",
                    value: LOCATION_DISPLAY,
                  },
                  {
                    icon: (
                      <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    ),
                    label: "WhatsApp",
                    value: PHONE_DISPLAY,
                    href: WA_URL,
                  },
                  {
                    icon: (
                      <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    ),
                    label: "Email",
                    value: CONTACT_EMAIL,
                    href: `mailto:${CONTACT_EMAIL}`,
                  },
                  {
                    icon: (
                      <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ),
                    label: "Horario de Atención",
                    value: BUSINESS_HOURS,
                  },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center flex-shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700 text-sm">{item.label}</p>
                      {item.href ? (
                        <a href={item.href} target="_blank" rel="noopener noreferrer" className="text-rose-600 hover:text-rose-500 text-sm transition">
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-gray-500 text-sm">{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
              {status === "success" && (
                <div className="mb-5 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
                  <span className="text-green-500 text-xl">✓</span>
                  <div>
                    <p className="font-semibold text-green-800 text-sm">¡Mensaje enviado!</p>
                    <p className="text-green-700 text-xs mt-0.5">
                      Te contactaremos a la brevedad en <strong>{CONTACT_EMAIL}</strong>.
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
                      Escribinos directamente a{" "}
                      <a href={`mailto:${CONTACT_EMAIL}`} className="underline">{CONTACT_EMAIL}</a>{" "}
                      o por{" "}
                      <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="underline">WhatsApp</a>.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono <span className="text-gray-400 text-xs">(opcional)</span>
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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Monto disponible</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Objetivo</label>
                    <select name="objetivo" value={formData.objetivo} onChange={handleChange} className={fieldClass("objetivo")}>
                      <option value="">Seleccioná...</option>
                      <option value="Renta mensual">Renta mensual</option>
                      <option value="Reventa">Reventa</option>
                      <option value="Diversificación">Diversificación</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Plazo estimado</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mensaje <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="4"
                    className={fieldClass("message")}
                    placeholder="¿En qué te podemos ayudar?"
                  />
                  {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="w-full bg-rose-600 hover:bg-rose-500 text-white py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 text-sm"
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
                    "Enviar Mensaje"
                  )}
                </button>

                <p className="text-xs text-center text-gray-400 mt-1">
                  Te contactamos en menos de 48 horas con una propuesta personalizada.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
