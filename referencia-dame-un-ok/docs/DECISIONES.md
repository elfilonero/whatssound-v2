# 📋 Registro de Decisiones — Dame un Ok

> Decisiones arquitectónicas y de producto documentadas para referencia futura.  
> Última actualización: 2 de febrero de 2026

---

## DEC-001: Mascota virtual como mecanismo de monitoreo

- **Fecha:** Diciembre 2025
- **Decisor:** Ángel Fernández
- **Contexto:** Los sistemas de monitoreo para mayores existentes (cámaras, wearables, botones de emergencia) son intrusivos y muchos mayores los rechazan por sentirse vigilados.
- **Decisión:** Usar una mascota virtual que el mayor "cuida" diariamente. Cada interacción genera un check-in silencioso que el familiar ve en su panel.
- **Consecuencia:** El mayor no percibe vigilancia, solo un juego. La familia recibe confirmación diaria. Es la base de toda la propuesta de valor.

---

## DEC-002: Nombre "Fufy" para la mascota

- **Fecha:** Enero 2026
- **Decisor:** Ángel Fernández
- **Contexto:** La mascota necesitaba un nombre entrañable, fácil de recordar y pronunciar para personas mayores.
- **Decisión:** "Fufy" — corto, simpático, universal, fácil de pronunciar en español.
- **Alternativas descartadas:** "Misi" (era el nombre original durante desarrollo), "Peluso", "Cuki".

---

## DEC-003: Sistema de alertas escalonado (1h, 3h, 6h)

- **Fecha:** Enero 2026
- **Decisor:** Ángel Fernández + Leo
- **Contexto:** Un solo nivel de alerta no distingue entre "se le olvidó" y "posible emergencia real".
- **Decisión:** Tres niveles configurables:
  - **1h sin respuesta:** Primera alerta (aviso suave)
  - **3h sin respuesta:** Escalamiento (notificación a más familiares)
  - **6h sin respuesta:** Emergencia (protocolo de acción: llamar, 112, ubicación)
- **Configurabilidad:** El familiar puede ajustar los tiempos desde 15 minutos hasta 12 horas por nivel.
- **Deduplicación:** Se verifica que no exista una alerta no resuelta del mismo nivel antes de crear una nueva.

---

## DEC-004: Modelo freemium con plan básico gratis

- **Fecha:** Enero 2026
- **Decisor:** Ángel Fernández + Kike
- **Contexto:** Para validar el producto necesitamos usuarios. Cobrar desde el inicio frena la adopción.
- **Decisión:** Plan básico gratis (1 familiar, alertas push) + Premium a 4,99€/mes (hasta 5 familiares, SMS, geolocalización).
- **Razonamiento:** El plan gratis es suficiente para validar la idea. El premium ofrece valor real para familias con múltiples mayores.

---

## DEC-005: Auth anónima de Supabase (sin registro con email)

- **Fecha:** Enero 2026
- **Decisor:** Leo
- **Contexto:** El público objetivo son personas mayores y sus familiares. Pedir email + contraseña añade fricción enorme, especialmente para el mayor.
- **Decisión:** Usar `supabase.auth.signInAnonymously()`. El acceso se controla por códigos de invitación, no por credenciales.
- **Persistencia:** `localStorage` guarda el código admin y el estado de onboarding.
- **Trade-off:** Si el mayor limpia el navegador, pierde la sesión. Aceptable para MVP.
- **Futuro:** Posibilidad de vincular email opcionalmente para recuperación de cuenta.

---

## DEC-006: Dashboard profesional separado del panel familiar

- **Fecha:** 1 de febrero de 2026
- **Decisor:** Ángel Fernández
- **Contexto:** El panel familiar es una vista mobile-first centrada en el estado del mayor. Las métricas de negocio (MRR, engagement, cohorts) necesitan una interfaz desktop diferente.
- **Decisión:** Crear `/dashboard` como sección independiente con layout propio (sidebar + header), accesible solo con código admin específico.
- **Acceso:** `/dashboard?admin=ANGEL2026`
- **Separación clara:** El familiar normal nunca ve el dashboard. Solo los admins del proyecto.

