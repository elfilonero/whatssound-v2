# 🧪 Plan de Testing — Dame un Ok

> **Fecha:** Junio 2025  
> **Estado:** Plan detallado, pendiente de implementación

---

## 1. Framework Recomendado

### Stack de Testing

| Tipo | Herramienta | Justificación |
|---|---|---|
| **Unitarios + Componentes** | **Jest 30 + React Testing Library** | Ya configurado en el proyecto. `next/jest` maneja transforms de TypeScript/JSX. RTL ya está en devDependencies. |
| **E2E** | **Playwright** | Ya configurado (`playwright.config.ts`). Soporte nativo para PWA, mobile viewports (Pixel 5 ya definido), y Service Workers. |

> **¿Por qué NO Vitest?** Jest ya está instalado (v30) con configuración funcional via `next/jest`. Migrar no aporta valor en este momento. Si en el futuro se migra a Turbopack, reconsiderar.

> **¿Por qué NO Cypress?** Playwright es más rápido, tiene mejor soporte para PWA/Service Workers, y ya está configurado.

### Configuración existente (ya lista)

**Jest** (`jest.config.js`):
```js
// Ya configurado con next/jest, jsdom, alias @/
```

**Playwright** (`playwright.config.ts`):
```ts
// Ya configurado: Mobile Chrome (Pixel 5), puerto 3002, webServer auto
```

### Configuración adicional necesaria

```bash
# Crear carpetas de tests
mkdir -p src/__tests__/unit
mkdir -p src/__tests__/components
mkdir -p src/__tests__/integration
mkdir -p tests/e2e
```

**Archivo `src/setupTests.ts`** (si no existe):
```ts
import "@testing-library/jest-dom";
```

Añadir a `jest.config.js`:
```js
setupFilesAfterSetup: ["<rootDir>/src/setupTests.ts"],
```

---

## 2. Tests Unitarios

### 2.1 `lib/services/streak.ts` — `calculateStreak()`

**Prioridad: 🔴 CRÍTICA** — Es el core del engagement.

```ts
// src/__tests__/unit/streak.test.ts

// Mock de supabase
jest.mock("@/lib/services/supabase", () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
  },
}));

describe("calculateStreak", () => {
  test("devuelve 0 si no hay check-ins", async () => { /* ... */ });
  test("devuelve 1 si solo hay check-in de hoy", async () => { /* ... */ });
  test("devuelve 3 para 3 días consecutivos", async () => { /* ... */ });
  test("rompe la racha si falta un día", async () => { /* ... */ });
  test("cuenta ayer si hoy no hay check-in", async () => { /* ... */ });
  test("ignora múltiples check-ins del mismo día", async () => { /* ... */ });
  test("actualiza el streak en dok_users", async () => { /* ... */ });
});
```

### 2.2 `lib/services/alerts.ts` — `calculateAlertLevel()`

**Prioridad: 🔴 CRÍTICA** — Determina cuándo se alerta a la familia.

```ts
// src/__tests__/unit/alerts.test.ts

describe("calculateAlertLevel", () => {
  test("0 minutos → 'ok'", () => {
    expect(calculateAlertLevel(0)).toBe("ok");
  });
  test("30 minutos → 'esperando'", () => {
    expect(calculateAlertLevel(30)).toBe("esperando");
  });
  test("60 minutos → 'alerta1h'", () => {
    expect(calculateAlertLevel(60)).toBe("alerta1h");
  });
  test("180 minutos → 'alerta3h'", () => {
    expect(calculateAlertLevel(180)).toBe("alerta3h");
  });
  test("360 minutos → 'emergencia6h'", () => {
    expect(calculateAlertLevel(360)).toBe("emergencia6h");
  });
  test("59 minutos → 'esperando' (límite inferior)", () => {
    expect(calculateAlertLevel(59)).toBe("esperando");
  });
  test("179 minutos → 'alerta1h' (límite inferior)", () => {
    expect(calculateAlertLevel(179)).toBe("alerta1h");
  });
  test("359 minutos → 'alerta3h' (límite inferior)", () => {
    expect(calculateAlertLevel(359)).toBe("alerta3h");
  });
});

describe("createAlert", () => {
  test("inserta alerta en dok_alertas con datos correctos", async () => { /* ... */ });
});

describe("resolveAlerts", () => {
  test("marca todas las alertas pendientes como resueltas", async () => { /* ... */ });
});

describe("getAlertHistory", () => {
  test("devuelve últimas 20 alertas ordenadas", async () => { /* ... */ });
  test("devuelve array vacío si no hay alertas", async () => { /* ... */ });
});
```

