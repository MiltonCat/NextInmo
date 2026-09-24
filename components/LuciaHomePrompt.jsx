"use client";

import { useState } from "react";
import Image from "next/image";
import { useLucia } from "@/components/LuciaProvider";
import { useAnalytics } from "@/hooks/useAnalytics";

export default function LuciaHomePrompt() {
  const [question, setQuestion] = useState("");
  const { openLucia } = useLucia();
  const { trackEvent } = useAnalytics();

  const ask = (text, source, autoSubmit = true) => {
    const value = text.trim();
    if (!value) return;
    trackEvent("lucia_home_start", { source, question_length: value.length });
    openLucia({ question: value, autoSubmit, source: `home_${source}` });
    setQuestion("");
  };

  return (
    <section className="border-b border-slate-100 bg-white" aria-labelledby="lucia-home-title">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:gap-6 lg:px-8">
        <div className="flex shrink-0 items-center gap-3 lg:w-[21rem]">
          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full ring-1 ring-slate-200">
            <Image src="/lucia-avatar-v2.webp" alt="Lucía" width={44} height={44} className="h-full w-full object-cover" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-rose-600">Lucía</p>
            <h2 id="lucia-home-title" className="mt-0.5 text-base font-bold leading-tight text-slate-900">
              ¿Qué necesitás saber?
            </h2>
          </div>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            ask(question, "question");
          }}
          className="flex min-w-0 flex-1 gap-2"
        >
          <label htmlFor="lucia-home-question" className="sr-only">Pregunta para Lucía</label>
          <input
            id="lucia-home-question"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Preguntá por propiedades, barrios o precios"
            maxLength={300}
            className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-rose-300 focus:bg-white focus:ring-2 focus:ring-rose-100"
          />
          <button
            type="submit"
            disabled={!question.trim()}
            className="shrink-0 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-35"
          >
            Preguntar
          </button>
        </form>
      </div>
    </section>
  );
}
