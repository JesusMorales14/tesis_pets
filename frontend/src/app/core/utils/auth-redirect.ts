import { Router } from '@angular/router';

interface AuthNavigationState {
  returnTo?: string;
  returnState?: Record<string, unknown>;
}

/**
 * Tras iniciar sesión o registrarse: vuelve a la pantalla que pidió el
 * login (p. ej. la reserva) o, si no hay ninguna, a la vista principal de
 * cada rol (el veterinario a su panel, el dueño al inicio).
 */
export function navigateAfterAuth(router: Router, isAdmin: boolean): Promise<boolean> {
  const state = (history.state ?? {}) as AuthNavigationState;
  const returnTo = state.returnTo || (isAdmin ? '/admin' : '/tabs/tab1');
  return router.navigate([returnTo], state.returnState ? { state: state.returnState } : {});
}