### 2.3 `lib/constants/fufy-evolution.ts` — Funciones puras

**Prioridad: 🟡 MEDIA** — Lógica de gamificación.

```ts
// src/__tests__/unit/fufy-evolution.test.ts

describe("getFufyLevel", () => {
  test("streak 0 → nivel 1 (Fufy bebé)", () => {
    expect(getFufyLevel(0).level).toBe(1);
  });
  test("streak 7 → nivel 2 (Fufy joven)", () => {
    expect(getFufyLevel(7).level).toBe(2);
  });
  test("streak 30 → nivel 3 (Fufy adulto)", () => {
    expect(getFufyLevel(30).level).toBe(3);
  });
  test("streak 100 → nivel 4 (Fufy legendario)", () => {
    expect(getFufyLevel(100).level).toBe(4);
  });
  test("streak 6 → nivel 1 (límite superior)", () => {
    expect(getFufyLevel(6).level).toBe(1);
  });
});

describe("getUnlockedAccessories", () => {
  test("streak 0 → sin accesorios", () => {
    expect(getUnlockedAccessories(0)).toHaveLength(0);
  });
  test("streak 7 → lacito desbloqueado", () => {
    expect(getUnlockedAccessories(7)).toHaveLength(1);
    expect(getUnlockedAccessories(7)[0].name).toBe("Lacito");
  });
  test("streak 100 → todos los accesorios", () => {
    expect(getUnlockedAccessories(100)).toHaveLength(5);
  });
});

describe("getNextLevel", () => {
  test("nivel 4 → null (ya es el máximo)", () => {
    expect(getNextLevel(100)).toBeNull();
  });
  test("nivel 1 → devuelve nivel 2", () => {
    expect(getNextLevel(0)?.level).toBe(2);
  });
});
```

### 2.4 `lib/constants/alerts.ts` — Constantes y configuración

**Prioridad: 🟢 BAJA** — Son constantes, pero vale verificar consistencia.

```ts
// src/__tests__/unit/alert-config.test.ts

describe("ALERT_ESCALATION", () => {
  test("warning < alert < emergency", () => {
    expect(ALERT_ESCALATION.warning).toBeLessThan(ALERT_ESCALATION.alert);
    expect(ALERT_ESCALATION.alert).toBeLessThan(ALERT_ESCALATION.emergency);
  });
  test("TEST_MODE está desactivado en producción", () => {
    expect(TEST_MODE).toBe(false);
  });
});

describe("ALERT_CONFIG tiene todas las claves necesarias", () => {
  const levels: AlertLevel[] = ["ok", "esperando", "hambre", "alerta1h", "alerta3h", "emergencia6h"];
  levels.forEach(level => {
    test(`${level} tiene badge, badgeBg, badgeBorder, icon`, () => {
      expect(ALERT_CONFIG[level]).toHaveProperty("badge");
      expect(ALERT_CONFIG[level]).toHaveProperty("badgeBg");
      expect(ALERT_CONFIG[level]).toHaveProperty("icon");
    });
  });
});
```

### 2.5 `lib/constants/achievements.ts` — Logros

**Prioridad: 🟢 BAJA**

```ts
describe("ACHIEVEMENTS", () => {
  test("todos los logros tienen id, name, emoji únicos", () => { /* ... */ });
  test("no hay IDs duplicados", () => { /* ... */ });
});
```

### 2.6 API Routes (lógica server-side)

**Prioridad: 🔴 CRÍTICA** — Contienen lógica de negocio.

