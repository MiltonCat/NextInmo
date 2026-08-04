"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { registerBuyerAccount } from "../actions";

const BENEFITS = [
  {
    title: "Favoritos en todos tus dispositivos",
    description: "Guardá propiedades y recuperalas cuando vuelvas, sin depender de un solo navegador.",
  },
  {
    title: "Tasaciones guardadas",
    description: "Conservá tus solicitudes y resultados para seguirlos desde un único lugar.",
  },
  {
    title: "Alertas que vos controlás",
    description: "Elegí si querés recibir novedades de propiedades que coincidan con tu búsqueda.",
  },
];

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="h-5 w-5 fill-current">
      <path fillRule="evenodd" d="M16.704 5.29a1 1 0 010 1.415l-7.5 7.5a1 1 0 01-1.415 0l-3.5-3.5a1 1 0 011.415-1.414l2.793 2.793 6.793-6.794a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );
}

export default function BuyerRegistrationPage() {
  const [state, action, pending] = useActionState(registerBuyerAccount, undefined);
  // Momento en que se pintó el formulario. El servidor lo usa para descartar
  // envíos instantáneos, que nunca son de una persona tipeando.
  const [renderedAt] = useState(() => Date.now());

  return (
    <main className="min-h-[75vh] bg-gradient-to-b from-rose-50/70 to-white px-4 py-10 md:py-16">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-gray-100 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="bg-gray-950 p-7 text-white md:p-10 lg:p-12">
          <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-rose-200">
            Cuenta de comprador
          </span>
          <h1 className="mt-5 text-3xl font-black leading-tight md:text-4xl">
            Tu búsqueda, guardada en un solo lugar
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-6 text-gray-300 md:text-base">
            La cuenta de comprador estará pensada para organizar favoritos, tasaciones y alertas. No da acceso a publicaciones de propietarios ni a analíticas internas.
          </p>

          <div className="mt-8 space-y-5">
            {BENEFITS.map((benefit) => (
              <div key={benefit.title} className="flex gap-3">
                <span className="mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-full bg-rose-500/20 text-rose-300">
                  <CheckIcon />
                </span>
                <div>
                  <h2 className="font-semibold text-white">{benefit.title}</h2>
                  <p className="mt-1 text-sm leading-5 text-gray-400">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="p-7 md:p-10 lg:p-12">
          {state?.success ? (
            <div role="status" className="flex min-h-full flex-col justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckIcon />
              </div>
              <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-emerald-600">Enlace enviado</p>
              <h2 className="mt-2 text-2xl font-bold text-gray-900">Revisá tu correo</h2>
              <p className="mt-3 text-sm leading-6 text-gray-600">
                Te enviamos un enlace seguro para confirmar el correo e ingresar a tu cuenta. No necesitás crear ni recordar una contraseña.
              </p>
              <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                El enlace vence y solo puede usarse una vez. Si no aparece, revisá la carpeta de correo no deseado.
              </div>
              <Link href="/cuenta/login" className="mt-4 text-center text-sm font-medium text-rose-600 hover:text-rose-500">
                Ya tengo una cuenta
              </Link>
            </div>
          ) : (
            <>
              <p className="text-xs font-semibold uppercase tracking-widest text-rose-600">Crear cuenta</p>
              <h2 className="mt-2 text-2xl font-bold text-gray-900">Empezá como comprador</h2>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                Ingresá tu correo y te enviaremos un enlace seguro para confirmar la cuenta. El alta inicial siempre será de comprador.
              </p>

              <form action={action} className="mt-7 space-y-5">
                {/*
                  Defensas invisibles. No hay captcha: el campo "empresa" está
                  oculto y solo lo completa un bot, y "ts" delata los envíos
                  automáticos instantáneos. Una persona nunca los percibe.
                */}
                <div aria-hidden="true" className="absolute h-0 w-0 overflow-hidden opacity-0">
                  <label htmlFor="buyer-empresa">No completar este campo</label>
                  <input id="buyer-empresa" name="empresa" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
                </div>
                <input type="hidden" name="ts" value={renderedAt} readOnly />

                <div>
                  <label htmlFor="buyer-email" className="mb-1.5 block text-sm font-medium text-gray-700">Correo electrónico</label>
                  <input id="buyer-email" name="email" type="email" autoComplete="email" required placeholder="nombre@correo.com" className="w-full rounded-xl border border-gray-300 px-3.5 py-3 text-gray-900 outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-100" />
                </div>

                {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

                <button type="submit" disabled={pending} className="w-full rounded-xl bg-rose-600 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:ring-offset-2 disabled:opacity-60">
                  {pending ? "Enviando…" : "Crear cuenta de comprador"}
                </button>
              </form>

              <div className="mt-5 rounded-xl bg-gray-50 p-4 text-xs leading-5 text-gray-500">
                Nunca solicitamos un rol desde este formulario. Los permisos se asignan exclusivamente en el servidor y la cuenta comienza como comprador.
              </div>

              <p className="mt-6 text-center text-sm text-gray-500">
                ¿Ya tenés acceso?{" "}
                <Link href="/cuenta/login" className="font-semibold text-rose-600 hover:text-rose-500">Ingresar</Link>
              </p>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
