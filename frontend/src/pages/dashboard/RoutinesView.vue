<template>
  <div class="app">
    <AppSidebar />
    <main class="main">
      <div class="page page--narrow">

        <div class="page__header">
          <div class="page__header-left">
            <span class="page__tag">Entrenamiento</span>
            <h1 class="page__title">{{ auth.hasGym && (auth.isAdmin || auth.isTrainer) ? 'Rutinas' : 'Mis rutinas' }}</h1>
          </div>
          <div class="btns-actions" v-if="auth.isAdmin || auth.isTrainer || auth.isIndependiente">
            <button v-if="auth.hasGym && (auth.isAdmin || auth.isTrainer)" class="btn secundary" @click="showAssignModal = true">Asignar a cliente</button>
            <button class="btn primary" @click="showModal = true">+ Nueva rutina</button>
          </div>
        </div>

        <div class="cards-list" v-if="!loading && routines.length > 0">
          <div v-for="r in routines" :key="r.id" class="card-row">
            <div class="routine-card__info">
              <p class="routine-card__name">{{ r.name }}</p>
              <p class="routine-card__desc">{{ r.description || "Sin descripción" }}</p>
              <span class="routine-card__trainer">{{ r.trainer_name || "Sin entrenador" }}</span>
            </div>
            <div class="routine-card__actions">
              <button class="action-btn" @click="openExercises(r)">Ver ejercicios</button>
              <button v-if="auth.isAdmin || auth.isTrainer" class="action-btn" @click="openAddExercise(r)">+ Ejercicio</button>
              <button v-if="auth.hasGym && (auth.isAdmin || auth.isTrainer)" class="action-btn" @click="assignRoutine(r)">Asignar</button>
            </div>
          </div>
        </div>

        <div v-else-if="loading" class="empty">Cargando...</div>
        <div v-else class="empty">No hay rutinas. Crea una y asígnala a clientes.</div>

        <!-- Modal nueva rutina -->
        <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
          <div class="modal">
            <div class="modal__header">
              <h2 class="modal__title">Nueva rutina</h2>
              <button class="modal__close" @click="closeModal">✕</button>
            </div>
            <form class="modal__form" @submit.prevent="handleSubmit">
              <div class="field">
                <label class="field__label">Nombre</label>
                <input class="field__input" v-model="form.name" placeholder="Ej: Full Body, Tren Superior..." required />
              </div>
              <div class="field">
                <label class="field__label">Descripción</label>
                <textarea class="field__input field__textarea" v-model="form.description" rows="3" placeholder="Opcional"></textarea>
              </div>
              <p v-if="formError" class="form__error">{{ formError }}</p>
              <div class="modal__footer">
                <button type="button" class="btn secundary" @click="closeModal">Cancelar</button>
                <button type="submit" class="btn primary">Crear</button>
              </div>
            </form>
          </div>
        </div>

        <!-- Modal asignar rutina a cliente -->
        <div v-if="showAssignModal" class="modal-overlay" @click.self="closeAssignModal">
          <div class="modal">
            <div class="modal__header">
              <h2 class="modal__title">Asignar rutina a cliente</h2>
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
                <label class="field__label">Rutina</label>
                <select class="field__input" v-model="assignForm.routine_id" required>
                  <option value="">Selecciona una rutina</option>
                  <option v-for="r in routines" :key="r.id" :value="r.id">{{ r.name }}</option>
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

        <!-- Modal ejercicios de la rutina -->
        <div v-if="showExercisesModal" class="modal-overlay" @click.self="showExercisesModal = false">
          <div class="modal modal--wide">
            <div class="modal__header">
              <h2 class="modal__title">Ejercicios — {{ selectedRoutine?.name }}</h2>
              <button class="modal__close" @click="showExercisesModal = false">✕</button>
            </div>
            <div v-if="exercisesLoading" class="empty">Cargando...</div>
            <ul v-else-if="routineExercises.length" class="exercises-list">
              <li v-for="ex in routineExercises" :key="ex.id" class="exercises-list__item">
                <div class="exercises-list__info">
                  <span class="exercises-list__name">{{ ex.exercise_name }}</span>
                  <span class="exercises-list__group">{{ ex.muscle_group || "—" }}</span>
                </div>
                <span class="exercises-list__meta">{{ ex.sets }}×{{ ex.reps }}{{ ex.suggested_weight ? ` · ${ex.suggested_weight} kg` : "" }}</span>
                <button v-if="auth.isAdmin || auth.isTrainer" class="action-btn action-btn--danger" @click="handleRemoveExercise(selectedRoutine.id, ex.id)">✕</button>
              </li>
            </ul>
            <p v-else class="empty">Sin ejercicios en esta rutina.</p>
          </div>
        </div>

        <!-- Modal agregar ejercicio -->
        <div v-if="showAddExerciseModal" class="modal-overlay" @click.self="showAddExerciseModal = false">
          <div class="modal">
            <div class="modal__header">
              <h2 class="modal__title">Agregar ejercicio — {{ addExerciseRoutine?.name }}</h2>
              <button class="modal__close" @click="showAddExerciseModal = false">✕</button>
            </div>
            <form class="modal__form" @submit.prevent="handleAddExercise">
              <div class="field">
                <label class="field__label">Ejercicio</label>
                <select class="field__input" v-model="addExerciseForm.exercise_id" required>
                  <option value="">Selecciona un ejercicio</option>
                  <optgroup v-for="group in exerciseGroups" :key="group.label" :label="group.label">
                    <option v-for="ex in group.items" :key="ex.id" :value="ex.id">{{ ex.name }}</option>
                  </optgroup>
                </select>
              </div>
              <div class="fields-row">
                <div class="field">
                  <label class="field__label">Series</label>
                  <input class="field__input" v-model="addExerciseForm.sets" type="number" min="1" placeholder="3" />
                </div>
                <div class="field">
                  <label class="field__label">Reps</label>
                  <input class="field__input" v-model="addExerciseForm.reps" type="number" min="1" placeholder="10" />
                </div>
              </div>
              <div class="field">
                <label class="field__label">Peso sugerido (kg)</label>
                <input class="field__input" v-model="addExerciseForm.suggested_weight" type="number" min="0" step="0.5" placeholder="Opcional" />
              </div>
              <p v-if="addExerciseError" class="form__error">{{ addExerciseError }}</p>
              <div class="modal__footer">
                <button type="button" class="btn secundary" @click="showAddExerciseModal = false">Cancelar</button>
                <button type="submit" class="btn primary">Agregar</button>
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
const routines = ref([]);
const clients = ref([]);
const exercises = ref([]);
const loading = ref(false);
const showModal = ref(false);
const showAssignModal = ref(false);
const showExercisesModal = ref(false);
const showAddExerciseModal = ref(false);
const selectedRoutine = ref(null);
const routineExercises = ref([]);
const exercisesLoading = ref(false);
const addExerciseRoutine = ref(null);
const formError = ref("");
const assignError = ref("");
const addExerciseError = ref("");
const form = ref({ name: "", description: "" });
const assignForm = ref({ client_id: "", routine_id: "" });
const addExerciseForm = ref({ exercise_id: "", sets: "", reps: "", suggested_weight: "" });