```ts
// src/__tests__/unit/api-check-alerts.test.ts

// Tests para /api/push/check-alerts
describe("POST /api/push/check-alerts", () => {
  test("devuelve 401 sin token de autorización", async () => { /* ... */ });
  test("devuelve 400 sin user_id", async () => { /* ... */ });
  test("devuelve null si no hay check-ins", async () => { /* ... */ });
  test("devuelve null si el último check-in es reciente", async () => { /* ... */ });
  test("devuelve alerta1h si pasó 1 hora", async () => { /* ... */ });
  test("devuelve emergencia6h si pasaron 6 horas", async () => { /* ... */ });
});

// Tests para /api/link-user
describe("POST /api/link-user", () => {
  test("vincula usuario correctamente", async () => { /* ... */ });
  test("devuelve error si el código no existe", async () => { /* ... */ });
});

// Tests para /api/push/subscribe
describe("POST /api/push/subscribe", () => {
  test("guarda suscripción push válida", async () => { /* ... */ });
  test("rechaza suscripción sin endpoint", async () => { /* ... */ });
});
```

---

## 3. Tests de Componentes

### 3.1 `components/user/ActionButtons.tsx`

**Prioridad: 🔴 CRÍTICA** — Interacción principal del usuario mayor.

```ts
// src/__tests__/components/ActionButtons.test.tsx

describe("ActionButtons", () => {
  test("renderiza 3 botones: Alimentar, Mimar, Jugar", () => {
    render(<ActionButtons actions={{ alimentar: false, mimar: false, jugar: false }} onAction={jest.fn()} />);
    expect(screen.getByText("Alimentar")).toBeInTheDocument();
    expect(screen.getByText("Mimar")).toBeInTheDocument();
    expect(screen.getByText("Jugar")).toBeInTheDocument();
  });

  test("botón completado muestra CheckIcon y está deshabilitado", () => {
    render(<ActionButtons actions={{ alimentar: true, mimar: false, jugar: false }} onAction={jest.fn()} />);
    const btn = screen.getByText("Alimentar").closest("button");
    expect(btn).toBeDisabled();
  });

  test("click en botón activo llama onAction con la key correcta", () => {
    const onAction = jest.fn();
    render(<ActionButtons actions={{ alimentar: false, mimar: false, jugar: false }} onAction={onAction} />);
    fireEvent.click(screen.getByText("Mimar"));
    expect(onAction).toHaveBeenCalledWith("mimar");
  });

  test("click en botón completado NO llama onAction", () => {
    const onAction = jest.fn();
    render(<ActionButtons actions={{ alimentar: true, mimar: false, jugar: false }} onAction={onAction} />);
    fireEvent.click(screen.getByText("Alimentar"));
    expect(onAction).not.toHaveBeenCalled();
  });
});
```

### 3.2 `components/user/PetDisplay.tsx`

**Prioridad: 🟡 MEDIA**

```ts
describe("PetDisplay", () => {
  test("muestra avatar según el mood", () => { /* ... */ });
  test("muestra nombre de la mascota", () => { /* ... */ });
  test("muestra racha correcta", () => { /* ... */ });
  test("mood 'euforico' muestra animación especial", () => { /* ... */ });
});
```

### 3.3 `components/user/UserScreen.tsx`

**Prioridad: 🔴 CRÍTICA** — Pantalla completa del usuario mayor.

```ts
describe("UserScreen", () => {
  test("renderiza PetDisplay y ActionButtons", () => { /* ... */ });
  test("carga check-ins previos del día desde Supabase", () => { /* ... */ });
  test("al completar 3 acciones, muestra Confetti", () => { /* ... */ });
  test("muestra AchievementPopup cuando se desbloquea logro", () => { /* ... */ });
});
```

### 3.4 `components/familiar/FamiliarOnboardingWizard.tsx`

**Prioridad: 🔴 CRÍTICA** — Flujo de registro/onboarding.

```ts
describe("FamiliarOnboardingWizard", () => {
  test("renderiza paso 1 inicialmente", () => { /* ... */ });
  test("valida nombre obligatorio en paso 1", () => { /* ... */ });
  test("avanza al paso 2 con datos válidos", () => { /* ... */ });
  test("muestra selector de país", () => { /* ... */ });
  test("paso 3: permite configurar horarios", () => { /* ... */ });
  test("paso 4: muestra enlace compartible", () => { /* ... */ });
  test("paso 5: muestra resumen y botón finalizar", () => { /* ... */ });
  test("llama onComplete al finalizar", () => { /* ... */ });
  test("persiste datos en Supabase al avanzar", () => { /* ... */ });
});
```

### 3.5 `components/familiar/FamiliarDashboard.tsx`

