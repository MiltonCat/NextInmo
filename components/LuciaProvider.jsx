"use client";

import { createContext, useContext, useRef, useState } from "react";

const LuciaContext = createContext(null);

export default function LuciaProvider({ children }) {
  const nextId = useRef(0);
  const [command, setCommand] = useState(null);

  // `tasacion` es el resultado que la persona acaba de recibir en el tasador. No
  // viaja dentro de la pregunta porque no es texto: es el dato con el que el
  // servidor arma el contexto, y el servidor lo revalida entero igual.
  const openLucia = ({ question = "", autoSubmit = false, source = "internal", tasacion = null } = {}) => {
    nextId.current += 1;
    setCommand({
      id: nextId.current,
      question: String(question).trim().slice(0, 300),
      autoSubmit,
      source,
      tasacion,
    });
  };

  return <LuciaContext.Provider value={{ command, openLucia }}>{children}</LuciaContext.Provider>;
}

export function useLucia() {
  const value = useContext(LuciaContext);
  if (!value) throw new Error("useLucia debe usarse dentro de LuciaProvider");
  return value;
}
