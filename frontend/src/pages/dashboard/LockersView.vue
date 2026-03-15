<template>
  <div class="app">
    <AppSidebar />
    <main class="main">
      <div class="page page--narrow">

        <div class="page__header">
          <div class="page__header-left">
            <span class="page__tag">{{ auth.isAdmin ? 'Recursos' : 'Mi casillero' }}</span>
            <h1 class="page__title">{{ auth.isAdmin ? 'Casilleros' : 'Mi casillero' }}</h1>
          </div>
          <div class="btns-actions" v-if="auth.isAdmin">
            <button class="btn secundary" @click="showReleaseModal = true">Liberar</button>
            <button class="btn secundary" @click="showAssignModal = true">Asignar</button>
            <button class="btn primary" @click="showCreateModal = true">+ Nuevo casillero</button>
          </div>
        </div>

        <!-- Stats rápidas -->
        <div class="row row--3" v-if="auth.isAdmin && lockers.length > 0">
          <div class="widget widget--stat">
            <p class="widget__label">Total</p>
            <p class="widget__number">{{ lockers.length }}</p>
          </div>
          <div class="widget widget--stat">
            <p class="widget__label">Disponibles</p>
            <p class="widget__number">{{ availableLockers.length }}</p>
          </div>
          <div class="widget widget--stat">
            <p class="widget__label">Ocupados</p>
            <p class="widget__number">{{ occupiedLockers.length }}</p>
          </div>
        </div>

        <!-- Cliente: solo su casillero -->
        <div v-if="!auth.isAdmin">
          <div v-if="loading" class="empty">Cargando...</div>
          <div v-else-if="myLocker" class="locker-card locker-card--my">
            <span class="locker-card__number">#{{ myLocker.locker_number }}</span>
            <span class="badge badge--occupied">Asignado</span>
            <p class="locker-card__meta">Desde {{ formatDate(myLocker.assigned_at) }}</p>
          </div>
          <div v-else class="empty">No tienes un casillero asignado</div>
        </div>

        <!-- Admin: grid completo -->
        <div v-else-if="loading" class="empty">Cargando...</div>
        <div v-else-if="lockers.length === 0" class="empty">No hay casilleros. Crea uno para empezar.</div>
        <div v-else class="lockers-grid">
          <div
            v-for="l in lockers"
            :key="l.id"
            class="locker-card"
            :class="{ 'locker-card--occupied': l.status === 'occupied' }"
          >
            <span class="locker-card__number">#{{ l.locker_number }}</span>
            <span class="badge" :class="l.status === 'available' ? 'badge--available' : 'badge--occupied'">
              {{ l.status === "available" ? "Disponible" : "Ocupado" }}
            </span>
            <p v-if="l.client_id" class="locker-card__client">{{ clientName(l.client_id) }}</p>
            <p v-if="l.assigned_at" class="locker-card__meta">Desde {{ formatDate(l.assigned_at) }}</p>
            <button v-if="l.status === 'available'" class="action-btn" @click="openAssignWithLocker(l.id)">Asignar cliente</button>
            <button v-if="l.status === 'available'" class="action-btn action-btn--danger" @click="handleDeleteLocker(l.id)">Eliminar</button>
          </div>
        </div>

        <!-- Modal crear casillero -->
        <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
          <div class="modal">
            <div class="modal__header">
              <h2 class="modal__title">Nuevo casillero</h2>
              <button class="modal__close" @click="showCreateModal = false">✕</button>
            </div>
            <form class="modal__form" @submit.prevent="handleCreate">
              <div class="field">
                <label class="field__label">Número de casillero</label>
                <input class="field__input" v-model="createForm.locker_number" type="number" min="1" placeholder="Ej: 101" required />
              </div>
              <p v-if="createError" class="form__error">{{ createError }}</p>
              <div class="modal__footer">
                <button type="button" class="btn secundary" @click="showCreateModal = false">Cancelar</button>
                <button type="submit" class="btn primary">Crear</button>
              </div>
            </form>
          </div>
        </div>

        <!-- Modal asignar casillero -->
        <div v-if="showAssignModal" class="modal-overlay" @click.self="closeAssignModal">
          <div class="modal">
            <div class="modal__header">
              <h2 class="modal__title">Asignar casillero</h2>
              <button class="modal__close" @click="closeAssignModal">✕</button>
            </div>
            <form class="modal__form" @submit.prevent="handleAssign">
              <div class="field">
                <label class="field__label">Cliente</label>
                <select class="field__input" v-model="assignForm.client_id" required>
                  <option value="">Selecciona un cliente</option>
                  <option v-for="c in clients" :key="c.id" :value="c.id">{{ c.name }}</option>
                </select>
              </div>
              <div class="field">
                <label class="field__label">Casillero</label>
                <select class="field__input" v-model="assignForm.locker_id" required>
                  <option value="">Selecciona un casillero disponible</option>
                  <option v-for="l in availableLockers" :key="l.id" :value="l.id">#{{ l.locker_number }}</option>
                </select>
              </div>
              <p v-if="assignError" class="form__error">{{ assignError }}</p>
              <div class="modal__footer">
                <button type="button" class="btn secundary" @click="closeAssignModal">Cancelar</button>
                <button type="submit" class="btn primary">Asignar</button>
              </div>
            </form>
          </div>
        </div>

        <!-- Modal liberar casillero -->
        <div v-if="showReleaseModal" class="modal-overlay" @click.self="closeReleaseModal">
          <div class="modal">
            <div class="modal__header">
              <h2 class="modal__title">Liberar casillero</h2>
              <button class="modal__close" @click="closeReleaseModal">✕</button>
            </div>
            <form class="modal__form" @submit.prevent="handleRelease">
              <div class="field">
                <label class="field__label">Casillero ocupado</label>
                <select class="field__input" v-model="releaseForm.locker_id" required>
                  <option value="">Selecciona un casillero</option>
                  <option v-for="l in occupiedLockers" :key="l.id" :value="l.id">
                    #{{ l.locker_number }} — {{ clientName(l.client_id) }}
                  </option>
                </select>
              </div>
              <p v-if="releaseError" class="form__error">{{ releaseError }}</p>
              <div class="modal__footer">
                <button type="button" class="btn secundary" @click="closeReleaseModal">Cancelar</button>
                <button type="submit" class="btn primary">Liberar</button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import AppSidebar from "../../components/Nav.vue";