**Prioridad: 🔴 CRÍTICA** — Panel principal del familiar.

```ts
describe("FamiliarDashboard", () => {
  test("muestra estado del usuario vinculado", () => { /* ... */ });
  test("muestra badge de alerta según tiempo sin actividad", () => { /* ... */ });
  test("tabs: Inicio, Alertas, Familiares, Ajustes", () => { /* ... */ });
  test("se actualiza en tiempo real con Supabase Realtime", () => { /* ... */ });
});
```

### 3.6 `components/familiar/TabAlertas.tsx`

**Prioridad: 🟡 MEDIA**

```ts
describe("TabAlertas", () => {
  test("muestra historial de alertas", () => { /* ... */ });
  test("diferencia alertas resueltas vs activas", () => { /* ... */ });
  test("muestra icono y color según nivel de alerta", () => { /* ... */ });
});
```

### 3.7 `components/ui/ShareButtons.tsx`

**Prioridad: 🟡 MEDIA**

```ts
describe("ShareButtons", () => {
  test("renderiza botón de WhatsApp con URL correcta", () => { /* ... */ });
  test("botón copiar copia al clipboard", () => { /* ... */ });
  test("muestra confirmación al copiar", () => { /* ... */ });
});
```

### 3.8 `components/alarm/AlarmScreen.tsx`

**Prioridad: 🟡 MEDIA**

```ts
describe("AlarmScreen", () => {
  test("muestra mensaje de alerta", () => { /* ... */ });
  test("botón de snooze llama API de snooze", () => { /* ... */ });
});
```

### 3.9 `components/auth/AuthGuard.tsx`

**Prioridad: 🟡 MEDIA**

```ts
describe("AuthGuard", () => {
  test("redirige a landing si no hay sesión", () => { /* ... */ });
  test("renderiza children si hay sesión válida", () => { /* ... */ });
  test("muestra loading mientras verifica auth", () => { /* ... */ });
});
```

### 3.10 `components/onboarding/OnboardingFlow.tsx`

**Prioridad: 🟡 MEDIA**

```ts
describe("OnboardingFlow", () => {
  test("muestra wizard si no está onboarded", () => { /* ... */ });
  test("muestra dashboard si ya está onboarded", () => { /* ... */ });
});
```

---

## 4. Tests de Hooks

### 4.1 `lib/hooks/usePetState.ts`

**Prioridad: 🔴 CRÍTICA** — Lógica de estado de la mascota.

```ts
// src/__tests__/hooks/usePetState.test.ts
import { renderHook, act } from "@testing-library/react";

describe("usePetState", () => {
  test("mood inicial es 'esperando'", () => {
    const { result } = renderHook(() => usePetState());
    expect(result.current.mood).toBe("esperando");
    expect(result.current.doneCount).toBe(0);
  });

  test("alimentar → mood 'alimentado'", () => {
    const { result } = renderHook(() => usePetState());
    act(() => result.current.doAction("alimentar"));
    expect(result.current.mood).toBe("alimentado");
    expect(result.current.doneCount).toBe(1);
  });

  test("mimar después de alimentar → mood 'mimado'", () => {
    const { result } = renderHook(() => usePetState());
    act(() => result.current.doAction("alimentar"));
    act(() => result.current.doAction("mimar"));
    expect(result.current.mood).toBe("mimado");
    expect(result.current.doneCount).toBe(2);
  });

  test("3 acciones → mood 'euforico'", () => {
    const { result } = renderHook(() => usePetState());
    act(() => result.current.doAction("alimentar"));
    act(() => result.current.doAction("mimar"));
    act(() => result.current.doAction("jugar"));
    expect(result.current.mood).toBe("euforico");
    expect(result.current.doneCount).toBe(3);
  });

  test("acción repetida no cambia estado", () => {
    const { result } = renderHook(() => usePetState());
    act(() => result.current.doAction("alimentar"));
    act(() => result.current.doAction("alimentar"));
    expect(result.current.doneCount).toBe(1);
  });

  test("forceState sobreescribe el mood calculado", () => {
    const { result } = renderHook(() => usePetState("euforico"));
    expect(result.current.mood).toBe("euforico");
    expect(result.current.doneCount).toBe(0);
  });

  test("setInitialActions establece estado desde check-ins previos", () => {
    const { result } = renderHook(() => usePetState());
    act(() => result.current.setInitialActions({ alimentar: true, mimar: true, jugar: false }));
    expect(result.current.doneCount).toBe(2);
    expect(result.current.mood).toBe("mimado");
  });
});
```

