# 🛠️ Herramientas y Credenciales para Deploy — Dame un Ok

**Fecha:** 31 enero 2026  
**Propósito:** Registro centralizado de todas las herramientas, cuentas y credenciales disponibles para desarrollo, testing local y despliegue en la nube.

---

## 1. CLIs Instaladas en Mac Mini

| Herramienta | Versión | Estado | Comando |
|-------------|---------|--------|---------|
| **Railway CLI** | 4.27.3 | ✅ Logueado como `elfilonero@gmail.com` | `railway` |
| **Vercel CLI** | 50.9.1 | ✅ Logueado como `vertexdeveloperchina-6186` | `vercel` |
| **Supabase CLI** | 2.72.7 | ⚠️ Necesita login (token disponible) | `supabase` |
| **GitHub CLI** | Instalado | ⚠️ Token sin scope `read:org` para `gh`, pero git push/pull funciona | `gh` / `git` |
| **Node.js** | v25.4.0 | ✅ OK | `node` |
| **pm2** | Instalado | ✅ OK (gestiona V16 dashboard + Todo App) | `pm2` |
| **Python 3** | Instalado | ✅ OK | `python3` |
| **Google Chrome** | Instalado | ✅ OK (headless disponible) | `/Applications/Google Chrome.app/...` |

---

## 2. Cuentas y Credenciales

### 🚂 Railway
- **Cuenta:** elfilonero@gmail.com
- **Estado:** ✅ Logueado y funcional
- **Proyectos anteriores:** CRM Compras (web-production-9e0340.up.railway.app)
- **Uso:** Deploy de backend, APIs, apps web
- **Comando deploy:** `railway up`

### ▲ Vercel
- **Cuenta:** vertexdeveloperchina@gmail.com (vertexdeveloperchina-6186)
- **Estado:** ✅ Logueado
- **Plan:** Hobby (personal projects)
- **Uso:** Deploy de frontend, Next.js, sitios estáticos
- **Comando deploy:** `vercel` o `vercel --prod`

### 🗄️ Supabase
- **Management API Token:** `sbp_0092face347e9bd5c50f23676829ca454105ede3`
- **Proyecto existente ref:** `eobqqwhywkdsxnpekkkd`
- **URL existente:** `eobqqwhywkdsxnpekkkd.supabase.co`
- **Estado:** ⚠️ Token disponible, necesita `supabase login` o env var
- **Uso:** Base de datos PostgreSQL, Auth, Row Level Security, Realtime, Edge Functions
- **Para Dame un Ok:** Crear nuevo proyecto dedicado
- **Login:** `export SUPABASE_ACCESS_TOKEN=sbp_0092face347e9bd5c50f23676829ca454105ede3`

### 🐙 GitHub
- **Cuenta:** elfilonero (elfilonero@gmail.com)
- **Token PAT:** `ghp_REDACTED`
- **Git user:** "Leo (IA)" / elfilonero@gmail.com
- **Estado:** ✅ Git push/pull funcional (token en ~/.git-credentials)
- **gh CLI:** ⚠️ Token no tiene scope `read:org` (necesitaría regenerar para gh CLI completo)
- **Repos existentes:** CALENDARIO-PEDIDOS-COMPRAS, angel-dashboard, todo, todo-app, v16-dashboard, dana-app, whatssound-app
- **Uso:** Repositorio de código, git push/pull, branches
- **Para Dame un Ok:** Crear repo `dame-un-ok` con git + API

### ☁️ Cloudflare
- **Dominio activo:** contextia.cloud
- **Subdominios configurados:** todo.contextia.cloud, angel.contextia.cloud
- **Credenciales:** Ver archivo `.credentials` (pendiente localizar)
- **Uso:** DNS, dominios, SSL, Workers (opcional)
- **Para Dame un Ok:** Subdominio `dameunok.contextia.cloud` o dominio propio

