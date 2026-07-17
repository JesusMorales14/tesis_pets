export const APP_BREAKPOINTS = {
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
} as const;

// Media queries para @angular/cdk BreakpointObserver, alineadas a los
// tokens nativos de Ionic (sm/md/lg/xl) para que ion-split-pane y la lógica
// de la app cambien de layout en el mismo punto de quiebre.
export const BP_QUERIES = {
  handset: `(max-width: ${APP_BREAKPOINTS.md - 1}px)`,
  tablet: `(min-width: ${APP_BREAKPOINTS.md}px) and (max-width: ${APP_BREAKPOINTS.lg - 1}px)`,
  desktop: `(min-width: ${APP_BREAKPOINTS.lg}px)`,
  wide: `(min-width: ${APP_BREAKPOINTS.xl}px)`,
} as const;