### 4.2 `lib/hooks/useAchievements.ts`

**Prioridad: 🟡 MEDIA**

```ts
describe("useAchievements", () => {
  test("carga logros desbloqueados desde Supabase", () => { /* ... */ });
  test("desbloquea logro cuando se cumplen condiciones", () => { /* ... */ });
  test("no desbloquea logro ya desbloqueado", () => { /* ... */ });
  test("muestra popup del nuevo logro", () => { /* ... */ });
  test("dismissAchievement limpia el popup", () => { /* ... */ });
});
```

### 4.3 `lib/hooks/useSubscription.ts`

**Prioridad: 🟢 BAJA**

```ts
describe("useSubscription", () => {
  test("devuelve plan 'free' por defecto", () => { /* ... */ });
  test("devuelve plan 'premium' si hay suscripción activa", () => { /* ... */ });
});
```

---

## 5. Tests de Integración

### 5.1 Flujo: Landing → Empezar gratis → Wizard completo

**Prioridad: 🔴 CRÍTICA**

```ts
// src/__tests__/integration/onboarding-flow.test.tsx

describe("Flujo de onboarding completo", () => {
  // Mock Supabase
  beforeEach(() => {
    // Mock signInAnonymously, insert en dok_familiares, dok_invitations
  });

  test("landing muestra CTA 'Empezar gratis'", () => { /* ... */ });
  
  test("flujo completo: nombre → país → horarios → enlace → resumen", async () => {
    // 1. Renderizar wizard
    // 2. Rellenar nombre del familiar
    // 3. Seleccionar país
    // 4. Avanzar al paso de configuración de horarios
    // 5. Configurar tiempos de alerta
    // 6. Verificar que se genera enlace compartible
    // 7. Verificar que se muestra resumen con datos correctos
    // 8. Click en finalizar
    // 9. Verificar que se llamó onComplete
    // 10. Verificar que se insertaron datos en Supabase
  });

  test("wizard persiste datos parciales si se cierra", async () => { /* ... */ });
});
```

### 5.2 Flujo: Check-in del usuario mayor

**Prioridad: 🔴 CRÍTICA**

```ts
// src/__tests__/integration/checkin-flow.test.tsx

describe("Flujo de check-in", () => {
  test("usuario completa 3 acciones → se guarda check-in → se actualiza racha", async () => {
    // 1. Renderizar UserScreen con mock de Supabase
    // 2. Click en Alimentar → verificar estado
    // 3. Click en Mimar → verificar estado
    // 4. Click en Jugar → verificar estado eufórico
    // 5. Verificar INSERT en dok_check_ins con actions: ["alimentar", "mimar", "jugar"]
    // 6. Verificar que calculateStreak fue llamado
    // 7. Verificar que se muestra Confetti
  });

  test("acciones previas del día se cargan al entrar", async () => {
    // Mock de check-ins existentes hoy
    // Verificar que botones ya completados aparecen como done
  });
});
```

### 5.3 Flujo: Sistema de alertas (tiempos y escalado)

**Prioridad: 🔴 CRÍTICA**

```ts
// src/__tests__/integration/alert-system.test.tsx

describe("Sistema de alertas", () => {
  test("sin actividad 1h → genera alerta amarilla → notifica familiar", async () => {
    // 1. Simular usuario sin check-in por 60 min
    // 2. Llamar POST /api/push/check-alerts
    // 3. Verificar alerta nivel "alerta1h"
    // 4. Verificar INSERT en dok_alertas
    // 5. Verificar intento de push notification
  });

  test("sin actividad 3h → escala a alerta roja", async () => { /* ... */ });
  test("sin actividad 6h → escala a emergencia", async () => { /* ... */ });
  test("check-in resuelve todas las alertas pendientes", async () => { /* ... */ });
  test("snooze pausa las alertas temporalmente", async () => { /* ... */ });
});
```

### 5.4 Flujo: Dashboard familiar — carga de datos

**Prioridad: 🟡 MEDIA**