---

## DEC-007: Landing responsive con CSS `:has()` selector

- **Fecha:** 2 de febrero de 2026
- **Decisor:** Leo
- **Contexto:** La landing necesitaba ser responsive (mobile + desktop) pero el layout raíz de la app tiene un wrapper de 390px.
- **Decisión:** Usar clases responsive de Tailwind (`lg:flex-row`, `lg:grid-cols-3`) y el selector CSS `:has()` para adaptar layouts condicionalmente.
- **Resultado:** La landing se ve bien en móvil (stacked) y en desktop (lado a lado), mientras mantiene la compatibilidad con el wrapper de la app.

---

## DEC-008: React Portal para el dashboard

- **Fecha:** 1 de febrero de 2026
- **Decisor:** Leo
- **Contexto:** El layout raíz (`layout.tsx`) envuelve toda la app en un div de `maxWidth: 390px`. El dashboard necesita pantalla completa.
- **Decisión:** Usar `createPortal(content, document.body)` en `dashboard/layout.tsx` para renderizar fuera del wrapper.
- **Implementación:**
  ```tsx
  return createPortal(
    <div style={{ position: 'fixed', width: '100vw', height: '100vh', zIndex: 99999 }}>
      <AdminSidebar />
      <main>{children}</main>
    </div>,
    document.body
  );
  ```
- **Trade-off:** El portal pierde el contexto del wrapper, pero eso es exactamente lo que queríamos.

---

## DEC-009: Vercel deploy manual (automático desconectado)

- **Fecha:** Enero 2026
- **Decisor:** Leo + Kike
- **Contexto:** Vercel ofrece deploy automático en cada push a GitHub. Pero queremos control total sobre qué se despliega y cuándo.
- **Decisión:** Deploy manual con `vercel --prod --yes` desde terminal.
- **Razones:**
  - Control total: desplegamos cuando estamos seguros de que funciona
  - Velocidad: deploy en 30-60 segundos
  - Sin riesgo de deploys accidentales por commits WIP
- **Workflow:** Código → Test local → Commit → `vercel --prod --yes` → Verificar en producción

---

## DEC-010: Diseño mobile-first con wrapper de 390px

- **Fecha:** Enero 2026
- **Decisor:** Ángel Fernández + Pablo Herrera
- **Contexto:** El usuario principal (persona mayor) usa la app en un móvil. Debe verse perfecto en pantallas pequeñas.
- **Decisión:** Wrapper de 390px centrado (`maxWidth: 390, margin: '0 auto'`) para toda la app excepto landing y dashboard.
- **Consecuencia:** Garantiza que la app se ve idéntica en todos los dispositivos, como si fuera una app nativa.

---

## DEC-011: Framer Motion para animaciones

- **Fecha:** Enero 2026
- **Decisor:** Leo + Pablo Herrera
- **Contexto:** La app necesita sentirse viva y amigable, especialmente para la landing y la mascota.
- **Decisión:** Usar Framer Motion para:
  - Animaciones de entrada (fadeUp, scaleIn)
  - Transiciones entre estados de Fufy
  - Micro-interacciones (whileHover, whileTap en botones)
- **Resultado:** La app se siente premium y cuidada, reforzando la confianza del usuario.

---

## DEC-012: Wizard de onboarding con auto-avance

- **Fecha:** 2 de febrero de 2026
- **Decisor:** Ángel Fernández
- **Contexto:** El wizard de 5 pasos podía sentirse largo si había que pulsar "Siguiente" en cada paso.
- **Decisión:** Los primeros 2 pasos (perfil y familiar) avanzan automáticamente 500ms después de completar los campos obligatorios.
- **Resultado:** El usuario siente fluidez y rapidez. Los pasos 3-4 (horarios y alertas) requieren "Siguiente" porque tienen configuración más compleja.

---

*Documento creado el 2 de febrero de 2026 por Leo (IA Developer)*
