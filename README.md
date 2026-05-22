# UpTask Backend + Frontend (Cookies/JWT)

Aplicación full stack para gestión de proyectos y tareas, con autenticación basada en `access token` + `refresh token` (cookie `HttpOnly`) y recuperación de contraseña por token temporal.

Este proyecto está basado en una capacitación de Udemy de **Juan Pablo De la Torre Valdez** y fue adaptado/extedido en esta versión para trabajar con flujo de autenticación con cookies.

## Tabla de Contenidos

- [Arquitectura General](#arquitectura-general)
- [Separación por Capas](#separación-por-capas)
- [Tecnologías y Librerías Principales](#tecnologías-y-librerías-principales)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Variables de Entorno](#variables-de-entorno)
- [Instalación y Ejecución](#instalación-y-ejecución)
- [Flujos Funcionales Clave](#flujos-funcionales-clave)
- [Notas Técnicas](#notas-técnicas)

## Arquitectura General

El repositorio está dividido en dos aplicaciones:

- `server`: API REST en Node.js/Express con MongoDB.
- `client`: SPA en React + Vite que consume la API.

Comunicación:

- El frontend consume el backend vía `axios`.
- El backend emite:
  - `access token` (respuesta JSON, corta duración).
  - `refresh token` (cookie `HttpOnly`, mayor duración).

## Separación por Capas

### Backend (`server/src`)

- **`routes/`**: define endpoints HTTP y validaciones de entrada.
- **`controllers/`**: orquesta casos de uso (auth, proyectos, tareas, equipos, notas).
- **`models/`**: esquemas de MongoDB con Mongoose.
- **`middlewares/`**: autenticación, autorización y validación de requests.
- **`config/`**: conexión DB, CORS, cookies, nodemailer.
- **`utils/`**: helpers de JWT, hash de contraseñas y generación de token numérico.
- **`emails/`**: plantillas/servicios para envío de correo transaccional.

### Frontend (`client/src`)

- **`router.tsx`**: definición de rutas públicas/privadas.
- **`layouts/`**: shells de navegación por contexto (auth/app/profile).
- **`views/`**: pantallas por ruta.
- **`components/`**: UI reutilizable y formularios.
- **`services/`**: capa de acceso a API (axios + funciones por dominio).
- **`hooks/`**: hooks personalizados (ej. autenticación).
- **`lib/`**: configuración base de cliente HTTP e interceptores.
- **`types/`**: tipado compartido para payloads y entidades.
- **`utils/`**: helpers y políticas auxiliares del cliente.

## Tecnologías y Librerías Principales

### Backend

- **Runtime y lenguaje**: Node.js + TypeScript
- **Framework**: Express
- **Base de datos**: MongoDB + Mongoose
- **Autenticación**: `jsonwebtoken`
- **Seguridad de contraseñas**: `bcryptjs`
- **Validación de requests**: `express-validator`
- **CORS y cookies**: `cors`, `cookie-parser`
- **Email transaccional**: `nodemailer`
- **Logging**: `morgan`
- **Entorno**: `dotenv`

### Frontend

- **UI runtime**: React 19 + TypeScript
- **Build tool**: Vite
- **Routing**: `react-router-dom`
- **Data fetching/cache**: `@tanstack/react-query`
- **HTTP client**: `axios`
- **Formularios**: `react-hook-form`
- **Validación de esquemas**: `zod`
- **Notificaciones**: `react-toastify`
- **UI/UX**: Tailwind CSS, Headless UI, Heroicons
- **DnD de tareas**: `@dnd-kit/core`
- **Ingreso de código PIN**: `@chakra-ui/pin-input`

## Estructura del Proyecto

```bash
uptask-backend-cookies/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── lib/
│   │   ├── services/
│   │   ├── types/
│   │   ├── views/
│   │   └── router.tsx
│   ├── Dockerfile
│   └── package.json
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── emails/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── index.ts
│   │   └── server.ts
│   ├── Dockerfile
│   └── package.json
└── infra/
    ├── docker-compose.yml
    └── .env
```

## Variables de Entorno

El proyecto usa **tres** archivos `.env`, cada uno consumido por una herramienta distinta. Ninguno se versiona (están en `.gitignore`).

### Orquestación (`infra/.env`)

Lo lee Docker Compose para interpolar el `docker-compose.yml` (mapeo de puertos al host).

```env
SERVER_PORT=3000
CLIENT_PORT=5173
MONGO_PORT=27017
```

### Backend (`server/.env`)

Lo lee el contenedor del servidor (vía `env_file`). Contiene la configuración y los secretos del backend.

```env
PORT=3000
NODE_ENV=development
DATABASE_URI=mongodb://mongo:27017/uptask
CLIENT_URL=http://localhost:5173

ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
```

> En `DATABASE_URI`, el host `mongo` es el nombre del servicio en Docker Compose: se resuelve dentro de la red interna de los contenedores. No uses `localhost` ahí.

### Frontend (`client/.env.local`)

Lo lee Vite. Apunta al backend desde el navegador (host), por eso `localhost`.

```env
VITE_API_URL=http://localhost:3000/api
```

## Instalación y Ejecución

El entorno de desarrollo está dockerizado: un solo comando levanta el frontend, el backend y MongoDB.

### Requisitos

- Docker y Docker Compose.

### 1) Crear los archivos `.env`

Creá los tres archivos descritos en [Variables de Entorno](#variables-de-entorno): `infra/.env`, `server/.env` y `client/.env.local`. Completá los secretos del backend (JWT y SMTP).

### 2) Levantar el proyecto

```bash
cd infra
docker compose up -d
```

La primera vez construye las imágenes y descarga MongoDB (tarda unos minutos). El código se monta por bind mount: los cambios se reflejan con hot reload, sin reconstruir.

| Servicio | URL |
|----------|-----|
| Frontend (Vite) | `http://localhost:5173` |
| Backend (API) | `http://localhost:3000` |
| MongoDB | `localhost:27017` |

### Comandos útiles

```bash
docker compose up -d --build    # reconstruir tras cambiar dependencias
docker compose logs -f server   # ver logs de un servicio en vivo
docker compose down             # detener y borrar los contenedores
docker compose down -v          # además borra el volumen (datos de MongoDB)
```

> Instalar dependencias con `pnpm install` en tu máquina solo hace falta para el soporte del editor (IntelliSense). La aplicación corre dentro de los contenedores.

## Flujos Funcionales Clave

- **Registro y confirmación de cuenta**
  - Registro de usuario.
  - Envío de token por email.
  - Confirmación vía código.

- **Login con sesión híbrida (JWT + cookie)**
  - `access token` para autorizaciones API.
  - `refresh token` en cookie `HttpOnly`.
  - Renovación automática de sesión con interceptor en `axios`.

- **Recuperación de contraseña**
  - Solicitud por email.
  - Token temporal (TTL en MongoDB).
  - Validación de token y cambio de contraseña.

- **Gestión de proyectos y tareas**
  - CRUD de proyectos.
  - Creación/edición/movimiento de tareas.
  - Colaboración por equipo y notas.

## Notas Técnicas

- En `Token`, usar `default: Date.now` (sin paréntesis) para que `createdAt` se calcule por documento y funcione correctamente el TTL.
- El backend habilita `credentials: true` en CORS y el cliente usa `withCredentials: true` en axios para soportar refresh token por cookie.
- El cliente redirige a login si falla el refresh token.

