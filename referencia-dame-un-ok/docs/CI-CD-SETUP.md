# CI/CD Setup

## Workflows

### Tests (`test.yml`)
Se ejecuta en cada **push** a `main` y en cada **pull request** hacia `main`.

**Pasos:**
1. Checkout del código
2. Setup Node.js 20 con caché de npm
3. `npm ci` — instala dependencias
4. `npm run test:run` — ejecuta los tests con Vitest
5. `npm run build` — verifica que el proyecto compila correctamente

### Deploy (`deploy.yml`)
Se ejecuta en cada **push** a `main`. Tiene dos jobs:

1. **test** — Ejecuta los mismos pasos que el workflow de tests
2. **deploy** — Solo se ejecuta si los tests pasan (`needs: test`). Despliega a Vercel en producción.

> ⚠️ El deploy automático **solo funciona si los tests pasan**. Si algún test falla, el deploy no se ejecuta.

## Secrets necesarios en GitHub

Configúralos en: **Settings → Secrets and variables → Actions → New repository secret**

| Secret | Descripción |
|--------|-------------|
| `VERCEL_TOKEN` | Token de API de Vercel |
| `VERCEL_ORG_ID` | ID de tu organización/cuenta en Vercel |
| `VERCEL_PROJECT_ID` | ID del proyecto en Vercel |

## Cómo obtener los valores

### VERCEL_TOKEN
1. Ve a [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Crea un nuevo token con un nombre descriptivo (ej: "GitHub Actions")
3. Copia el token generado

### VERCEL_ORG_ID y VERCEL_PROJECT_ID
1. Instala Vercel CLI: `npm i -g vercel`
2. En el directorio del proyecto, ejecuta: `vercel link`
3. Esto crea un archivo `.vercel/project.json` con ambos valores:
   ```json
   {
     "orgId": "tu_org_id",
     "projectId": "tu_project_id"
   }
   ```
4. Usa esos valores como secrets en GitHub

## Resumen

- **Push a main** → Tests + Deploy automático (si tests pasan)
- **Pull request a main** → Solo tests (sin deploy)
- **Tests fallan** → No se despliega nada
