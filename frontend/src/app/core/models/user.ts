/** Usuario autenticado y respuesta de /auth/login y /auth/register. */

export type UserRole = 'user' | 'admin';

export interface User {
  id: number;
  nombre: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
  user: User;
}
