# Suhail Doshi — Event-Based Analytics

## Datos personales
- **Nombre:** Suhail Doshi
- **Cargo:** Fundador (ex-CEO)
- **Empresa:** Mixpanel (fundada 2009)
- **Ciudad:** San Francisco, California, EE.UU.

## Carrera resumida
- **Mixpanel (2009):** Inventó el concepto de "event-based analytics" — cada acción del usuario es un evento trackeable
- **Revolución analítica:** Antes de Mixpanel, analytics = page views. Después: cada click, cada acción, cada interacción es un dato
- **Funnels y retention:** Popularizó el análisis de embudos de conversión y curvas de retención
- **Playground (2024):** Fundó nueva startup de IA para crear apps por voz

## Qué conocimiento absorbemos
- **Events, not pages:** Trackear acciones (alimentar, mimar, jugar, alarma) no solo visitas
- **Funnels:** Registro → onboarding → primer check-in → racha 7 días → premium
- **Retention curves:** D1/D7/D30 — ¿qué % de usuarios vuelve?
- **User profiles:** Cada usuario tiene una timeline de eventos completa

## Cómo aplica a nuestro dashboard
- **Modelo de eventos:** Cada check-in ya es un evento en dok_check_ins con action type
- **Funnel en Usuarios:** Visualizar: registrados → activos D1 → activos D7 → activos D30
- **Retención:** Calcular D1/D7/D30 desde dok_check_ins agrupados por fecha de registro
- **Timeline de usuario:** En el detalle de cada usuario, mostrar su timeline completa de eventos