```ts
// src/__tests__/integration/dashboard-load.test.tsx

describe("Dashboard familiar", () => {
  test("carga datos del usuario vinculado", async () => {
    // Mock de dok_users, dok_check_ins, dok_alertas
    // Verificar que TabInicio muestra: nombre, racha, último check-in, estado
  });

  test("actualización en tiempo real al recibir check-in", async () => {
    // Mock Supabase Realtime
    // Emitir evento de nuevo check-in
    // Verificar que la UI se actualiza
  });

  test("sin usuario vinculado → muestra wizard de onboarding", async () => { /* ... */ });
});
```

### 5.5 Flujo: Compartir enlace

**Prioridad: 🟡 MEDIA**

```ts
describe("Compartir enlace", () => {
  test("genera URL correcta con código del usuario", () => {
    // Verificar formato: https://dame-un-ok.vercel.app/u/CODIGO
  });
  test("botón WhatsApp abre URL correcta", () => { /* ... */ });
  test("botón copiar copia al clipboard", () => { /* ... */ });
});
```

---

## 6. Tests E2E (Playwright)

### 6.1 Configuración

```ts
// playwright.config.ts (ya existe, ampliar)
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30000,
  retries: 1,
  use: {
    baseURL: "http://localhost:3002",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "Desktop Chrome",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    port: 3002,
    reuseExistingServer: true,
  },
});
```

### 6.2 Supabase de test

**Opción recomendada:** Variables de entorno con proyecto Supabase de staging.

```bash
# .env.test
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co  # Proyecto de test
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...               # Key de test
```

**Alternativa (más robusta):** Supabase local con Docker:
```bash
npx supabase init
npx supabase start
# Corre PostgreSQL local en localhost:54321
```

**Seed de datos para tests:**
```sql
-- tests/e2e/seed.sql
INSERT INTO dok_admin_invitations (code, label) VALUES ('TEST-ADMIN', 'E2E Test');
INSERT INTO dok_users (id, name, pet_name, invite_code, streak) 
  VALUES ('test-user-1', 'Abuela Test', 'Fufy', 'TEST123', 5);
INSERT INTO dok_familiares (id, auth_id, linked_user_id, familiar_name, onboarded) 
  VALUES ('test-fam-1', 'test-auth-1', 'test-user-1', 'Hijo Test', true);
```

### 6.3 Flujos E2E

#### E2E-01: Landing page y navegación

```ts
// tests/e2e/landing.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Landing page", () => {
  test("muestra hero, planes y CTA", async ({ page }) => {
    await page.goto("/landing");
    await expect(page.getByText("Dame un Ok")).toBeVisible();
    await expect(page.getByText("Empezar gratis")).toBeVisible();
    await expect(page.getByText("4,99€")).toBeVisible();
  });

  test("CTA navega a registro familiar", async ({ page }) => {
    await page.goto("/landing");
    await page.click("text=Empezar gratis");
    await expect(page).toHaveURL(/familiar/);
  });
});
```

#### E2E-02: Onboarding completo del familiar

```ts
// tests/e2e/onboarding.spec.ts

test("onboarding wizard completo", async ({ page }) => {
  await page.goto("/familiar?admin=TEST-ADMIN");
  
  // Paso 1: Nombre
  await page.fill('[placeholder*="nombre"]', "María");
  await page.click("text=Siguiente");
  
  // Paso 2: País
  await page.click("text=España");
  await page.click("text=Siguiente");
  
  // Paso 3: Datos del familiar mayor
  await page.fill('[placeholder*="nombre"]', "Carmen");
  await page.click("text=Siguiente");
  
  // Paso 4: Horarios
  await page.click("text=Siguiente"); // Valores por defecto
  
  // Paso 5: Enlace generado
  await expect(page.getByText("dame-un-ok.vercel.app/u/")).toBeVisible();
  await page.click("text=Finalizar");
  
  // Verificar que muestra el dashboard
  await expect(page.getByText("Carmen")).toBeVisible();
});
```

#### E2E-03: App del usuario mayor (check-in completo)

