# PinGym - GymSaaS — Documentación completa

**v1.0.0 · Backend + Frontend**

API REST para gestión de gimnasios: autenticación, clientes, membresías, rutinas, asistencia, casilleros, progreso, posts y más. Frontend en Vue 3 + Vite.

> **Backend:** `http://localhost:3000` · **Frontend:** `http://localhost:5173`

---

## Índice

- [Stack tecnológico](#stack-tecnológico)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Iniciar el proyecto desde la raíz](#iniciar-el-proyecto-desde-la-raíz)
- [API Reference](#api-reference)
- [Autenticación JWT](#autenticación-con-jwt)
- [Frontend (Vue 3 + Vite)](#frontend-vue-3--vite)
- [Ejemplos de uso de la API](#ejemplos-de-uso-de-la-api)
- [Códigos de error](#códigos-de-error)

---

## Stack tecnológico

| Área | Tecnología |
|------|------------|
| Backend | Node.js + Express 5 (ESM) |
| Base de datos | PostgreSQL (postgres.js) |
| Auth | JWT + bcrypt |
| Frontend | Vue 3 + Vite 7 |
| Estado | Pinia |
| HTTP cliente | Axios |

---

## Estructura del proyecto
Arquitectura por capas.

```
gymsaas/
├── package.json           # Scripts raíz: build, start backend/frontend
├── docker-compose.yml     # Postgres local + init sql
├── backend/
│   ├── app.js             # Express, CORS, rutas API
│   ├── .env               # Variables de entorno (no subir a Git)
│   ├── config/db.js       # Conexión PostgreSQL
│   ├── src/server.js      # Arranque del servidor
│   ├── routes/            # auth, clients, memberships, routines, attendance, lockers, progress, posts, exercises, qr, trainers
│   ├── controllers/
│   └── middleware/auth.middleware.js
├── frontend/
│   ├── src/
│   │   ├── main.js
│   │   ├── App.vue
│   │   ├── services/api.js  # Axios con baseURL e interceptores
│   │   ├── stores/auth.store.js
│   │   ├── router/routes.js
│   │   └── pages/           # Login, Register, dashboard/*
│   ├── .env
│   └── vite.config.js
├── sql/
│   └── init.sql            # Schema de la base de datos
└── docs/
    ├── index.html          # Documentación (HTML)
    └── README.md           # Esta documentación (Markdown)
```

---

## Iniciar el proyecto desde la raíz

En la **carpeta raíz del proyecto** (donde está el `package.json` principal).

### 1. Instalar dependencias (backend y frontend)

```bash
# Instala en backend y frontend a la vez
npm run start:project
```

O por separado:

```bash
npm run build:backend   # cd backend && npm install
npm run build:frontend  # cd frontend && npm install
```

### 2. Configurar variables de entorno

Crea `backend/.env` con al menos:

```env
# Conexión PostgreSQL (si usas Docker local → ver paso 3 Opción A; si usas producción → tu URL)
DATABASE_URL=postgresql://usuario:password@host:puerto/nombre_base

# Servidor
PORT=3000

# JWT (string largo aleatorio, recomendable un UUID)
JWT_SECRET=tu-secreto-superseguro

# Opcional: URL del frontend (para QR de registro)
FRONTEND_URL=http://localhost:5173
```

> ⚠️ No subas `.env` a Git. Debe estar en `.gitignore`.

### 3. Crear la base de datos

Puedes usar una base de datos **local con Docker** (recomendado para desarrollo) o una base **en producción** (Supabase, etc.).

#### Opción A — Base de datos local con Docker Compose (recomendado)

Desde la **carpeta raíz del proyecto**, levanta PostgreSQL con el `docker-compose.yml`. El contenedor monta la carpeta `sql/` como scripts de inicialización, así que `sql/init.sql` se ejecuta solo la primera vez. No necesitas credenciales de producción.

```bash
# En la raíz del proyecto (donde está docker-compose.yml)
npm run docker:init
```

Esto ejecuta `docker compose up -d`: Postgres queda en `localhost:5432`, usuario `postgres`, contraseña `gymsaaspass123`, base de datos `gymsaas`. En `backend/.env` usa:

```env
DATABASE_URL=postgresql://postgres:gymsaaspass123@localhost:5432/gymsaas
```

Comandos útiles:

```bash
npm run docker:stop    # Detener contenedores
npm run docker:restart # Reiniciar (down + up -d)
```

> ✅ Con esta opción no necesitas configurar Supabase ni ninguna DB en la nube para empezar a desarrollar.

#### Opción B — Base de datos en producción

Si prefieres usar una base de datos ya desplegada (por ejemplo Supabase): crea el proyecto y la base, luego ejecuta manualmente el contenido de `sql/init.sql` en el SQL Editor del proveedor. En `backend/.env` configura `DATABASE_URL` con las credenciales que te proporcione el servicio (usuario, contraseña, host, puerto y nombre de la base).

```env
DATABASE_URL=postgresql://usuario:password@host:puerto/nombre_base
```

### 4. Arrancar backend y frontend

```bash
# Terminal 1 — Backend
npm run start:backend

# Terminal 2 — Frontend
npm run start:frontend
```

Backend quedará en `http://localhost:3000`, frontend en `http://localhost:5173`.

> ✅ En la consola del backend deberías ver: `Servidor corriendo en puerto 3000` y `DB conectada: [...]`

---

## API Reference

Base URL: `http://localhost:3000/api`

### Auth — `/api/auth`

Registro, login y CRUD de usuarios y gyms.

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/auth/register` | Público | Registro: (1) sin gym, (2) con `gym` = UUID, (3) con `gym` = `{ name, address?, phone? }` → crea gym + admin |
| POST | `/api/auth/login` | Público | Login. Body: `{ email, password }`. Devuelve `{ token, user }`. JWT 7 días |
| POST | `/api/auth/register-user` | 🔒 Admin | Registrar trainer o client. Body: `name`, `email`, `password`, `role` (trainer \| client), opc. `phone`, `address`, `eps`, `emergency_contact` |
| PUT | `/api/auth/gym/:id_gym` | 🔒 Admin | Actualizar gym. Body: `name_gym`, `address`, `phone` |
| DELETE | `/api/auth/gym/:id_gym` | 🔒 Admin | Eliminar gym (cascada) |
| PUT | `/api/auth/user/:id_user` | 🔒 Admin | Actualizar usuario. Body: `name`, `email` |
| DELETE | `/api/auth/user/:id_user` | 🔒 Admin | Eliminar usuario (cascada) |

**Register — Body (crear gym + admin):**

```json
{
  "name": "Admin Gym",
  "email": "admin@gym.com",
  "password": "secret123",
  "gym": {
    "name": "Iron Gym",
    "address": "Calle 72 #10-30",
    "phone": "601 456 7890"
  }
}
```

**Login — Respuesta 200:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id", "name", "email", "role",
    "gym_id", "gym_name", "client_profile_id"
  }
}
```

---

### Clients — `/api/clients`

Todos requieren JWT. Admin o trainer: mismo gym. Cliente: solo su propio perfil donde aplique.

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/clients/:gym_id` | Admin/Trainer | Lista de clientes del gym con perfil, membresía activa y días restantes |
| GET | `/api/clients/detail/:id_client` | JWT | Un cliente por ID de perfil. Cliente solo el suyo |
| PUT | `/api/clients/detail/:id_client` | Admin | Actualizar perfil. Body: `phone`, `address`, `eps`, `emergency_contact` |
| DELETE | `/api/clients/:id_user` | Admin | Eliminar cliente (parámetro es `user_id`) |

---

### Memberships — `/api/memberships`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/memberships/gym/:gym_id` | Admin/Trainer | Lista de planes del gym |
| POST | `/api/memberships` | Admin | Crear membresía. Body: `name`, `duration_days` |
| POST | `/api/memberships/assign` | Admin | Asignar a cliente. Body: `client_id`, `membership_id` |
| GET | `/api/memberships/client/:client_id` | JWT | Membresías del cliente (días restantes) |
| PUT | `/api/memberships/:id` | Admin | Actualizar. Body: `name`, `duration_days` |
| DELETE | `/api/memberships/:id` | Admin | Eliminar membresía |

---

### Routines — `/api/routines`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/routines/gym/:gym_id` | Admin/Trainer + gym | Rutinas del gym |
| GET | `/api/routines/my` | JWT | Mis rutinas (asignadas o creadas por mí) |
| GET | `/api/routines/exercises` | JWT | Catálogo global de ejercicios |
| POST | `/api/routines` | JWT | Crear rutina. Body: `name`, `description?`, `trainer_id?`, `exercises?` (array `{ exercise_id, sets?, reps?, suggested_weight? }`) |
| GET | `/api/routines/:routine_id/exercises` | JWT | Ejercicios de una rutina |
| POST | `/api/routines/assign` | Admin/Trainer | Asignar a cliente. Body: `client_id`, `routine_id` |
| GET | `/api/routines/client/:client_id` | JWT | Rutinas asignadas a un cliente |
| POST | `/api/routines/:routine_id/exercises` | JWT | Añadir ejercicio. Body: `exercise_id`, `sets?`, `reps?`, `suggested_weight?` |
| DELETE | `/api/routines/:routine_id/exercises/:exercise_id` | JWT | Quitar ejercicio (ID en routine_exercises) |

---

### Attendance — `/api/attendance`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/attendance/check-in` | Admin/Trainer | Registrar entrada. Body: `client_id` |
| GET | `/api/attendance/my` | JWT | Mi historial de asistencia |
| GET | `/api/attendance/:gym_id?day=YYYY-MM-DD&week=YYYY-Wnn` | Admin/Trainer | Historial del gym. Sin query: últimos 30 días |

---

### Lockers — `/api/lockers`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/lockers/my` | JWT + gym | Mi casillero asignado |
| GET | `/api/lockers/:gym_id` | Admin | Lista de casilleros del gym |
| POST | `/api/lockers` | Admin | Crear casillero. Body: `locker_number` |
| POST | `/api/lockers/assign` | Admin | Asignar. Body: `client_id`, `locker_id` |
| POST | `/api/lockers/release` | Admin | Liberar. Body: `client_id`, `locker_id` |
| DELETE | `/api/lockers/:id` | Admin | Eliminar (solo si no está ocupado) |

---

### Progress — `/api/progress`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/progress` | JWT | Registrar progreso. Body: `client_id`, `exercise_id`, `weight?`, `reps?`. Cliente solo su propio client_id |
| GET | `/api/progress/client/:client_id?exercise_id=uuid` | JWT | Progreso de un cliente (query opcional exercise_id) |

---

### Posts — `/api/posts`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/posts/gym/:gym_id` | JWT + mismo gym | Posts del gym |
| GET | `/api/posts/detail/:id` | JWT | Un post por ID |
| POST | `/api/posts` | Admin/Trainer | Crear. Body: `title`, `content?`, `image?` |
| PUT | `/api/posts/:id` | Admin/Trainer | Actualizar. Body: `title`, `content`, `image` |
| DELETE | `/api/posts/:id` | Admin/Trainer | Eliminar post |

---

### Exercises — `/api/exercises`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/exercises` | JWT | Lista de ejercicios (catálogo global) |
| POST | `/api/exercises` | Admin + gym | Crear. Body: `name`, `muscle_group?`, `description?` |

---

### QR — `/api/qr`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/qr/register/:gym_id` | Público | Datos para QR: `gym_id`, `gym_name`, `register_url` |
| GET | `/api/qr/register/:gym_id/secure` | Admin | Mismo payload con token |

---

### Trainers — `/api/trainers`

Solo admin (gym_id del token).

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/trainers` | Admin | Lista de trainers del gym |
| POST | `/api/trainers` | Admin | Registrar. Body: `name`, `email`, `password` |
| PUT | `/api/trainers/:id` | Admin | Actualizar. Body: `name`, `email` |
| DELETE | `/api/trainers/:id` | Admin | Eliminar trainer |

---

## Autenticación con JWT

Endpoints protegidos requieren el header:

```
Authorization: Bearer <token>
```

El token se obtiene con `POST /api/auth/login`. Contiene `id`, `role`, `gym_id`, `client_profile_id`. Expira en 7 días.

| Código | Motivo |
|--------|--------|
| 401 | Falta token o token inválido/expirado |
| 403 | Rol insuficiente o recurso de otro gym |

---

## Frontend (Vue 3 + Vite)

El frontend usa `VITE_API_URL` (por defecto `http://localhost:3000/api`).

### Servicio API

`frontend/src/services/api.js`: instancia de Axios con `baseURL`, interceptor de request que añade `Authorization: Bearer <token>` desde `localStorage`, e interceptor de response que ante 401 limpia token y redirige a `/login`.

```javascript
import api from '@/services/api.js'

const { data } = await api.get('/clients/' + gymId)
const { data } = await api.post('/auth/register', body)
```

### Rutas y roles

| Ruta | Vista | Requisitos |
|------|-------|------------|
| `/login`, `/register` | Login, Register | Invitado (si ya hay sesión → dashboard) |
| `/dashboard` | Dashboard | Auth |
| `/clients` | ClientPage | Auth, gym, admin o trainer |
| `/trainers` | TrainersView | Auth, gym, admin o trainer |
| `/memberships` | MembershipsView | Auth, gym, admin |
| `/routines` | RoutinesView | Auth |
| `/attendance` | AttendanceView | Auth, gym |
| `/lockers` | LockersView | Auth, gym |
| `/progress` | ProgressView | Auth |
| `/posts` | PostsView | Auth, gym |
| `/qr` | QrView | Auth, gym, admin |

El store `auth.store.js` guarda usuario y token; el router comprueba `requiresAuth`, `requiresGym` y `roles` antes de entrar a cada ruta.

---

## Ejemplos de uso de la API

### 1. Login (fetch)

```javascript
const res = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@gym.com', password: 'secret123' })
})
const data = await res.json()
localStorage.setItem('token', data.token)
```

### 2. Registrar gym + admin (público)

```javascript
const res = await fetch('http://localhost:3000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Admin',
    email: 'admin@gym.com',
    password: 'pass123',
    gym: { name: 'Iron Gym', address: 'Calle 1', phone: '600 111 2222' }
  })
})
const { user, gym } = await res.json()
```

### 3. Obtener clientes del gym (con token)

```javascript
const token = localStorage.getItem('token')
const res = await fetch(`http://localhost:3000/api/clients/${gymId}`, {
  headers: { 'Authorization': `Bearer ${token}` }
})
const clientes = await res.json()
```

### 4. Asignar membresía a cliente

```javascript
await fetch('http://localhost:3000/api/memberships/assign', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ client_id: clientId, membership_id: membershipId })
})
```

### 5. Check-in de asistencia

```javascript
await fetch('http://localhost:3000/api/attendance/check-in', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ client_id: clientId })
})
```

### 6. Crear rutina con ejercicios

```javascript
const res = await fetch('http://localhost:3000/api/routines', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'Rutina fuerza',
    description: '3 días por semana',
    exercises: [
      { exercise_id: exerciseUuid1, sets: 3, reps: 10, suggested_weight: 60 },
      { exercise_id: exerciseUuid2, sets: 3, reps: 12 }
    ]
  })
})
const rutina = await res.json()
```

### 7. Registrar progreso

```javascript
await fetch('http://localhost:3000/api/progress', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    client_id: clientId,
    exercise_id: exerciseId,
    weight: 70,
    reps: 8
  })
})
```

### 8. Obtener datos para QR de registro (público)

```javascript
const res = await fetch(`http://localhost:3000/api/qr/register/${gymId}`)
const { gym_id, gym_name, register_url } = await res.json()
// register_url = frontend + ?gym_id=...
```

---

## Códigos de error

| Código | Significado | Cuándo |
|--------|-------------|--------|
| 400 | Bad Request | Campos requeridos faltantes o formato inválido |
| 401 | Unauthorized | Sin token o token inválido/expirado |
| 403 | Forbidden | Rol insuficiente o recurso de otro gym |
| 404 | Not Found | Recurso no existe |
| 409 | Conflict | Email/gym duplicado, casillero ocupado, etc. |
| 500 | Server Error | Error interno (mensaje en `error` o `message`) |

Las respuestas de error suelen ser JSON con `message` o `error`.
