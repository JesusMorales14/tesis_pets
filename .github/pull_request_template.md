## ¿Qué cambia?

<!-- Resumen breve del cambio y por qué es necesario. -->

## ¿Cómo se probó?

- [ ] Tests del backend (`pytest`) y del frontend (`npm run test:ci`) en verde
- [ ] `ruff check` / `ruff format --check` y `npm run lint` sin errores
- [ ] Probado manualmente en móvil y escritorio (si cambia la interfaz)

## Checklist de calidad

- [ ] Sin `console.log`, `print()` ni código comentado
- [ ] Componentes nuevos con `ChangeDetectionStrategy.OnPush` y archivos < 250 líneas
- [ ] Textos accesibles: `label` asociado, `aria-label` en botones de solo icono
- [ ] Sin secretos en el código (usar `.env` / GitHub Secrets)
- [ ] Quality Gate de SonarQube aprobado
