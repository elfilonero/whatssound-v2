# 🔐 Auth & Pagos para WhatsSound

## AUTENTICACIÓN

### Veredicto: **Supabase Auth** ✅
Fuente: https://supabase.com/docs/guides/auth

### Métodos para WhatsSound (por prioridad)

#### 1. Phone OTP (Principal)
- App tipo WhatsApp → los usuarios esperan login por teléfono
- Supabase soporta: Twilio, MessageBird, Vonage
- Flow:
  ```
  Usuario → Ingresa teléfono → Recibe SMS con código → Ingresa OTP → JWT emitido → Sesión activa
  ```
- **Costo:** ~$0.01-0.05 por SMS (Twilio pricing)
- **Supabase pricing:** Incluido en Auth, cobran por MAU ($0 hasta 50K MAU en Pro)

#### 2. Social Login (Secundario)
- **Apple Sign In** — OBLIGATORIO para iOS App Store
- **Google Sign In** — Cuota Android enorme
- **Spotify** — Relevante para app musical (importar playlists futuro)
- Todos soportados nativamente por Supabase Auth

#### 3. Magic Link (Fallback)
- Email con link de login, sin contraseña
- Para usuarios que no quieren dar teléfono
- Zero friction, integrado en Supabase

### Arquitectura Auth

```
┌─────────────────────────────────────────┐
│              Supabase Auth               │
│                                          │
│  JWT Token (access_token + refresh)      │
│  ┌────────────────────────────────────┐  │
│  │ Payload:                          │  │
│  │   sub: user_uuid                  │  │
│  │   role: authenticated             │  │
│  │   phone: +34...                   │  │
│  │   app_metadata: { plan: 'free' }  │  │
│  │   exp: timestamp                  │  │
│  └────────────────────────────────────┘  │
│                                          │
│  → RLS usa auth.uid() y auth.jwt()      │
│  → Edge Functions verifican JWT auto     │
│  → Realtime autentica con mismo token    │
└─────────────────────────────────────────┘
```

### Row Level Security (RLS) — La Clave
```sql
-- Solo ver mensajes de sesiones donde eres participante
CREATE POLICY "users see session messages" ON messages
  FOR SELECT USING (
    session_id IN (
      SELECT session_id FROM session_participants
      WHERE user_id = auth.uid()
    )
  );

-- Solo el DJ puede modificar la cola de canciones
CREATE POLICY "dj manages queue" ON song_queue
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM dj_sessions
      WHERE id = song_queue.session_id
      AND dj_id = auth.uid()
    )
  );
```

### Seguridad Adicional
- **Rate limiting** en OTP (max 5 intentos / 15 min)
- **JWT refresh** automático via Supabase SDK
- **MFA** disponible si se necesita para DJs (TOTP)
- **Hooks** para custom claims (ej: `is_dj`, `is_premium`)

---

## PAGOS

### Arquitectura Dual: Stripe + RevenueCat

```
┌─────────────────────────────────────┐
│           PAGOS WhatsSound           │
├──────────────┬──────────────────────┤
│   RevenueCat │     Stripe Direct    │
│  (In-App)    │     (Server-side)    │
├──────────────┼──────────────────────┤
│ Suscripciones│ Propinas al DJ       │
│ Premium      │ Pagos web            │
│ iOS & Android│ Custom amounts       │
│ App Store    │ Payouts a DJs        │
│ managed      │                      │
└──────────────┴──────────────────────┘
```

### RevenueCat — Suscripciones In-App
- **Docs:** https://docs.revenuecat.com
- **Qué resuelve:** Abstrae App Store (Apple) + Play Store (Google) billing
- **Por qué no Stripe solo:** Apple OBLIGA 30% comisión en in-app purchases. No puedes usar Stripe para suscripciones dentro de la app iOS.
- **Pricing RevenueCat:** Gratis hasta $2.5K MRR, luego 1% de revenue

**Planes posibles:**
| Plan | Precio | Features |
|------|--------|----------|
| Free | $0 | Chat, unirse a sesiones, votar (limitado) |
| Premium | $4.99/mes | Votos ilimitados, sin ads, crear sesiones |
| DJ Pro | $14.99/mes | Herramientas DJ, analytics, prioridad |

```typescript
// RevenueCat en React Native
import Purchases from 'react-native-purchases';

await Purchases.configure({ apiKey: 'rc_...' });
const offerings = await Purchases.getOfferings();
const { customerInfo } = await Purchases.purchasePackage(
  offerings.current.availablePackages[0]
);

// Verificar en backend via webhook → Edge Function
// RevenueCat → POST /webhook → update user metadata
```

### Stripe — Propinas y Pagos Directos
- **Docs:** https://stripe.com/docs
- **Uso principal:** Propinas al DJ durante sesiones
- **Stripe Connect:** Para payouts a DJs (ellos reciben el dinero)

```typescript
// Edge Function: Crear propina
const paymentIntent = await stripe.paymentIntents.create({
  amount: tipAmount, // en centavos
  currency: 'eur',
  transfer_data: {
    destination: djStripeAccountId, // Stripe Connect
  },
  application_fee_amount: Math.round(tipAmount * 0.10), // 10% plataforma
  metadata: {
    session_id: sessionId,
    tipper_id: userId,
    dj_id: djId,
  }
});
```

### Webhook Flow
```
Stripe/RevenueCat → Edge Function webhook → Verificar firma →
  → INSERT en payments table
  → UPDATE user metadata (plan)
  → Supabase Realtime notifica al cliente
  → UI se actualiza instantáneamente
```

### Consideraciones Legales