import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Ignorar scripts
    "scripts/**",
  ]),
  {
    rules: {
      // Bajar a warning — no son bugs críticos
      "react/no-unescaped-entities": "warn",
      "@next/next/no-html-link-for-pages": "warn",
      "@next/next/no-img-element": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
  // Los tests end-to-end no son React: corren en Playwright. Su forma de
  // entregarle al test la página ya preparada es una función que por
  // convención se llama `use()`, y la regla de hooks la confunde con el `use`
  // de React y pide que el archivo sea un componente. No lo es. El resto del
  // lint (variables sin usar, imports rotos) sigue corriendo acá.
  {
    files: ["e2e/**/*.js", "playwright.config.mjs"],
    rules: {
      "react-hooks/rules-of-hooks": "off",
    },
  },
]);

export default eslintConfig;
