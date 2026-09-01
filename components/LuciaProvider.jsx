"use client";

import { createContext, useContext, useRef, useState } from "react";

const LuciaContext = createContext(null);

export default function LuciaProvider({ children }) {
  const nextId = useRef(0);
  const [command, setCommand] = useState(null);

  const openLucia = ({ question = "", autoSubmit = false, source = "internal" } = {}) => {
    nextId.current += 1;
    setCommand({
      id: nextId.current,
      question: String(question).trim().slice(0, 300),
      autoSubmit,
      source,
    });
  };

  return <LuciaContext.Provider value={{ command, openLucia }}>{children}</LuciaContext.Provider>;
}

export function useLucia() {
  const value = useContext(LuciaContext);
  if (!value) throw new Error("useLucia debe usarse dentro de LuciaProvider");
  return value;
}