import { useAuthStore } from "../../stores/auth.store";
import api from "../../services/api";

const auth = useAuthStore();
const lockers = ref([]);
const myLocker = ref(null);
const clients = ref([]);
const loading = ref(false);
const showCreateModal = ref(false);
const showAssignModal = ref(false);
const showReleaseModal = ref(false);
const createError = ref("");
const assignError = ref("");
const releaseError = ref("");
const createForm = ref({ locker_number: "" });
const assignForm = ref({ client_id: "", locker_id: "" });
const releaseForm = ref({ locker_id: "" });

const availableLockers = computed(() => lockers.value.filter(l => l.status === "available"));
const occupiedLockers = computed(() => lockers.value.filter(l => l.status === "occupied"));

function clientName(clientId) {
  const c = clients.value.find(x => x.id === clientId);
  return c ? c.name : "—";
}

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
}

async function fetchLockers() {
  loading.value = true;
  try {
    if (auth.isAdmin) {
      const { data } = await api.get(`/lockers/${auth.user?.gym_id}`);
      lockers.value = data;
    } else {
      const { data } = await api.get("/lockers/my");
      myLocker.value = data;
    }
  } catch (err) { console.error(err); }
  finally { loading.value = false; }
}

async function fetchClients() {
  try {
    const { data } = await api.get(`/clients/${auth.user?.gym_id}`);
    clients.value = data;
  } catch (err) { console.error(err); }
}

async function handleCreate() {
  createError.value = "";
  try {
    await api.post("/lockers", { locker_number: Number(createForm.value.locker_number) });
    showCreateModal.value = false;
    createForm.value = { locker_number: "" };
    fetchLockers();
  } catch (err) {
    createError.value = err.response?.data?.message || "Error al crear";
  }
}

async function handleAssign() {
  assignError.value = "";
  try {
    await api.post("/lockers/assign", {
      client_id: assignForm.value.client_id,
      locker_id: assignForm.value.locker_id
    });
    closeAssignModal();
    fetchLockers();
  } catch (err) {
    assignError.value = err.response?.data?.message || "Error al asignar";
  }
}

async function handleRelease() {
  releaseError.value = "";
  const locker = lockers.value.find(l => l.id === releaseForm.value.locker_id);
  if (!locker?.client_id) {
    releaseError.value = "Selecciona un casillero ocupado";
    return;
  }
  try {
    await api.post("/lockers/release", {
      client_id: locker.client_id,
      locker_id: releaseForm.value.locker_id
    });
    closeReleaseModal();
    fetchLockers();
  } catch (err) {
    releaseError.value = err.response?.data?.message || "Error al liberar";
  }
}

function openAssignWithLocker(lockerId) {
  assignForm.value.locker_id = lockerId;
  showAssignModal.value = true;
}

async function handleDeleteLocker(id) {
  if (!confirm("¿Eliminar este casillero?")) return;
  try {
    await api.delete(`/lockers/${id}`);
    fetchLockers();
  } catch (err) {
    alert(err.response?.data?.message || "Error al eliminar");
  }
}

function closeAssignModal() {
  showAssignModal.value = false;
  assignForm.value = { client_id: "", locker_id: "" };
  assignError.value = "";
}

function closeReleaseModal() {
  showReleaseModal.value = false;
  releaseForm.value = { locker_id: "" };
  releaseError.value = "";
}

onMounted(() => {
  fetchLockers();
  if (auth.isAdmin) fetchClients();
});
</script>

<style scoped>
.main{
  display: flex;
  justify-content: center;
}
.lockers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
}

.locker-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: border-color 0.15s;
}

.locker-card:hover { border-color: var(--color-text); }
.locker-card--occupied { border-color: var(--color-warning-border); background: var(--color-warning-bg); }
.locker-card--my { max-width: 200px; }

.locker-card__number {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text);
  letter-spacing: -0.02em;
}

.locker-card__client { font-size: 11px; color: var(--color-text-sub); }

.locker-card__meta {
  font-size: 10px;
  color: var(--color-text-muted);
  font-family: var(--font-mono);
}

.action-btn { width: 100%; }
</style>