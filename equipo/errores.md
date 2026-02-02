# Errores de Descarga

## URLs que fallaron o devolvieron contenido insuficiente

| URL | Error | Motivo |
|-----|-------|--------|
| https://docs.expo.dev/eas/ | Contenido mínimo (89 bytes) | Landing page renderizada con JS, solo muestra texto mínimo |
| https://docs.expo.dev/eas/overview/ | 404 | URL no existe |
| https://docs.expo.dev/build/introduction/ | Contenido mínimo (195 bytes) | Similar al anterior |
| https://spotify.design/ | Contenido vacío | SPA con JS rendering, no funciona con web_fetch |
| https://spotify.design/article/designing-for-audio | 404 | Artículo no encontrado |
| https://spotify.design/article/can-you-hear-me-now | 404 | Artículo no encontrado |
| https://spotify.design/article/designing-the-heart-and-soul-of-your-product | 404 | Artículo no encontrado |
| https://joulee.medium.com/ (listing) | Contenido mínimo | Medium bloquea scraping de listados |
| joulee.medium.com - strategic product roadmap | 404 | Post eliminado o URL cambiada |
| joulee.medium.com - product market fit | 404 | Post eliminado o URL cambiada |
| joulee.medium.com - unintuitive management | 404 | Post eliminado o URL cambiada |
| lg.substack.com (múltiples posts) | 404/paywall | Posts de Julie Zhuo en Substack no accesibles |
| https://posthog.com/docs | Contenido mínimo (695 bytes) | Landing page con poco contenido textual |

## Limitaciones encontradas
- **web_search no disponible**: No hay Brave API key configurada, no se pudo buscar URLs alternativas
- **SPAs**: Sitios como spotify.design y expo docs renderizan con JavaScript, web_fetch solo obtiene HTML estático
- **Medium**: Muchos posts antiguos de Julie Zhuo retornan 404 (posiblemente migrados a Substack)
- **Substack**: Posts de pago no accesibles via web_fetch
