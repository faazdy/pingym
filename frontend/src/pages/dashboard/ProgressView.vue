<template>
  <div class="app">
    <AppSidebar />
    <main class="main">
      <div class="page page--narrow">

        <div class="page__header">
          <div>
            <span class="page__tag">Entrenamiento</span>
            <h1 class="page__title">{{ auth.isClient && !auth.isAdmin ? 'Mi progreso' : 'Progreso' }}</h1>
          </div>
          <button class="btn primary" @click="openProgressModal">+ Registrar progreso</button>
        </div>

        <div class="toolbar" v-if="auth.isAdmin || auth.isTrainer">
          <div class="field" style="max-width: 280px;">
            <label class="field__label">Cliente</label>
            <select class="field__input" v-model="selectedClientId" @change="fetchProgress">
              <option value="">Selecciona un cliente</option>
              <option v-for="c in clients" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
          </div>
          <span class="section__count">{{ progress.length }} registros</span>
        </div>
        <div v-else class="toolbar">
          <span class="section__count">{{ progress.length }} registros</span>
        </div>

        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Ejercicio</th>
                <th>Grupo muscular</th>
                <th>Peso (kg)</th>
                <th>Reps</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="progressLoading">
                <td colspan="5" class="table__empty">Cargando...</td>
              </tr>
              <tr v-else-if="!selectedClientId && (auth.isAdmin || auth.isTrainer)">
                <td colspan="5" class="table__empty">Selecciona un cliente para ver su progreso</td>
              </tr>
              <tr v-else-if="progress.length === 0">
                <td colspan="5" class="table__empty">Sin registros de progreso</td>
              </tr>
              <tr v-for="p in progress" :key="p.id" class="table__row">
                <td class="table__name">{{ p.exercise_name }}</td>
                <td class="table__sub">{{ p.muscle_group || "—" }}</td>
                <td class="table__sub">{{ p.weight ?? "—" }}</td>
                <td class="table__sub">{{ p.reps ?? "—" }}</td>
                <td class="table__sub">{{ formatDate(p.created_at) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
          <div class="modal">
            <div class="modal__header">
              <h2 class="modal__title">Registrar progreso</h2>
              <button class="modal__close" @click="closeModal">✕</button>
            </div>
            <form class="modal__form" @submit.prevent="handleSubmit">
              <div class="field" v-if="auth.isAdmin || auth.isTrainer">
                <label class="field__label">Cliente</label>
                <select class="field__input" v-model="form.client_id" required>
                  <option value="">Selecciona un cliente</option>
                  <option v-for="c in clients" :key="c.id" :value="c.id">{{ c.name }}</option>
                </select>
              </div>
              <div class="field">
                <label class="field__label">Ejercicio</label>
                <select class="field__input" v-model="form.exercise_id" required>
                  <option value="">Selecciona un ejercicio</option>
                  <option v-for="e in exercises" :key="e.id" :value="e.id">{{ e.name }} ({{ e.muscle_group || "—" }})</option>
                </select>
              </div>
              <div class="fields-row">
                <div class="field">
                  <label class="field__label">Peso (kg)</label>
                  <input class="field__input" v-model.number="form.weight" type="number" step="0.5" min="0" placeholder="0" />
                </div>
                <div class="field">
                  <label class="field__label">Repeticiones</label>
                  <input class="field__input" v-model.number="form.reps" type="number" min="0" placeholder="0" />
                </div>
              </div>
              <p v-if="formError" class="form__error">{{ formError }}</p>
              <div class="modal__footer">
                <button type="button" class="btn secundary" @click="closeModal">Cancelar</button>
                <button type="submit" class="btn primary">Guardar</button>
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
const progress = ref([]);
const clients = ref([]);
const exercises = ref([]);
const progressLoading = ref(false);
const selectedClientId = ref("");
const showModal = ref(false);
const formError = ref("");
const form = ref({ client_id: "", exercise_id: "", weight: null, reps: null });

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-ES", { dateStyle: "short" });
}

async function fetchProgress() {
  if (!selectedClientId.value) {
    progress.value = [];
    return;
  }
  progressLoading.value = true;
  try {
    const { data } = await api.get(`/progress/client/${selectedClientId.value}`);
    progress.value = data;
  } catch (err) { console.error(err); }
  finally { progressLoading.value = false; }
}

async function fetchClients() {
  try {
    const { data } = await api.get(`/clients/${auth.user?.gym_id}`);
    clients.value = data;
  } catch (err) { console.error(err); }
}

async function fetchExercises() {
  try {
    const { data } = await api.get("/exercises");
    exercises.value = data;
  } catch (err) { console.error(err); }
}

async function handleSubmit() {
  formError.value = "";
  if (form.value.weight == null && form.value.reps == null) {
    formError.value = "Indica al menos peso o repeticiones";
    return;
  }
  try {
    await api.post("/progress", {
      client_id: form.value.client_id,
      exercise_id: form.value.exercise_id,
      weight: form.value.weight ?? null,
      reps: form.value.reps ?? null,
    });
    closeModal();
    fetchProgress();
    if (selectedClientId.value === form.value.client_id) fetchProgress();
  } catch (err) {
    formError.value = err.response?.data?.message || "Error al guardar";
  }
}

function openProgressModal() {
  if (auth.isClient && auth.user?.client_profile_id) {
    form.value.client_id = auth.user.client_profile_id;
  }
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  form.value = { client_id: "", exercise_id: "", weight: null, reps: null };
  formError.value = "";
}

onMounted(() => {
  if (auth.isAdmin || auth.isTrainer) {
    fetchClients();
  } else if (auth.user?.client_profile_id) {
    selectedClientId.value = auth.user.client_profile_id;
    fetchProgress();
  }
  fetchExercises();
});
</script>

<style scoped>
.page { max-width: 860px; }
</style>
