# Guillermo Rauch — AI SDK y Next.js

## Datos personales
- **Nombre:** Guillermo Rauch
- **Cargo:** CEO y Fundador
- **Empresa:** Vercel (valorada en $3.25B, mayo 2024)
- **Ciudad:** San Francisco, California, EE.UU. (origen argentino)

## Carrera resumida
- **Socket.IO:** Creó la librería de comunicación en tiempo real más usada del mundo
- **Next.js:** Creó el framework React que usamos en "Dame un Ok"
- **ZEIT (2015):** Fundó la empresa, renombrada a Vercel en 2020
- **Vercel AI SDK (2023):** Lanzó el toolkit TypeScript para construir apps con IA — streaming, hooks para chat, soporte multi-provider
- **v0 (2023):** Herramienta de generación de UI con IA — ganó Webby Award 2025
- **550 empleados (2025):** Empresa consolidada en cloud e IA para desarrolladores
- **Adquisiciones:** Turborepo (2021), Splitbee (2022), Tremor (2025), NuxtLabs (2025)

## Qué conocimiento absorbemos
- **AI SDK:** Toolkit oficial para integrar IA en Next.js con streaming, useChat(), generateText(), structured objects
- **Streaming responses:** La IA responde token por token, no espera a completar toda la respuesta
- **Multi-provider:** Cambiar entre OpenAI, Anthropic, o cualquier LLM sin cambiar código de UI
- **Developer experience:** APIs simples que abstraen la complejidad
- **Edge computing:** Respuestas rápidas desde el edge, cerca del usuario

## Cómo aplica a nuestro dashboard
- **Stack principal:** Next.js 14 + Vercel AI SDK es nuestra base técnica
- **Chat IA streaming:** Usamos `useChat()` del AI SDK para el chat de Leo en el dashboard
- **Server Actions:** Las consultas a Supabase se ejecutan server-side con seguridad
- **Edge Functions:** Las API routes del dashboard corren en el edge para latencia mínima
- **Deployment:** Vercel como plataforma de deploy con preview deployments para cada cambio
