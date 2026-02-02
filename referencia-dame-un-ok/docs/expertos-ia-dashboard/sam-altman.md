# Sam Altman — System Prompts y Roles de IA

## Datos personales
- **Nombre:** Samuel Harris Altman
- **Cargo:** CEO
- **Empresa:** OpenAI
- **Ciudad:** San Francisco, California, EE.UU.
- **Nacimiento:** 22 abril 1985, Chicago

## Carrera resumida
- **Stanford:** Asistió 2 años, abandonó para emprender
- **Loopt (2005):** Co-fundó app de geolocalización, levantó $30M en VC
- **Y Combinator (2011-2019):** Se unió y fue presidente. Aceleró miles de startups (Airbnb, Stripe, Dropbox)
- **OpenAI (2019-presente):** CEO. Supervisó el lanzamiento de ChatGPT (2022) que desató el boom de IA
- **Crisis de noviembre 2023:** Despedido por el board, readmitido 5 días después tras presión masiva de empleados e inversores
- **Time Person of the Year (2025):** "Architect of AI"
- **Patrimonio:** ~$2.1B (Forbes)

## Qué conocimiento absorbemos
- **System prompts:** OpenAI popularizó el concepto de dar "personalidad" y "rol" a la IA mediante instrucciones iniciales
- **Function calling / Tool use:** GPT fue pionero en permitir que la IA llame funciones definidas por el desarrollador
- **Chat Completions API:** El modelo de conversación (system → user → assistant) que usamos
- **Roles claros:** system (instrucciones), user (preguntas), assistant (respuestas) — estructura que toda la industria adoptó
- **Iteración rápida:** "Ship early, iterate fast" — lanzar y mejorar

## Cómo aplica a nuestro dashboard
- **Diseño del system prompt:** Nuestro Leo IA tiene un system prompt detallado que define:
  - Su rol (analista de datos de "Dame un Ok")
  - Sus capacidades (consultar tablas, calcular métricas)
  - Sus límites (nunca inventar, nunca modificar datos)
  - Su tono (profesional pero cercano)
- **Function calling:** La IA tiene funciones disponibles para consultar cada tabla de Supabase
- **Estructura de conversación:** Seguimos el modelo system/user/assistant de OpenAI
- **Iteración:** El system prompt se refina con cada interacción real de Ángel y Kike
