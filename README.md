# atom-be-challenge

Backend de tareas y usuarios desarrollado con TypeScript y desplegable en Azure Functions.

## Tecnologías utilizadas

- Node.js
- TypeScript
- Azure Functions v4
- Firebase Admin SDK
- Cloud Firestore
- JWT para autenticación
- Zod para validación
- Vitest para pruebas

## Comentarios de desarrollo

Para este proyecto separé la solución en capas para que la lógica de negocio no dependa del framework HTTP ni de Firestore.

La estructura principal es esta:

- `src/domain`: entidades y errores
- `src/application`: casos de uso y puertos
- `src/infrastructure`: Firestore, JWT, hash y configuración
- `src/http/azure`: handlers, validaciones y utilidades HTTP
- `src/functions`: registro de Azure Functions

Decisiones principales:

- Se usó Azure Functions porque el requerimiento pide cloud functions.
- Se mantuvo Firestore como persistencia.
- La autenticación de Firebase se configuró con variables de entorno (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`) para facilitar el despliegue fuera de Google Cloud.
- Las rutas quedan bajo `/api/v1/...` porque Azure Functions agrega `/api` por defecto.

## Variables de entorno

### Aplicación (`.env`)

- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `CORS_ORIGIN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

### Host local de Azure Functions (`local.settings.json`)

- `AzureWebJobsStorage`
- `FUNCTIONS_WORKER_RUNTIME=node`

## Ejecución local

```bash
npm install
cp .env.example .env
cp local.settings.example.json local.settings.json
npm run dev
```

## Pruebas

```bash
npm run typecheck
npm run test
```

## Endpoints principales

- `GET /api/v1/health`
- `POST /api/v1/auth/login`
- `GET /api/v1/users/exists?email=...`
- `POST /api/v1/users`
- `GET /api/v1/tasks`
- `POST /api/v1/tasks`
- `PUT /api/v1/tasks/{taskId}`
- `DELETE /api/v1/tasks/{taskId}`

## Despliegue

1. Crear una Function App en Azure con Node.js 22.
2. Configurar las Application Settings con las mismas variables del `.env`.
3. Publicar con Azure Functions Core Tools:

```bash
npm run build
func azure functionapp publish <NOMBRE_DE_LA_APP>
```
