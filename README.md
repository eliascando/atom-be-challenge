# TaskExpress Azure Functions API

API REST para gestión de tareas y usuarios desplegable en **Azure Functions (Node.js v4)**, manteniendo **Cloud Firestore** como persistencia.

## Arquitectura

La estructura quedó inspirada en una separación de capas estilo clean architecture, pero **adaptada a Node.js** y al modelo HTTP de **Azure Functions**. La idea es preservar responsabilidades claras sin copiar nombres o convenciones propias de .NET.

### Estructura principal

- **`/src/domain`**
  - `entities`: entidades del dominio
  - `errors`: errores de negocio/aplicación
- **`/src/application`**
  - `contracts`: comandos/resultados del caso de uso
  - `ports/in`: casos de uso
  - `ports/out`: contratos hacia infraestructura
  - `services`: implementación de casos de uso
- **`/src/infrastructure`**
  - `config`: variables de entorno y Firestore
  - `security`: hashing y JWT
  - `persistence/firestore`: repositorios concretos
  - `composition`: wiring de dependencias
- **`/src/http/azure`**
  - `handlers`: borde HTTP nativo de Azure Functions
  - `presenters`: serialización HTTP de respuestas
  - `schemas`: validación de entrada con Zod
  - `http.ts`: utilidades HTTP, errores y CORS
- **`/src/functions`**
  - `index.ts`: registro de Azure Functions

## Endpoints

Azure Functions agrega por defecto el prefijo `/api`, así que las rutas públicas quedan así:

- `GET /api/v1/health`
- `POST /api/v1/auth/login`
- `GET /api/v1/users/exists?email=...`
- `POST /api/v1/users`
- `GET /api/v1/tasks`
- `POST /api/v1/tasks`
- `PUT /api/v1/tasks/{taskId}`
- `DELETE /api/v1/tasks/{taskId}`

## Variables de entorno

| Variable | Requerida | Descripción |
| --- | --- | --- |
| `JWT_SECRET` | Sí | Clave para firmar/verificar JWT |
| `JWT_EXPIRES_IN` | No | Expiración del token, por defecto `1h` |
| `CORS_ORIGIN` | No | Lista separada por coma o `*` |
| `FIREBASE_PROJECT_ID` | Recomendada fuera de GCP | Project id del service account de Firebase |
| `FIREBASE_CLIENT_EMAIL` | Recomendada fuera de GCP | Client email del service account de Firebase |
| `FIREBASE_PRIVATE_KEY` | Recomendada fuera de GCP | Private key del service account de Firebase |
| `GOOGLE_APPLICATION_CREDENTIALS` | Opcional fuera de GCP | Fallback por ruta a archivo JSON si prefieres seguir usando ADC |
| `AzureWebJobsStorage` | Sí para Azure Functions | Storage requerido por el host de Functions |
| `FUNCTIONS_WORKER_RUNTIME` | Sí para Azure Functions | Debe valer `node` |

> Azure Functions no publica automáticamente `local.settings.json`; sus valores están pensados para reflejar los **Application Settings** de Azure. En este repo:
> - `local.settings.json` queda para el **host local** de Functions.
> - `.env` queda para las **variables de la aplicación** (JWT, CORS, Firebase).

## Ejecutar localmente

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar Azure Functions Core Tools

Instala Azure Functions Core Tools v4 según tu sistema operativo.

### 3. Configurar el host local

```bash
cp local.settings.example.json local.settings.json
```

### 4. Configurar variables de la aplicación

```bash
cp .env.example .env
```

Completa al menos:

- `JWT_SECRET`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

### 5. Levantar Functions localmente

```bash
npm run dev
```

`npm run dev` primero compila TypeScript a `lib/` y después levanta `func start`, porque Azure Functions carga el entrypoint desde `package.json -> main` apuntando a `lib/functions/index.js`.

## Pruebas

```bash
npm run typecheck
npm run test
```

## Despliegue en Azure Functions

### 1. Crear la Function App

Necesitas una Function App en Azure con runtime **Node.js 22**. Azure Functions hoy soporta Node.js 22 y Node.js 20, pero Node.js 20 vence antes.

### 2. Configurar Application Settings

Define al menos:

- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `CORS_ORIGIN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

### 3. Publicar

Con Azure Functions Core Tools:

```bash
npm run build
func azure functionapp publish <NOMBRE_DE_TU_FUNCTION_APP>
```

## Notas de infraestructura

- El entrypoint activo para deploy es `src/functions/index.ts`.
- Firestore funciona con Firebase Admin SDK. En Azure, la opción recomendada en este proyecto es pasar el service account desglosado en `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL` y `FIREBASE_PRIVATE_KEY`.
- Si deseas reforzar la seguridad HTTP en Azure, puedes complementar con CORS/App Settings, APIM o Front Door.
