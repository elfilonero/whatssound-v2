# Harrison Chase — Encadenamiento de IA + Datos

## Datos personales
- **Nombre:** Harrison Chase
- **Cargo:** CEO y Fundador
- **Empresa:** LangChain (fundada oct 2022, $200M+ valoración)
- **Ciudad:** San Francisco, California, EE.UU.

## Carrera resumida
- **Robust Intelligence:** Trabajaba en startup de ML cuando creó LangChain como proyecto open source
- **LangChain (oct 2022):** Framework para integrar LLMs con fuentes de datos externas — lanzado como open source
- **Financiación rápida:** $10M seed (Benchmark) + $20M (Sequoia Capital) en abril 2023
- **LangChain Expression Language (LCEL):** Forma declarativa de definir cadenas de acciones
- **LangServe (oct 2023):** Deploy de cadenas como APIs en producción
- **LangSmith (feb 2024):** Plataforma de observabilidad para apps LLM + $25M Series A
- **LangGraph Platform (mayo 2025):** Infraestructura para agentes IA stateful de larga duración
- **Forbes AI 50 (2025):** Reconocido entre las empresas IA más importantes

## Qué conocimiento absorbemos
- **Chains (cadenas):** Encadenar múltiples pasos: consulta SQL → resultado → interpretación IA → respuesta natural
- **RAG (Retrieval Augmented Generation):** La IA consulta datos reales antes de responder, no inventa
- **Tool calling:** El LLM decide qué herramientas usar (consultar tabla X, calcular métrica Y)
- **Observabilidad:** LangSmith para debuggear qué hizo la IA en cada paso
- **Agentes stateful:** Conversaciones con memoria que recuerdan contexto previo

## Cómo aplica a nuestro dashboard
- **Arquitectura de consultas:** Cuando el admin pregunta "¿cuántos usuarios se registraron esta semana?", la IA:
  1. Interpreta la pregunta
  2. Genera la query SQL correcta
  3. Ejecuta contra Supabase
  4. Interpreta el resultado
  5. Responde en lenguaje natural
- **Tool calling:** La IA tiene "herramientas" definidas: consultar_usuarios, consultar_alertas, consultar_check_ins, calcular_mrr
- **Memoria de conversación:** El admin puede hacer preguntas follow-up ("¿y el mes anterior?") sin repetir contexto
- **Cadenas de análisis:** Para preguntas complejas ("¿por qué bajó la retención?"), encadenar múltiples consultas y comparaciones
