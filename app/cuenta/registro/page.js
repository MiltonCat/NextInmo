"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import GoogleSignIn from "@/components/GoogleSignIn";
import { registerBuyerAccount } from "../actions";

// Solo se listan beneficios que YA funcionan. "Tasaciones guardadas" y
// "Alertas que vos controlás" estaban acá antes de existir: la tabla
// `saved_valuations` no la escribe nadie y `saved_searches` no existe en el
// proyecto. Prometer lo que no se entrega es lo que vació "Compartí tu barrio".
// Cuando esas piezas estén construidas, se agregan de nuevo.
const BENEFITS = [
  {
    title: "Favoritos en todos tus dispositivos",
    description: "Guardá propiedades y recuperalas cuando vuelvas, sin depender de un solo navegador.",
  },
  {
    title: "No perdés lo que ya guardaste",
    description: "Al entrar por primera vez, los favoritos de este dispositivo se suman a tu cuenta.",
  },
  {
    title: "Sin contraseña",
    description: "Entrás con un código que te llega por correo. No hay nada que recordar ni que se filtre.",
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
            La cuenta de comprador guarda tus favoritos y los mantiene sincronizados entre la compu y el celular. No da acceso a publicaciones de propietarios ni a analíticas internas.
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

        {/* No hay pantalla de éxito acá: `registerBuyerAccount` redirige a
            /cuenta/codigo/. El estado solo transporta errores. */}
        <section className="p-7 md:p-10 lg:p-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-rose-600">Crear cuenta</p>
          <h2 className="mt-2 text-2xl font-bold text-gray-900">Empezá como comprador</h2>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            Ingresá tu correo y te enviamos un código para confirmar la cuenta. El alta inicial siempre será de comprador.
          </p>

          {/* Con Google no hay código, ni espera, ni casilla: es el camino más
              corto para crear la cuenta. El alta por correo queda para quien no
              tenga Gmail. */}
          <div className="mt-7">
            <GoogleSignIn label="Registrarme con Google" />
          </div>

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-gray-200" />
            <span className="text-xs font-medium uppercase tracking-wider text-gray-400">o con tu correo</span>
            <span className="h-px flex-1 bg-gray-200" />
          </div>

          <form action={action} className="space-y-5">
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
        </section>
      </div>
    </main>
  );
}
