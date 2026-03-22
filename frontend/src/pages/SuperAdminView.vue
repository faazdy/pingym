<template>
  <div class="sa">

    <!-- Sidebar -->
    <aside class="sa-sidebar">
      <div class="sa-sidebar__logo">
        <img src="/logo.png" alt="Logo" class="sa-sidebar__img" />
        <span class="sa-sidebar__badge">Superadmin</span>
      </div>
      <nav class="sa-sidebar__nav">
        <button :class="['sa-nav-btn', tab === 'overview' && 'sa-nav-btn--active']" @click="tab = 'overview'">
          <span>⬡</span> Overview
        </button>
        <button :class="['sa-nav-btn', tab === 'gyms' && 'sa-nav-btn--active']" @click="tab = 'gyms'">
          <span>◎</span> Gyms
        </button>
        <button :class="['sa-nav-btn', tab === 'create' && 'sa-nav-btn--active']" @click="tab = 'create'">
          <span>＋</span> Nuevo gym
        </button>
      </nav>
      <button class="sa-logout" @click="handleLogout">⎋ Cerrar sesión</button>
    </aside>

    <!-- Main -->
    <main class="sa-main">

      <!-- Overview -->
      <section v-if="tab === 'overview'">
        <div class="sa-header">
          <span class="sa-tag">Panel de control</span>
          <h1 class="sa-title">PinGym Admin Dashboard</h1>
        </div>

        <div class="sa-stats">
          <div class="sa-stat sa-stat--dark">
            <p class="sa-stat__label">Gyms activos</p>
            <p class="sa-stat__value">{{ stats.gyms ?? '—' }}</p>
          </div>
          <div class="sa-stat">
            <p class="sa-stat__label">Usuarios totales</p>
            <p class="sa-stat__value">{{ stats.users ?? '—' }}</p>
          </div>
          <div class="sa-stat">
            <p class="sa-stat__label">Clientes</p>
            <p class="sa-stat__value">{{ stats.clients ?? '—' }}</p>
          </div>
          <div class="sa-stat">
            <p class="sa-stat__label">Rutinas</p>
            <p class="sa-stat__value">{{ stats.routines ?? '—' }}</p>
          </div>
        </div>

        <div class="sa-section">
          <div class="sa-section__header">
            <p class="sa-section__title">Gyms registrados</p>
            <button class="sa-btn sa-btn--primary" @click="tab = 'create'">+ Nuevo gym</button>
          </div>
          <div class="sa-table-wrap">
            <table class="sa-table">
              <thead>
                <tr>
                  <th>Gym</th>
                  <th>Admin</th>
                  <th>Email admin</th>
                  <th>Creado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="gymsLoading"><td colspan="5" class="sa-table__empty">Cargando...</td></tr>
                <tr v-else-if="gyms.length === 0"><td colspan="5" class="sa-table__empty">No hay gyms registrados</td></tr>
                <tr v-for="g in gyms" :key="g.id" class="sa-table__row">
                  <td class="sa-table__name">{{ g.name }}</td>
                  <td class="sa-table__sub">{{ g.admin?.name || '—' }}</td>
                  <td class="sa-table__sub">{{ g.admin?.email || '—' }}</td>
                  <td class="sa-table__sub">{{ formatDate(g.created_at) }}</td>
                  <td class="sa-table__actions">
                    <button class="sa-action sa-action--danger" @click="handleDeleteGym(g)">Eliminar</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- Gyms tab -->
      <section v-if="tab === 'gyms'">
        <div class="sa-header">
          <span class="sa-tag">Gestión</span>
          <h1 class="sa-title">Gyms registrados</h1>
        </div>

        <div class="sa-toolbar">
          <input class="sa-search" v-model="search" placeholder="Buscar gym..." />
          <span class="sa-count">{{ filteredGyms.length }} gyms</span>
        </div>

        <div class="sa-table-wrap">
          <table class="sa-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Dirección</th>
                <th>Teléfono</th>
                <th>Admin</th>
                <th>Email</th>
                <th>Creado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="gymsLoading"><td colspan="7" class="sa-table__empty">Cargando...</td></tr>
              <tr v-else-if="filteredGyms.length === 0"><td colspan="7" class="sa-table__empty">Sin resultados</td></tr>
              <tr v-for="g in filteredGyms" :key="g.id" class="sa-table__row">
                <td class="sa-table__name">{{ g.name }}</td>
                <td class="sa-table__sub">{{ g.address || '—' }}</td>
                <td class="sa-table__sub">{{ g.phone || '—' }}</td>
                <td class="sa-table__sub">{{ g.admin?.name || '—' }}</td>
                <td class="sa-table__sub">{{ g.admin?.email || '—' }}</td>
                <td class="sa-table__sub">{{ formatDate(g.created_at) }}</td>
                <td class="sa-table__actions">
                  <button class="sa-action sa-action--danger" @click="handleDeleteGym(g)">Eliminar</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Crear gym -->
      <section v-if="tab === 'create'">
        <div class="sa-header">
          <span class="sa-tag">Nuevo</span>
          <h1 class="sa-title">Registrar gym</h1>
        </div>

        <div class="sa-form-wrap">
          <form class="sa-form" @submit.prevent="handleCreateGym">

            <div class="sa-form__group">
              <p class="sa-form__group-title">Datos del gym</p>
              <div class="sa-form__fields">
                <div class="field">
                  <label class="field__label">Nombre del gym</label>
                  <input class="field__input" v-model="gymForm.gym.name" placeholder="Ej: Iron Gym Bogotá" required />
                </div>
                <div class="fields-row">
                  <div class="field">
                    <label class="field__label">Dirección</label>
                    <input class="field__input" v-model="gymForm.gym.address" placeholder="Calle 123 #45-67" />
                  </div>
                  <div class="field">
                    <label class="field__label">Teléfono</label>
                    <input class="field__input" v-model="gymForm.gym.phone" placeholder="+57 300 000 0000" />
                  </div>
                </div>
              </div>
            </div>

            <div class="sa-form__group">
              <p class="sa-form__group-title">Cuenta del administrador</p>
              <div class="sa-form__fields">
                <div class="field">
                  <label class="field__label">Nombre del admin</label>
                  <input class="field__input" v-model="gymForm.admin.name" placeholder="Nombre completo" required />
                </div>
                <div class="fields-row">
                  <div class="field">
                    <label class="field__label">Email</label>
                    <input class="field__input" v-model="gymForm.admin.email" type="email" placeholder="admin@gym.com" required />
                  </div>
                  <div class="field">
                    <label class="field__label">Contraseña</label>
                    <input class="field__input" v-model="gymForm.admin.password" type="password" placeholder="••••••••" required />
                  </div>
                </div>
              </div>
            </div>

            <p v-if="createError" class="form__error">{{ createError }}</p>
            <p v-if="createSuccess" class="sa-success">{{ createSuccess }}</p>

            <div class="sa-form__footer">
              <button type="button" class="sa-btn sa-btn--ghost" @click="resetGymForm">Limpiar</button>
              <button type="submit" class="sa-btn sa-btn--primary" :disabled="createLoading">
                {{ createLoading ? 'Creando...' : 'Crear gym y admin' }}
              </button>
            </div>
          </form>
        </div>
      </section>

    </main>

    <!-- Toast -->
    <div v-if="toast" class="sa-toast" :class="toast.type === 'success' ? 'sa-toast--success' : 'sa-toast--error'">
      {{ toast.message }}
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth.store";
import api from "../services/api";

