// Allowlist del unico usuario autorizado para operar el panel administrativo.
// La variable es privada del servidor: nunca debe usar el prefijo NEXT_PUBLIC_.
export function isAdminUserId(userId) {
  const adminUserId = process.env.ADMIN_USER_ID?.trim();
  return Boolean(adminUserId && userId && userId === adminUserId);
}

export function isAdminUser(user) {
  return isAdminUserId(user?.id);
}