```ts
// tests/e2e/user-checkin.spec.ts

test("usuario mayor completa 3 acciones", async ({ page }) => {
  await page.goto("/u/TEST123");
  
  // Verificar que Fufy aparece
  await expect(page.getByText("Fufy")).toBeVisible();
  
  // Alimentar
  await page.click("text=Alimentar");
  await expect(page.getByText("Alimentar").locator("..")).toHaveAttribute("disabled");
  
  // Mimar
  await page.click("text=Mimar");
  
  // Jugar
  await page.click("text=Jugar");
  
  // Verificar estado eufórico (confetti o animación)
  await expect(page.locator("[data-testid='confetti']")).toBeVisible({ timeout: 3000 });
});

test("acciones persisten al recargar la página", async ({ page }) => {
  await page.goto("/u/TEST123");
  await page.click("text=Alimentar");
  await page.reload();
  // El botón alimentar debería estar deshabilitado
  await expect(page.getByText("Alimentar").locator("..")).toBeDisabled();
});
```

#### E2E-04: Sistema de alertas en el dashboard familiar

```ts
// tests/e2e/alerts.spec.ts

test("dashboard muestra estado correcto según tiempo sin actividad", async ({ page }) => {
  // Navegar al dashboard familiar con usuario vinculado
  await page.goto("/familiar?admin=TEST-ADMIN");
  
  // Verificar que muestra el estado actual
  await expect(page.getByText(/Esta bien|Esperando|Sin respuesta/)).toBeVisible();
});
```

#### E2E-05: Dashboard profesional

```ts
// tests/e2e/dashboard.spec.ts

test("dashboard profesional carga métricas", async ({ page }) => {
  await page.goto("/dashboard?admin=TEST-ADMIN");
  await expect(page.getByText("Overview")).toBeVisible();
  // Verificar StatCards
  await expect(page.locator("[data-testid='stat-card']")).toHaveCount(4);
});

test("navegación entre secciones del dashboard", async ({ page }) => {
  await page.goto("/dashboard?admin=TEST-ADMIN");
  await page.click("text=Usuarios");
  await expect(page).toHaveURL(/dashboard\/users/);
  await page.click("text=Alertas");
  await expect(page).toHaveURL(/dashboard\/alerts/);
});
```

#### E2E-06: PWA / Service Worker

```ts
// tests/e2e/pwa.spec.ts

test("service worker se registra correctamente", async ({ page }) => {
  await page.goto("/u/TEST123");
  const swRegistered = await page.evaluate(async () => {
    const reg = await navigator.serviceWorker.getRegistration();
    return !!reg;
  });
  expect(swRegistered).toBe(true);
});

test("manifest.json es accesible", async ({ page }) => {
  const response = await page.goto("/manifest.json");
  expect(response?.status()).toBe(200);
  const manifest = await response?.json();
  expect(manifest.name).toContain("Dame un Ok");
});
```

#### E2E-07: Modo demo

```ts
// tests/e2e/demo.spec.ts

test("modo demo funciona sin auth", async ({ page }) => {
  await page.goto("/demo");
  await expect(page.getByText("Fufy")).toBeVisible();
  await page.click("text=Alimentar");
  // Verificar que funciona sin Supabase real
});
```

---

## 7. Cobertura Mínima Recomendada

| Módulo | Cobertura mínima | Justificación |
|---|---|---|
| `lib/services/streak.ts` | **90%** | Core del engagement, errores aquí rompen rachas |
| `lib/services/alerts.ts` | **95%** | Seguridad: alertas incorrectas = riesgo para el mayor |
| `lib/constants/fufy-evolution.ts` | **100%** | Funciones puras, fáciles de testear |
| `lib/hooks/usePetState.ts` | **95%** | Lógica central de la app del mayor |
| `lib/hooks/useAchievements.ts` | **80%** | Gamificación, menos crítico |
| `components/user/*` | **80%** | UI del usuario mayor |
| `components/familiar/*` | **75%** | Panel del familiar |
| `components/ui/*` | **60%** | Componentes presentacionales |
| `app/api/**` | **85%** | API routes con lógica de negocio |
| `components/dashboard/*` | **50%** | Dashboard admin, menos crítico en MVP |
| **TOTAL proyecto** | **≥ 75%** | Objetivo realista para MVP |

---

## 8. Prioridad de Implementación

### Fase 1: Fundamentos (1-2 días) 🔴

**Qué:** Tests unitarios de funciones puras y lógica de negocio.

