# Limpieza BBDD v3 — Dame un OK

**Fecha:** 2025-07-17
**Ejecutado por:** Leo (subagent DBA)

## Datos eliminados

| Tabla | Filas borradas |
|---|---|
| dok_users | 9 |
| dok_familiares | 5 |
| dok_check_ins | 9 |
| dok_invitations | 11 |
| dok_alertas | 0 |
| dok_subscriptions | 0 |
| dok_payment_events | 0 |
| dok_push_subscriptions | 0 |
| dok_schedules | 0 |

**Total filas eliminadas: 34**

## Preservado

- ✅ Estructura de tablas intacta
- ✅ RLS policies intactas
- ✅ `dok_admin_invitations`: KIKE2026 y ANGEL2026 mantenidos y reseteados (`used=false`)

## Estado final

Todas las tablas a **0 filas**. Base de datos lista para empezar de cero.
