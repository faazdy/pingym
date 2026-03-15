# Documento de Lógica de Negocio — GymSaaS

**Versión:** 1.0  
**Última actualización:** 2025

---

## 1. Visión y objetivo del producto

**GymSaaS** es una aplicación de gestión para gimnasios (Gym as a Service). Permite a un gimnasio administrar sus instalaciones, clientes, planes de membresía, rutinas de entrenamiento, asistencia, casilleros y comunicaciones, y permite a los clientes registrarse (incluso mediante QR), ver sus rutinas, progreso y asistencia.

**Objetivos de negocio:**

- Que un gimnasio pueda operar con una sola plataforma (clientes, planes, asistencia, casilleros, anuncios).
- Permitir el registro de clientes de forma ágil (incluido registro desde QR en sede).
- Diferenciar claramente los roles: administrador del gym, entrenador y cliente, con permisos coherentes.

---

## 2. Actores y roles

| Rol       | Descripción | Vinculación |
|-----------|-------------|-------------|
| **admin** | Administrador del gimnasio. Gestiona el gym, clientes, trainers, membresías, casilleros, y puede hacer todo lo que un trainer. | Siempre asociado a un `gym_id`. |
| **trainer** | Entrenador del gimnasio. Gestiona rutinas, asistencia, clientes (consulta), posts; no gestiona membresías ni casilleros ni alta/baja de trainers. | Siempre asociado a un `gym_id`. |
| **client** | Cliente. Puede estar vinculado a un gym (cliente de sede) o ser “independiente” (sin gym, solo usuario de la app). | `gym_id` puede ser NULL (independiente) o el UUID del gym. |

**Reglas de visibilidad:**

- Un usuario solo opera sobre datos de **su mismo gym** (mismo `gym_id`), salvo el cliente que solo accede a sus propios datos (perfil, rutinas asignadas, progreso, asistencia).
- Un cliente “independiente” (`gym_id` NULL) no ve funcionalidades que requieren gym (asistencia de sede, casilleros, posts del gym, etc.).

---

## 3. Modelo de dominio (entidades principales)

- **gyms:** Gimnasios (nombre, dirección, teléfono). Nombre único.
- **users:** Usuarios del sistema (nombre, email, contraseña, rol). Email único. Opcionalmente vinculados a un gym.
- **clients_profile:** Perfil extendido del cliente (teléfono, dirección, EPS, contacto de emergencia, foto). Un usuario con rol `client` tiene un perfil; puede tener `gym_id` NULL o del gym.
- **memberships:** Planes de membresía por gym (nombre, duración en días).
- **client_memberships:** Asignación de un plan a un cliente (fecha inicio, fecha fin, estado: `active` | `expired` | `pending`).
- **lockers:** Casilleros de un gym (número, estado: `available` | `occupied`).
- **client_lockers:** Asignación de casillero a cliente (fecha inicio; fecha fin al liberar).
- **exercises:** Catálogo global de ejercicios (nombre, grupo muscular, descripción).
- **routines:** Rutinas de entrenamiento (nombre, descripción, gym opcional, trainer opcional).
- **routine_exercises:** Ejercicios que componen una rutina (series, repeticiones, peso sugerido).
- **client_routines:** Asignación de rutina a cliente.
- **exercise_progress:** Registro de progreso (peso, repeticiones) por cliente y ejercicio.
- **posts:** Anuncios/publicaciones del gym (título, contenido, imagen, autor).
- **attendance:** Registro de asistencia (check-in) por gym y cliente.

Las relaciones y cascadas (por ejemplo borrado de gym → usuarios y perfiles) están definidas en el esquema de base de datos (`sql/init.sql`).

---

## 4. Reglas de negocio por dominio

### 4.1 Autenticación y usuarios

- **Registro público (`/api/auth/register`):**
  - **Caso 1 — Cliente sin gym:** Solo `name`, `email`, `password`. Se crea usuario `client` y perfil con `gym_id` NULL.
  - **Caso 2 — Cliente de un gym existente:** Se envía `gym` como **string** (UUID del gym). El cliente queda vinculado a ese gym. Pensado para registro desde QR en sede.
  - **Caso 3 — Crear gimnasio y administrador:** Se envía `gym` como **objeto** `{ name, address?, phone? }`. Se crea el gym (nombre único) y un usuario `admin` vinculado a ese gym.