| Test | Esfuerzo | Impacto |
|---|---|---|
| `calculateAlertLevel()` | 30 min | 🔴 Crítico — seguridad del mayor |
| `calculateStreak()` | 1h | 🔴 Crítico — engagement |
| `getFufyLevel()` + `getUnlockedAccessories()` + `getNextLevel()` | 30 min | 🟡 Alto — gamificación |
| `usePetState` hook | 1h | 🔴 Crítico — lógica central |
| Constantes de alertas | 20 min | 🟢 Bajo — verificación de consistencia |

**Total Fase 1: ~3.5 horas**

### Fase 2: Componentes críticos (2-3 días) 🔴

| Test | Esfuerzo | Impacto |
|---|---|---|
| `ActionButtons` | 1h | 🔴 Interacción principal |
| `UserScreen` | 2h | 🔴 Pantalla completa del mayor |
| `FamiliarOnboardingWizard` | 3h | 🔴 Flujo de registro |
| `FamiliarDashboard` | 2h | 🔴 Panel principal |
| `AuthGuard` | 1h | 🟡 Seguridad de acceso |

**Total Fase 2: ~9 horas**

### Fase 3: Integración (2-3 días) 🟡

| Test | Esfuerzo | Impacto |
|---|---|---|
| Flujo check-in completo | 2h | 🔴 Flujo principal |
| Sistema de alertas integrado | 3h | 🔴 Seguridad |
| Onboarding completo | 2h | 🟡 Conversión |
| API routes (check-alerts, link-user, subscribe) | 3h | 🔴 Backend |

**Total Fase 3: ~10 horas**

### Fase 4: E2E (2-3 días) 🟡

| Test | Esfuerzo | Impacto |
|---|---|---|
| Setup Supabase de test + seed | 2h | Prerequisito |
| Landing + navegación | 1h | 🟢 Smoke test |
| Onboarding E2E | 2h | 🟡 Flujo completo |
| Check-in E2E | 1.5h | 🔴 Flujo principal |
| Dashboard familiar E2E | 1.5h | 🟡 |
| PWA + manifest | 30 min | 🟢 |
| Demo mode | 30 min | 🟢 |

**Total Fase 4: ~9 horas**

### Fase 5: Complementarios (1-2 días) 🟢

| Test | Esfuerzo | Impacto |
|---|---|---|
| Componentes UI (Card, Badge, Avatar, TabBar) | 2h | 🟢 Presentacionales |
| Dashboard profesional | 2h | 🟢 Admin |
| `useAchievements` hook | 1.5h | 🟡 |
| `useSubscription` hook | 30 min | 🟢 |
| ShareButtons | 30 min | 🟡 |
| ScheduleEditor | 1h | 🟡 |

**Total Fase 5: ~7.5 horas**

---

### Resumen de esfuerzo total

| Fase | Tiempo estimado | Prioridad |
|---|---|---|
| Fase 1: Unitarios fundamentos | 3.5h | 🔴 Hacer YA |
| Fase 2: Componentes críticos | 9h | 🔴 Semana 1 |
| Fase 3: Integración | 10h | 🟡 Semana 1-2 |
| Fase 4: E2E | 9h | 🟡 Semana 2 |
| Fase 5: Complementarios | 7.5h | 🟢 Semana 3 |
| **TOTAL** | **~39 horas** | **~2 semanas de trabajo** |

---

## 9. Scripts de npm recomendados

```json
{
  "scripts": {
    "test": "jest --passWithNoTests",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage --passWithNoTests",
    "test:unit": "jest --testPathPattern='__tests__/(unit|hooks)'",
    "test:components": "jest --testPathPattern='__tests__/components'",
    "test:integration": "jest --testPathPattern='__tests__/integration'",
    "test:e2e": "npx playwright test",
    "test:e2e:ui": "npx playwright test --ui",
    "test:all": "npm run test:coverage && npm run test:e2e"
  }
}
```

---

## 10. CI/CD (futuro)

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v4

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
    env:
      NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.TEST_SUPABASE_URL }}
      NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.TEST_SUPABASE_ANON_KEY }}
```

---

> **Nota:** Este plan asume que los mocks de Supabase se hacen a nivel de módulo (`jest.mock`). Para tests de integración más fieles, considerar [MSW (Mock Service Worker)](https://mswjs.io/) para interceptar llamadas HTTP a Supabase.