### 📧 Email Proyecto
- **Email general:** vertexdeveloperchina@gmail.com
- **Email OpenParty/WhatsSound:** openparty2026@gmail.com
- **Password Gmail:** D5PQ4y6GJ?
- **Uso:** Verificaciones, stores, APIs externas

---

## 3. Servicios Locales Activos (pm2)

| Servicio | Puerto | Estado |
|----------|--------|--------|
| Dashboard V16 | localhost:3000 (UDP 5000) | ✅ Activo |
| Todo App | localhost:3001 | ✅ Activo |
| **Dame un Ok (futuro)** | localhost:3002 (propuesto) | ⏳ Pendiente |

---

## 4. Flujo de Deploy (Protocolo)

### Desarrollo Local
```
1. Escribir código en /Users/vaca/clawd/projects/dame-un-ok/src/
2. Ejecutar en local: npm run dev → localhost:3002
3. Probar en navegador del Mac (Chrome headless para screenshots)
4. Tests en terminal: npm test
5. Tests de usuario: abrir en ventana del Mac y probar interacciones
```

### Staging (Pre-producción)
```
6. Commit a GitHub: git push origin develop
7. Deploy a Railway (staging): railway up --environment staging
8. Probar en URL de staging
9. Screenshots + registro en diario de testing
```

### Producción
```
10. Merge develop → main
11. Deploy a Railway/Vercel (producción): railway up / vercel --prod
12. Configurar dominio (Cloudflare DNS)
13. Probar en URL final
14. Registrar en diario de equipo
```

---

## 5. APIs Externas Necesarias (Por Configurar)

| Servicio | Para qué | Estado | Coste |
|----------|----------|--------|-------|
| **Firebase Cloud Messaging (FCM)** | Push notifications Android | ⏳ Crear proyecto | Gratis |
| **Apple Push Notification (APNs)** | Push notifications iOS | ⏳ Necesita Apple Developer ($99/año) | $99/año |
| **Twilio** | SMS para alertas | ⏳ Crear cuenta | ~$0.05/SMS España |
| **SendGrid / Resend** | Email transaccional | ⏳ Crear cuenta | Gratis hasta 100/día |
| **WhatsApp Business API** | Mensajería familiar→impresora | ⏳ Requiere Meta Business | Variable |
| **Telegram Bot API** | Mensajería familiar→impresora | ⏳ Crear bot con @BotFather | Gratis |

---

## 6. Proyectos Anteriores (Referencia)

### OpenParty / WhatsSound
- **Ruta:** `/Users/vaca/clawd/projects/openparty/`
- **Stack:** Next.js + Supabase
- **Deploy:** Railway (histórico)
- **Lecciones:** Túneles locales no funcionan desde la red china → necesita deploy real

### CRM Compras
- **Ruta:** `/Users/vaca/clawd/projects/CALENDARIO-PEDIDOS-COMPRAS/`
- **Stack:** Express + Supabase
- **Deploy:** Railway (web-production-9e0340.up.railway.app)
- **Supabase:** eobqqwhywkdsxnpekkkd

### DANA App
- **Ruta:** `/Users/vaca/clawd/projects/dana-app/`
- **Stack:** HTML/JS/CSS (web app estática)
- **Lecciones:** WebView Telegram NO soporta Web Speech API, 100dvh mejor que 100vh

---

## 7. Pendientes Antes de Código

- [x] Git configurado — Token PAT funcional, user "Leo (IA)"
- [ ] Crear repo GitHub `dame-un-ok` (privado) — con git + API de GitHub
- [ ] `supabase login` — Loguearse con token
- [ ] Crear nuevo proyecto Supabase para Dame un Ok
- [ ] Crear proyecto Firebase para push notifications
- [ ] Decidir dominio final (contextia.cloud o nuevo)
- [ ] Reservar puertos locales (3002 propuesto)

---

*Documento vivo — actualizar cada vez que se configure una herramienta nueva.*