const auth = useAuthStore();
const router = useRouter();

const tab = ref("overview");
const gyms = ref([]);
const stats = ref({});
const gymsLoading = ref(false);
const search = ref("");
const toast = ref(null);
const createLoading = ref(false);
const createError = ref("");
const createSuccess = ref("");

const gymForm = ref({
  gym: { name: "", address: "", phone: "" },
  admin: { name: "", email: "", password: "" }
});

const filteredGyms = computed(() =>
  gyms.value.filter(g =>
    g.name?.toLowerCase().includes(search.value.toLowerCase()) ||
    g.admin?.email?.toLowerCase().includes(search.value.toLowerCase())
  )
);

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
}

function showToast(message, type = "success") {
  toast.value = { message, type };
  setTimeout(() => toast.value = null, 3000);
}

async function fetchGyms() {
  gymsLoading.value = true;
  try {
    const { data } = await api.get("/superadmin/gyms");
    gyms.value = data;
  } catch (err) { console.error(err); }
  finally { gymsLoading.value = false; }
}

async function fetchStats() {
  try {
    const { data } = await api.get("/superadmin/stats");
    stats.value = data;
  } catch (err) { console.error(err); }
}

async function handleCreateGym() {
  createError.value = "";
  createSuccess.value = "";
  createLoading.value = true;
  try {
    const { data } = await api.post("/superadmin/create-gym", gymForm.value);
    createSuccess.value = `Gym "${data.gym.name}" creado con admin ${data.admin.email}`;
    resetGymForm();
    fetchGyms();
    fetchStats();
    showToast("Gym creado correctamente");
  } catch (err) {
    createError.value = err.response?.data?.message || "Error al crear";
  } finally {
    createLoading.value = false;
  }
}