const exerciseGroups = computed(() => {
  const groups = {};
  exercises.value.forEach(ex => {
    const g = ex.muscle_group || "Sin grupo";
    if (!groups[g]) groups[g] = [];
    groups[g].push(ex);
  });
  return Object.entries(groups).map(([label, items]) => ({ label, items }));
});

async function fetchRoutines() {
  loading.value = true;
  try {
    if (auth.hasGym && (auth.isAdmin || auth.isTrainer)) {
      const { data } = await api.get(`/routines/gym/${auth.user?.gym_id}`);
      routines.value = data;
    } else {
      const { data } = await api.get("/routines/my");
      routines.value = data || [];
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

async function fetchExercises() {
  try {
    const { data } = await api.get("/routines/exercises");
    exercises.value = data;
  } catch (err) { console.error(err); }
}

async function handleSubmit() {
  formError.value = "";
  try {
    await api.post("/routines", {
      name: form.value.name,
      description: form.value.description || null,
      trainer_id: auth.hasGym ? form.value.trainer_id || auth.user?.id : auth.user?.id,
    });
    closeModal();
    fetchRoutines();
  } catch (err) {
    formError.value = err.response?.data?.message || "Error al guardar";
  }
}

async function handleAssign() {
  assignError.value = "";
  try {
    await api.post("/routines/assign", {
      client_id: assignForm.value.client_id,
      routine_id: assignForm.value.routine_id
    });
    closeAssignModal();
  } catch (err) {
    assignError.value = err.response?.data?.message || "Error al asignar";
  }
}

async function openExercises(r) {
  selectedRoutine.value = r;
  routineExercises.value = [];
  showExercisesModal.value = true;
  exercisesLoading.value = true;
  try {
    const { data } = await api.get(`/routines/${r.id}/exercises`);
    routineExercises.value = data;
  } catch (err) { console.error(err); }
  finally { exercisesLoading.value = false; }
}

function openAddExercise(r) {
  addExerciseRoutine.value = r;
  addExerciseForm.value = { exercise_id: "", sets: "", reps: "", suggested_weight: "" };
  addExerciseError.value = "";
  showAddExerciseModal.value = true;
}

async function handleAddExercise() {
  addExerciseError.value = "";
  try {
    await api.post(`/routines/${addExerciseRoutine.value.id}/exercises`, {
      exercise_id: addExerciseForm.value.exercise_id,
      sets: Number(addExerciseForm.value.sets) || null,
      reps: Number(addExerciseForm.value.reps) || null,
      suggested_weight: Number(addExerciseForm.value.suggested_weight) || null,
    });
    showAddExerciseModal.value = false;
    if (showExercisesModal.value && selectedRoutine.value?.id === addExerciseRoutine.value.id) {
      openExercises(addExerciseRoutine.value);
    }
  } catch (err) {
    addExerciseError.value = err.response?.data?.message || "Error al agregar";
  }
}

async function handleRemoveExercise(routineId, exerciseRowId) {
  if (!confirm("¿Eliminar este ejercicio de la rutina?")) return;
  try {
    await api.delete(`/routines/${routineId}/exercises/${exerciseRowId}`);
    openExercises(selectedRoutine.value);
  } catch (err) { console.error(err); }
}

function assignRoutine(r) {
  assignForm.value.routine_id = r.id;
  showAssignModal.value = true;
}

function closeModal() {
  showModal.value = false;
  form.value = { name: "", description: "" };
  formError.value = "";
}

function closeAssignModal() {
  showAssignModal.value = false;
  assignForm.value = { client_id: "", routine_id: "" };
  assignError.value = "";
}

onMounted(() => {
  fetchRoutines();
  fetchExercises();
  if (auth.hasGym && (auth.isAdmin || auth.isTrainer)) fetchClients();
});
</script>

<style scoped>
/* Solo estilos únicos de esta vista */
.exercises-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
}

.exercises-list__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);
}

.exercises-list__item:last-child { border-bottom: none; }

.exercises-list__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.exercises-list__name {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text);
  letter-spacing: -0.01em;
}

.exercises-list__group {
  font-size: 10px;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-family: var(--font-mono);
}

.exercises-list__meta {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-sub);
  white-space: nowrap;
}
</style>