import LoginForm from "./LoginForm";

// Server Component: solo lee el parámetro de la URL y se lo pasa al formulario.
// El aviso de "enlace vencido" tiene que existir en el HTML inicial, así que no
// puede depender de useSearchParams en el cliente.
export default async function AccountLoginPage({ searchParams }) {
  const params = await searchParams;
  const motivo = params?.auth_error;

  // Cualquier valor cuenta como fallo, no solo "1": así los enlaces que ya
  // salieron con el formato viejo siguen mostrando el aviso.
  return <LoginForm authFailed={Boolean(motivo)} vencido={motivo === "vencido"} />;
}