- **Email:** Único en todo el sistema. No puede repetirse entre gyms.
- **Nombre del gym:** Único. No puede existir otro gym con el mismo nombre.
- **Registro interno (`/api/auth/register-user`):** Solo **admin**. Crea usuarios `trainer` o `client` vinculados al gym del admin. Si es `client`, se crea automáticamente su perfil en `clients_profile` con datos opcionales (teléfono, dirección, EPS, contacto de emergencia).

### 4.2 Gimnasios

- Solo un **admin** puede actualizar o eliminar su gym.
- Al eliminar un gym se eliminan en cascada usuarios, perfiles de clientes, membresías, casilleros, rutinas del gym, posts y registros de asistencia asociados.

### 4.3 Clientes y perfiles

- **Listar clientes:** Solo admin o trainer del **mismo gym**. La lista puede incluir estado de membresía activa y días restantes.
- **Ver/editar perfil de un cliente:** Un **cliente** solo puede ver/editar su propio perfil (según diseño actual, la edición desde el rol client puede estar restringida en la API a admin). Admin puede actualizar cualquier perfil de su gym (teléfono, dirección, EPS, contacto de emergencia).
- **Eliminar cliente:** Solo admin; se elimina por `user_id` (el usuario y en cascada su perfil).

### 4.4 Membresías

- **Planes:** Cada gym define sus propios planes (`name`, `duration_days`). Solo **admin** crea, edita o elimina planes.
- **Asignar membresía a un cliente:** Solo **admin**. Reglas:
  - El cliente y la membresía deben pertenecer al **mismo gym**.
  - Si el cliente ya tiene una membresía **activa**, se marca como `expired` y se crea la nueva con `start_date` = hoy y `end_date` = hoy + `duration_days`.
- **Estados:** `active`, `expired`, `pending`. Al consultar membresías de un cliente, las que ya pasaron su `end_date` y estaban en `active` se actualizan a `expired`.

### 4.5 Rutinas y ejercicios

- **Ejercicios:** Catálogo **global** (no por gym). Cualquier usuario autenticado puede listarlos. Solo **admin** (con gym) puede crear ejercicios nuevos.
- **Rutinas:** Pueden ser de un gym (`gym_id` + opcional `trainer_id`) o “independientes” (sin gym, por ejemplo trainer/cliente sin sede). Quien crea la rutina puede enviar `exercises` (array de `exercise_id`, sets, reps, suggested_weight) para crearla ya con ejercicios.
- **Asignar rutina a cliente:** Solo **admin o trainer** del mismo gym. No se puede asignar la misma rutina dos veces al mismo cliente (evitar duplicados).
- **Ver rutinas:** Un cliente ve “mis rutinas” (asignadas a él o creadas por él si es independiente). Admin/trainer ven rutinas del gym y pueden ver rutinas asignadas a un cliente (mismo gym o propio cliente).
- **Añadir/quitar ejercicios de una rutina:** Solo quien tenga permiso sobre esa rutina (mismo gym); el ID en la ruta de “quitar” es el de `routine_exercises`, no el del catálogo de ejercicios.

### 4.6 Asistencia

- **Check-in:** Solo **admin o trainer** del gym. Se registra por `client_id`; el cliente debe pertenecer al **mismo gym** que el usuario que hace el check-in.
- **Mi asistencia:** Un **cliente** con gym puede ver solo su propio historial de asistencias.
- **Historial del gym:** Admin o trainer pueden consultar por gym, con filtros opcionales por día (`day`) o semana (`week`, formato `YYYY-Wnn`). Sin filtro: últimos 30 días.

### 4.7 Casilleros (lockers)