async function handleDeleteGym(g) {
  if (!confirm(`¿Eliminar "${g.name}" y todos sus datos? Esta acción no se puede deshacer.`)) return;
  try {
    await api.delete(`/superadmin/gyms/${g.id}`);
    fetchGyms();
    fetchStats();
    showToast("Gym eliminado");
  } catch (err) {
    showToast(err.response?.data?.message || "Error al eliminar", "error");
  }
}

function resetGymForm() {
  gymForm.value = {
    gym: { name: "", address: "", phone: "" },
    admin: { name: "", email: "", password: "" }
  };
}

function handleLogout() {
  auth.logout();
  router.push("/login");
}

onMounted(() => {
  fetchGyms();
  fetchStats();
});
</script>

<style scoped>
/* ── Layout ── */
.sa {
  display: flex;
  min-height: 100vh;
  font-family: var(--font-sans);
  background: #f4f4f2;
}

/* ── Sidebar ── */
.sa-sidebar {
  width: 220px;
  min-height: 100vh;
  background: #0f0f0f;
  display: flex;
  flex-direction: column;
  padding: 28px 16px;
  position: fixed;
  top: 0;
  left: 0;
}

.sa-sidebar__logo {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 32px;
  padding: 0 8px;
}

.sa-sidebar__img {
  height: 28px;
  width: auto;
  object-fit: contain;
  filter: brightness(0) invert(1);
  opacity: 0.9;
}

.sa-sidebar__badge {
  font-family: var(--font-mono);
  font-size: 9px;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.3);
}

.sa-sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.sa-nav-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 8px;
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 500;
  color: rgba(255,255,255,0.45);
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s;
  width: 100%;
}

.sa-nav-btn:hover { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.8); }
.sa-nav-btn--active { background: rgba(255,255,255,0.1); color: #fff; }

.sa-logout {
  font-family: var(--font-sans);
  font-size: 12px;
  color: rgba(255,255,255,0.3);
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px 10px;
  border-radius: 8px;
  text-align: left;
  transition: all 0.15s;
}
.sa-logout:hover { color: #e5484d; background: rgba(229,72,77,0.08); }

/* ── Main ── */
.sa-main {
  margin-left: 220px;
  flex: 1;
  padding: 40px 5%;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.sa-header { display: flex; flex-direction: column; gap: 4px; }

.sa-tag {
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-meta);
}

.sa-title {
  font-size: 26px;
  font-weight: 700;
  color: var(--color-text);
  letter-spacing: -0.03em;
}

/* ── Stats ── */
.sa-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.sa-stat {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sa-stat--dark {
  background: #111;
  border-color: #111;
}

.sa-stat__label {
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-meta);
}

.sa-stat--dark .sa-stat__label { color: rgba(255,255,255,0.35); }

.sa-stat__value {
  font-size: 36px;
  font-weight: 700;
  color: var(--color-text);
  letter-spacing: -0.04em;
  line-height: 1;
}

.sa-stat--dark .sa-stat__value { color: #fff; }

/* ── Section ── */
.sa-section { display: flex; flex-direction: column; gap: 12px; }

.sa-section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sa-section__title {
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-meta);
}

/* ── Toolbar ── */
.sa-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.sa-search {
  font-family: var(--font-sans);
  font-size: 13px;
  padding: 9px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text);
  outline: none;
  transition: border-color 0.15s;
  width: 280px;
}
.sa-search::placeholder { color: var(--color-text-muted); }
.sa-search:focus { border-color: var(--color-text); }

.sa-count {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-muted);
}

