<template>
  <div class="app">
    <AppSidebar />
    <main class="main">
      <div class="page page--narrow">

        <div class="page__header">
          <div>
            <span class="page__tag">{{ auth.isAdmin || auth.isTrainer ? 'Control' : 'Mi historial' }}</span>
            <h1 class="page__title">{{ auth.isAdmin || auth.isTrainer ? 'Asistencia' : 'Mi asistencia' }}</h1>
          </div>
          <button v-if="auth.isAdmin || auth.isTrainer" class="btn primary" @click="showCheckInModal = true">Check-in</button>
        </div>

        <div class="toolbar" v-if="auth.isAdmin || auth.isTrainer">
          <div class="toolbar-filters">
            <input type="date" class="field__input filter-input" v-model="filterDay" @change="fetchHistory" />
            <span class="filter-divider">o</span>
            <input type="week" class="field__input filter-input" v-model="filterWeek" @change="fetchHistoryWeek" />
          </div>
          <span class="section__count">{{ attendance.length }} registros</span>
        </div>
        <div v-else class="toolbar">
          <span class="section__count">{{ attendance.length }} registros</span>
        </div>

        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Email</th>
                <th>Check-in</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="3" class="table__empty">Cargando...</td>
              </tr>
              <tr v-else-if="attendance.length === 0">
                <td colspan="3" class="table__empty">{{ auth.isAdmin || auth.isTrainer ? 'No hay registros para el filtro seleccionado' : 'Aún no tienes registros de asistencia' }}</td>
              </tr>
              <tr v-for="a in attendance" :key="a.id" class="table__row">
                <td class="table__name">{{ a.client_name }}</td>
                <td class="table__sub">{{ a.email }}</td>
                <td class="table__sub">{{ formatDate(a.check_in) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="(auth.isAdmin || auth.isTrainer) && showCheckInModal" class="modal-overlay" @click.self="showCheckInModal = false">
          <div class="modal">
            <div class="modal__header">
              <h2 class="modal__title">Check-in de cliente</h2>
              <button class="modal__close" @click="showCheckInModal = false">✕</button>
            </div>
            <form class="modal__form" @submit.prevent="doCheckIn">
              <div class="field">
                <label class="field__label">Cliente</label>
                <select class="field__input" v-model="checkInClientId" required>
                  <option value="">Selecciona un cliente</option>
                  <option v-for="c in clients" :key="c.id" :value="c.id">{{ c.name }} — {{ c.email }}</option>
                </select>
              </div>
              <p v-if="checkInError" class="form__error">{{ checkInError }}</p>
              <div class="modal__footer">
                <button type="button" class="btn secundary" @click="showCheckInModal = false">Cancelar</button>
                <button type="submit" class="btn primary">Registrar entrada</button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import AppSidebar from "../../components/Nav.vue";
import { useAuthStore } from "../../stores/auth.store";
import api from "../../services/api";

const auth = useAuthStore();
const attendance = ref([]);
const clients = ref([]);
const loading = ref(false);
const showCheckInModal = ref(false);
const checkInClientId = ref("");
const checkInError = ref("");
const filterDay = ref("");
const filterWeek = ref("");

function formatDate(d) {
  if (!d) return "—";
  const dt = new Date(d);
  return dt.toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" });
}

async function fetchHistory() {
  if (!auth.user?.gym_id) return;
  loading.value = true;
  try {
    const params = filterDay.value ? { day: filterDay.value } : {};
    const { data } = await api.get(`/attendance/${auth.user.gym_id}`, { params });
    attendance.value = data;
  } catch (err) { console.error(err); }
  finally { loading.value = false; }
}

async function fetchHistoryWeek() {
  if (!auth.user?.gym_id || !filterWeek.value) return;
  loading.value = true;
  try {
    const { data } = await api.get(`/attendance/${auth.user.gym_id}`, { params: { week: filterWeek.value } });
    attendance.value = data;
  } catch (err) { console.error(err); }
  finally { loading.value = false; }
}

async function doCheckIn() {
  checkInError.value = "";
  try {
    await api.post("/attendance/check-in", { client_id: checkInClientId.value });
    showCheckInModal.value = false;
    checkInClientId.value = "";
    fetchHistory();
  } catch (err) {
    checkInError.value = err.response?.data?.message || "Error al registrar";
  }
}

async function fetchClients() {
  try {
    const { data } = await api.get(`/clients/${auth.user?.gym_id}`);
    clients.value = data;
  } catch (err) { console.error(err); }
}

async function fetchMyAttendance() {
  loading.value = true;
  try {
    const { data } = await api.get("/attendance/my");
    attendance.value = data;
  } catch (err) { console.error(err); }
  finally { loading.value = false; }
}

onMounted(() => {
  if (auth.isAdmin || auth.isTrainer) {
    const today = new Date().toISOString().slice(0, 10);
    filterDay.value = today;
    fetchHistory();
    fetchClients();
  } else {
    fetchMyAttendance();
  }
});
</script>

<style scoped>
.page { max-width: 860px; }
.toolbar-filters { display: flex; align-items: center; gap: 10px; }
.filter-input { width: 160px; }
.filter-divider { font-family: 'Geist Mono', monospace; font-size: 11px; color: #bbb; }
</style>