- **Estados del casillero:** `available` | `occupied`. Solo se puede asignar un casillero en estado `available`.
- **Asignar:** Solo **admin**. El cliente y el casillero deben ser del **mismo gym**. Se crea registro en `client_lockers` con `end_date` NULL y el casillero pasa a `occupied`.
- **Liberar:** Solo **admin**. Se actualiza `end_date` en `client_lockers` y el casillero vuelve a `available`. No se elimina el casillero físico.
- **Eliminar casillero:** Solo **admin** y solo si el casillero no está `occupied`.
- **Número de casillero:** Debe ser único por gym (no puede haber dos casilleros con el mismo número en el mismo gym).
- Un cliente puede ver “mi casillero” (el que tiene asignado con `end_date` NULL).

### 4.8 Progreso (exercise_progress)

- **Registrar progreso:** Cualquier usuario autenticado puede registrar, pero un **cliente** solo puede registrar progreso para su propio `client_id`; admin/trainer pueden registrar para cualquier cliente de su gym.
- Se requiere al menos `weight` o `reps` (o ambos); `client_id` y `exercise_id` obligatorios.
- **Consultar progreso:** Admin o trainer del gym pueden ver el progreso de cualquier cliente del gym; un cliente solo el suyo. Opcionalmente se filtra por `exercise_id`.

### 4.9 Posts (anuncios del gym)

- **Crear/editar/eliminar:** Solo **admin o trainer** del gym. El post pertenece al gym del usuario y puede tener autor (`author_id`).
- **Ver:** Cualquier usuario autenticado que pertenezca al mismo gym puede ver los posts del gym y el detalle de un post por ID.

### 4.10 QR de registro

- **Endpoint público:** `GET /api/qr/register/:gym_id` devuelve `gym_id`, `gym_name` y `register_url` (URL del frontend con `?gym_id=...`) para generar un QR. No expone datos sensibles.
- **Endpoint seguro:** Mismo payload pero requiriendo JWT de **admin** del gym, por si se quiere restringir quién puede obtener la URL de registro.

---

## 5. Flujos principales

1. **Alta de un gimnasio y su administrador**  
   Registro público con `gym: { name, address?, phone? }` → se crea gym y usuario admin. Luego el admin inicia sesión y configura planes, trainers, etc.

2. **Registro de cliente en sede (QR)**  
   El gym muestra un QR que apunta a la URL de registro con `gym_id`. El cliente completa nombre, email y contraseña con `gym` = ese `gym_id` → se crea usuario client y perfil vinculados al gym.

3. **Alta de cliente o trainer desde el dashboard**  
   El admin usa “registrar usuario” con rol `trainer` o `client`; el backend usa el `gym_id` del token. Si es client, se crea el perfil con datos opcionales.

4. **Asignación de membresía**  
   Admin elige cliente y plan; si el cliente tenía membresía activa, se expira y se crea la nueva con vigencia según `duration_days`.

5. **Check-in de asistencia**  
   Admin o trainer selecciona al cliente y registra la entrada; se inserta un registro en `attendance` con el gym y el cliente.

6. **Asignación y liberación de casillero**  
   Admin asigna un casillero disponible a un cliente (mismo gym); cuando corresponda, libera el casillero y queda disponible de nuevo.

---

## 6. Restricciones y validaciones resumidas

- **Unicidad:** email (users), nombre del gym (gyms), número de casillero por gym.
- **Integridad:** cliente y membresía/casillero/rutina del gym deben ser del mismo gym cuando aplica.
- **Estados:** membresías se pasan a `expired` cuando `end_date` &lt; hoy; casilleros no se pueden asignar si están `occupied` ni eliminar si están ocupados.
- **Permisos:** todas las operaciones están protegidas por JWT y por rol (admin / admin o trainer / propio cliente) según el recurso.

---

## 7. Alcance y límites (para esta versión)

- **In scope:** Gestión de gyms, usuarios (admin, trainer, client), perfiles de clientes, planes y asignación de membresías, rutinas y ejercicios, asistencia, casilleros, progreso, posts y QR de registro.
- **Out of scope / mejoras futuras (ejemplos):** pagos, reserva de clases, notificaciones push, reportes avanzados, multi-sede por gym, renovación automática de membresías. Este documento no compromete implementación de esas funcionalidades.

---

*Este documento describe la lógica de negocio implementada en el backend y el uso esperado del frontend. Cualquier cambio de reglas debe reflejarse aquí y en la documentación técnica (API y README).*
