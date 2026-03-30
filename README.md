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
- **Seguridad de contraseñas**: `bcrypt`
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
│   └── package.json
└── server/
    ├── src/
    │   ├── config/
    │   ├── controllers/
    │   ├── emails/
    │   ├── middlewares/
    │   ├── models/
    │   ├── routes/
    │   ├── utils/
    │   ├── index.ts
    │   └── server.ts
    └── package.json
```

## Variables de Entorno

### Backend (`server/.env`)

Definir al menos:

```env
PORT=4000
DATABASE_URI=
CLIENT_URL=

ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
```

### Frontend (`client/.env.local`)

```env
VITE_API_URL=http://localhost:4000/api
```

## Instalación y Ejecución

> Recomendado: usar `pnpm` (el proyecto incluye `pnpm-lock.yaml`).

### 1) Instalar dependencias

```bash
# Backend
cd server
pnpm install

# Frontend
cd ../client
pnpm install
```

### 2) Ejecutar en desarrollo

Terminal 1 (backend):

```bash
cd server
pnpm dev
```

Terminal 2 (frontend):

```bash
cd client
pnpm dev
```

Frontend por defecto: `http://localhost:5173`  
Backend por `.env`: `http://localhost:<PORT>`

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

