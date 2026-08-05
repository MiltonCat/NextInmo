import LoginForm from "./LoginForm";

// Server Component: solo lee el parámetro de la URL y se lo pasa al formulario.
// El aviso de "enlace vencido" tiene que existir en el HTML inicial, así que no
// puede depender de useSearchParams en el cliente.
export default async function AccountLoginPage({ searchParams }) {
  const params = await searchParams;
  return <LoginForm authFailed={params?.auth_error === "1"} />;
}