/* ── Table ── */
.sa-table-wrap {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.sa-table { width: 100%; border-collapse: collapse; }

.sa-table th {
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-meta);
  padding: 10px 16px;
  text-align: left;
  background: var(--color-surface-alt);
  border-bottom: 1px solid var(--color-border);
}

.sa-table__row {
  border-bottom: 1px solid var(--color-border);
  transition: background 0.1s;
}
.sa-table__row:last-child { border-bottom: none; }
.sa-table__row:hover { background: var(--color-surface-alt); }
.sa-table td { padding: 13px 16px; }
.sa-table__name { font-size: 13px; font-weight: 500; color: var(--color-text); letter-spacing: -0.01em; }
.sa-table__sub { font-size: 12px; color: var(--color-text-sub); }
.sa-table__empty { text-align: center; font-size: 12px; color: var(--color-text-muted); padding: 40px; font-family: var(--font-mono); }
.sa-table__actions { display: flex; gap: 6px; justify-content: flex-end; }

/* ── Buttons ── */
.sa-btn {
  font-family: var(--font-sans);
  font-size: 12px;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.15s;
  letter-spacing: -0.01em;
  white-space: nowrap;
  border: 1px solid transparent;
}

.sa-btn--primary { background: #111; color: #fff; border-color: #111; }
.sa-btn--primary:hover:not(:disabled) { background: #333; border-color: #333; }
.sa-btn--primary:disabled { opacity: 0.5; cursor: not-allowed; }
.sa-btn--ghost { background: transparent; color: var(--color-text-meta); border-color: var(--color-border); }
.sa-btn--ghost:hover { color: var(--color-text); border-color: var(--color-text); }

.sa-action {
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 500;
  padding: 5px 10px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: #555;
  transition: all 0.15s;
}
.sa-action--danger:hover { border-color: var(--color-error); color: var(--color-error); background: var(--color-error-bg); }

/* ── Form ── */
.sa-form-wrap { max-width: 600px; }

.sa-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.sa-form__group {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sa-form__group-title {
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-meta);
}

.sa-form__fields { display: flex; flex-direction: column; gap: 12px; }

.sa-form__footer {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.sa-success {
  font-size: 12px;
  color: var(--color-success);
  font-family: var(--font-mono);
  background: var(--color-success-bg);
  border: 1px solid var(--color-success-border);
  border-radius: var(--radius-md);
  padding: 10px 14px;
}

/* ── Toast ── */
.sa-toast {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 20px;
  border-radius: var(--radius-full);
  font-family: var(--font-mono);
  font-size: 11px;
  z-index: 200;
  animation: toastIn 0.2s ease;
  white-space: nowrap;
  box-shadow: var(--shadow-lg);
}

.sa-toast--success { background: var(--color-success-bg); color: var(--color-success); border: 1px solid var(--color-success-border); }
.sa-toast--error { background: var(--color-error-bg); color: var(--color-error); border: 1px solid var(--color-error-border); }

@keyframes toastIn {
  from { opacity: 0; transform: translateX(-50%) translateY(8px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}

@media (max-width: 900px) {
  .sa-stats { grid-template-columns: repeat(2, 1fr); }
  .sa-main { padding: 24px 4%; }
}
</style>