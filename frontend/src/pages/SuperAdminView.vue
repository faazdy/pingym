<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth.store";
import api from "../services/api";

const auth = useAuthStore();
const router = useRouter();

const gyms = ref([]);
const loadingList = ref(false);
const loadingSubmit = ref(false);
const error = ref("");
const success = ref("");

const gymFields = ref({ name: "", address: "", phone: "" });
const adminFields = ref({ name: "", email: "", password: "" });

async function fetchGyms() {
  loadingList.value = true;
  error.value = "";
  try {
    const { data } = await api.get("/superadmin/gyms");
    gyms.value = Array.isArray(data) ? data : [];
  } catch (err) {
    error.value = err.response?.data?.message || "No se pudieron cargar los gyms";
    gyms.value = [];
  } finally {
    loadingList.value = false;
  }
}

async function handleCreate() {
  error.value = "";
  success.value = "";
  loadingSubmit.value = true;
  try {
    await api.post("/superadmin/create-gym", {
      gym: { ...gymFields.value },
      admin: { ...adminFields.value },
    });
    success.value = "Gym y administrador creados correctamente.";
    gymFields.value = { name: "", address: "", phone: "" };
    adminFields.value = { name: "", email: "", password: "" };
    await fetchGyms();
  } catch (err) {
    error.value = err.response?.data?.message || "Error al crear el gym";
  } finally {
    loadingSubmit.value = false;
  }
}

function logout() {
  auth.logout();
  router.push("/login");
}

onMounted(fetchGyms);
</script>

<template>
  <div class="superadmin">
    <header class="superadmin__header">
      <div class="superadmin__brand">
        <img src="/logo.png" alt="GymSaaS" class="superadmin__logo" />
        <div>
          <h1 class="superadmin__title">Superadmin</h1>
          <p class="superadmin__sub">Alta de gyms y administradores</p>
        </div>
      </div>
      <div class="superadmin__actions">
        <span class="superadmin__user">{{ auth.user?.name }}</span>
        <button type="button" class="btn btn--ghost" @click="logout">Salir</button>
      </div>
    </header>

    <main class="superadmin__main">
      <section class="widget superadmin__panel">
        <p class="widget__label">Nuevo gym + admin</p>
        <form class="superadmin__form" @submit.prevent="handleCreate">
          <div class="superadmin__grid">
            <div>
              <p class="superadmin__section-title">Gimnasio</p>
              <div class="field">
                <label class="field__label">Nombre</label>
                <input v-model="gymFields.name" class="field__input" type="text" required placeholder="Nombre del gym" />
              </div>
              <div class="field">
                <label class="field__label">Dirección</label>
                <input v-model="gymFields.address" class="field__input" type="text" placeholder="Calle y número" />
              </div>
              <div class="field">
                <label class="field__label">Teléfono</label>
                <input v-model="gymFields.phone" class="field__input" type="text" placeholder="+57 300 000 0000" />
              </div>
            </div>
            <div>
              <p class="superadmin__section-title">Administrador</p>
              <div class="field">
                <label class="field__label">Nombre</label>
                <input v-model="adminFields.name" class="field__input" type="text" required placeholder="Nombre completo" />
              </div>
              <div class="field">
                <label class="field__label">Email</label>
                <input v-model="adminFields.email" class="field__input" type="email" required placeholder="admin@gym.com" />
              </div>
              <div class="field">
                <label class="field__label">Contraseña</label>
                <input v-model="adminFields.password" class="field__input" type="password" required placeholder="••••••••" autocomplete="new-password" />
              </div>
            </div>
          </div>

          <p v-if="error" class="superadmin__msg superadmin__msg--error">{{ error }}</p>
          <p v-if="success" class="superadmin__msg superadmin__msg--ok">{{ success }}</p>

          <button type="submit" class="btn btn--primary superadmin__submit" :disabled="loadingSubmit">
            {{ loadingSubmit ? "Creando…" : "Crear gym y admin" }}
          </button>
        </form>
      </section>

      <section class="widget">
        <p class="widget__label">Gyms registrados</p>
        <div class="table-wrap superadmin__table">
          <table class="table">
            <thead>
              <tr>
                <th>Gym</th>
                <th>Dirección</th>
                <th>Teléfono</th>
                <th>Admin</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loadingList">
                <td colspan="4" class="table__empty">Cargando…</td>
              </tr>
              <tr v-else-if="!gyms.length">
                <td colspan="4" class="table__empty">No hay gyms todavía</td>
              </tr>
              <tr v-for="g in gyms" :key="g.id" class="table__row">
                <td>
                  <span class="table__name">{{ g.name }}</span>
                  <p class="table__sub mono">{{ g.id }}</p>
                </td>
                <td class="table__sub">{{ g.address || "—" }}</td>
                <td class="table__sub">{{ g.phone || "—" }}</td>
                <td>
                  <template v-if="g.admin && typeof g.admin === 'object'">
                    <span class="table__name">{{ g.admin.name }}</span>
                    <p class="table__sub">{{ g.admin.email }}</p>
                  </template>
                  <span v-else class="table__sub">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.superadmin {
  min-height: 100vh;
  font-family: var(--font-sans);
  background-image: url('../assets/images/backgrounds/bgapp2.png');
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
}

.superadmin__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 6%;
  border-bottom: 1px solid var(--color-border);
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(8px);
}

.superadmin__brand {
  display: flex;
  align-items: center;
  gap: 14px;
}

.superadmin__logo {
  height: 44px;
  width: auto;
  object-fit: contain;
}

.superadmin__title {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text);
  letter-spacing: -0.03em;
}

.superadmin__sub {
  font-size: 12px;
  color: var(--color-text-meta);
  margin-top: 2px;
}

.superadmin__actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.superadmin__user {
  font-size: 12px;
  color: var(--color-text-sub);
}

.superadmin__main {
  flex: 1;
  padding: 28px 6% 48px;
  max-width: 1100px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.superadmin__panel {
  padding: 24px;
}

.superadmin__form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 8px;
}

.superadmin__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

@media (max-width: 768px) {
  .superadmin__grid {
    grid-template-columns: 1fr;
  }
}

.superadmin__section-title {
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-meta);
  margin-bottom: 12px;
}

.superadmin__submit {
  width: fit-content;
  min-width: 200px;
}

.superadmin__msg {
  font-family: var(--font-mono);
  font-size: 11px;
}

.superadmin__msg--error {
  color: var(--color-error);
}

.superadmin__msg--ok {
  color: var(--color-success);
}

.superadmin__table {
  margin-top: 12px;
}

.mono {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-text-muted);
  word-break: break-all;
}
</style>
