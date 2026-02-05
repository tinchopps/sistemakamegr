# 🚀 Guía de Despliegue Seguro - Sistema Kame

Este documento detalla los pasos críticos para desplegar el Sistema Kame en producción sin comprometer la seguridad.

## 1. Variables de Entorno (Checklist)

Estas variables DEBEN configurarse en el panel de Netlify (Site Settings > Environment Variables) o Vercel. Nada de esto debe estar en el código.

| Variable Variable | Descripción | Fuente |
| :--- | :--- | :--- |
| `VITE_FIREBASE_API_KEY` | API Key pública de Firebase | Project Settings > General |
| `VITE_FIREBASE_AUTH_DOMAIN` | Dominio de Auth (ej: `kame-project.firebaseapp.com`) | Project Settings |
| `VITE_FIREBASE_PROJECT_ID` | ID del Proyecto (ej: `kame-project`) | Project Settings |
| `VITE_FIREBASE_STORAGE_BUCKET` | Bucket de Storage | Project Settings |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | ID numérico del sender | Project Settings |
| `VITE_FIREBASE_APP_ID` | ID de la App (ej: `1:12345:web:6789`) | Project Settings |

> ⚠️ **IMPORTANTE**: Vite expone en el bundle final cualquier variable que empiece con `VITE_`. Estas credenciales de Firebase son públicas por diseño, PERO la seguridad real reside en **Firestore Rules** y **App Check** (opcional), no en ocultar estas keys.

## 2. Configuración de CI/CD (Netlify)

1.  **Conectar Repositorio**:
    *   En Netlify, crea "New site from Git".
    *   Selecciona el repo de GitHub/GitLab.
2.  **Build Settings**:
    *   **Build command**: `npm run build`
    *   **Publish directory**: `dist`
3.  **Environment Variables**:
    *   Copia y pega las 6 variables de la tabla anterior.
4.  **Deploy**:
    *   Netlify detectará automáticamente cada push a `main` y ejecutará el build.

## 3. Sanitización del Repositorio

Antes de hacer público el repositorio o pushear a producción, verifica que no hayas subido secretos accidentalmente.

### Comandos de Verificación
```bash
# Buscar archivos .env trackeados
git ls-files .env*

# Buscar strings sospechosos en el historial
git grep "VITE_FIREBASE_API_KEY" $(git rev-list --all)
```

### Limpieza de Historial (Si encontrás secretos)
Si accidentalmente subiste un `.env`, usá `BFG Repo-Cleaner` o `git filter-branch`:

```bash
# Opción Recomendada: BFG
bfg --delete-files .env
git reflog expire --expire=now --all && git gc --prune=now --aggressive
```

## 4. Deploy de Reglas de Seguridad

Las reglas de seguridad NO se despliegan con Netlify. Deben subirse a Firebase:

```bash
# Instalar Firebase Tools
npm install -g firebase-tools

# Login
firebase login

# Inicializar (seleccionar Firestore)
firebase init firestore

# Desplegar SOLO reglas
firebase deploy --only firestore:rules
```

## 5. Headers de Seguridad (Netlify)

El archivo `netlify.toml` ya incluye headers básicos:
- `X-Frame-Options: DENY`: Evita clickjacking.
- `X-XSS-Protection: 1; mode=block`: Mitigación básica de XSS.

---
**Estado**: Ready for Production Deploy 🟢
