<template>
  <div class="app">
    <AppSidebar />
    <main class="main">
      <div class="page">

        <div class="page__header">
          <div>
            <span class="page__tag">Entrenamiento</span>
            <h1 class="page__title">Rutinas</h1>
          </div>
          <button class="btn primary" @click="showModal = true">+ Nueva rutina</button>
        </div>

        <div class="routines-list" v-if="!loading && routines.length > 0">
          <div v-for="r in routines" :key="r.id" class="routine-card">
            <div class="routine-card__info">
              <p class="routine-card__name">{{ r.name }}</p>
              <p class="routine-card__desc">{{ r.description || "Sin descripción" }}</p>
              <span class="routine-card__trainer">{{ r.trainer_name || "Sin entrenador asignado" }}</span>
            </div>
            <div class="routine-card__actions">
              <button class="action-btn" @click="editRoutine(r)">Editar</button>
              <button class="action-btn action-btn--danger" @click="deleteRoutine(r.id)">Eliminar</button>
            </div>
          </div>
        </div>

        <div v-else-if="loading" class="empty">Cargando...</div>
        <div v-else class="empty">No hay rutinas registradas</div>

        <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
          <div class="modal">
            <div class="modal__header">
              <h2 class="modal__title">{{ editingRoutine ? "Editar rutina" : "Nueva rutina" }}</h2>
              <button class="modal__close" @click="closeModal">✕</button>
            </div>
            <form class="modal__form" @submit.prevent="handleSubmit">
              <div class="field">
                <label class="field__label">Nombre</label>
                <input class="field__input" v-model="form.name" placeholder="Ej: Full Body, Tren Superior..." required />
              </div>
              <div class="field">
                <label class="field__label">Descripción</label>
                <textarea class="field__input field__textarea" v-model="form.description" rows="3" placeholder="Descripción opcional"></textarea>
              </div>
              <p v-if="formError" class="form__error">{{ formError }}</p>
              <div class="modal__footer">
                <button type="button" class="btn secundary" @click="closeModal">Cancelar</button>
                <button type="submit" class="btn primary">{{ editingRoutine ? "Guardar" : "Crear" }}</button>
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
const routines = ref([]);
const loading = ref(false);
const showModal = ref(false);
const editingRoutine = ref(null);
const formError = ref("");
const form = ref({ name: "", description: "" });

async function fetchRoutines() {
  loading.value = true;
  try {
    const { data } = await api.get(`/routines/${auth.user?.gym_id}`);
    routines.value = data;
  } catch (err) { console.error(err); }
  finally { loading.value = false; }
}

async function handleSubmit() {
  formError.value = "";
  try {
    const payload = { ...form.value, gym_id: auth.user?.gym_id, trainer_id: auth.user?.id };
    if (editingRoutine.value) {
      await api.put(`/routines/${editingRoutine.value.id}`, payload);
    } else {
      await api.post("/routines", payload);
    }
    closeModal();
    fetchRoutines();
  } catch (err) {
    formError.value = err.response?.data?.message || "Error al guardar";
  }
}

function editRoutine(r) {
  editingRoutine.value = r;
  form.value = { name: r.name, description: r.description };
  showModal.value = true;
}

async function deleteRoutine(id) {
  if (!confirm("¿Eliminar esta rutina?")) return;
  await api.delete(`/routines/${id}`);
  fetchRoutines();
}

function closeModal() {
  showModal.value = false;
  editingRoutine.value = null;
  form.value = { name: "", description: "" };
}

onMounted(fetchRoutines);
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500&family=Geist:wght@400;500;600&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.app { min-height: 100vh; font-family: 'Geist', sans-serif; }
.main {  flex: 1; background: #f9f9f9; padding: 48px 48px 100px; }
.page { max-width: 720px; display: flex; flex-direction: column; gap: 32px; }

.page__header { display: flex; align-items: flex-end; justify-content: space-between; padding-bottom: 24px; border-bottom: 1px solid #e5e5e5; }
.page__tag { font-family: 'Geist Mono', monospace; font-size: 10px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: #999; display: block; margin-bottom: 6px; }
.page__title { font-size: 26px; font-weight: 600; color: #111; letter-spacing: -0.03em; }

.btn { font-family: 'Geist', sans-serif; font-size: 12px; font-weight: 500; padding: 7px 14px; border-radius: 6px; cursor: pointer; transition: all 0.15s ease; letter-spacing: -0.01em; white-space: nowrap; }
.primary { background: #111; color: #fff; border: 1px solid #111; }
.primary:hover { background: #333; border-color: #333; }
.secundary { background: #fff; color: #111; border: 1px solid #e5e5e5; }
.secundary:hover { background: #f0f0f0; border-color: #333; }

.routines-list { display: flex; flex-direction: column; border: 1px solid #e5e5e5; border-radius: 8px; overflow: hidden; background: #fff; }

.routine-card { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid #f0f0f0; transition: background 0.1s; gap: 16px; }
.routine-card:last-child { border-bottom: none; }
.routine-card:hover { background: #fafafa; }

.routine-card__info { display: flex; flex-direction: column; gap: 3px; }
.routine-card__name { font-size: 13px; font-weight: 500; color: #111; letter-spacing: -0.01em; }
.routine-card__desc { font-size: 12px; color: #888; }
.routine-card__trainer { font-family: 'Geist Mono', monospace; font-size: 10px; color: #bbb; text-transform: uppercase; letter-spacing: 0.06em; }

.routine-card__actions { display: flex; gap: 6px; flex-shrink: 0; }

.action-btn { font-family: 'Geist', sans-serif; font-size: 11px; font-weight: 500; padding: 5px 10px; border-radius: 5px; cursor: pointer; border: 1px solid #e5e5e5; background: #fff; color: #555; transition: all 0.15s; }
.action-btn:hover { border-color: #111; color: #111; }
.action-btn--danger:hover { border-color: #e5484d; color: #e5484d; background: #fff5f5; }

.empty { font-family: 'Geist Mono', monospace; font-size: 12px; color: #bbb; text-align: center; padding: 40px; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; z-index: 100; backdrop-filter: blur(2px); }
.modal { background: #fff; border: 1px solid #e5e5e5; border-radius: 10px; padding: 32px; width: 100%; max-width: 400px; display: flex; flex-direction: column; gap: 24px; }
.modal__header { display: flex; align-items: center; justify-content: space-between; }
.modal__title { font-size: 16px; font-weight: 600; color: #111; letter-spacing: -0.02em; }
.modal__close { background: none; border: none; font-size: 14px; color: #bbb; cursor: pointer; padding: 4px; transition: color 0.15s; }
.modal__close:hover { color: #111; }
.modal__form { display: flex; flex-direction: column; gap: 14px; }
.field { display: flex; flex-direction: column; gap: 5px; }
.field__label { font-size: 11px; font-weight: 500; color: #111; letter-spacing: -0.01em; text-transform: uppercase; font-family: 'Geist Mono', monospace; }
.field__input { font-family: 'Geist', sans-serif; font-size: 13px; padding: 8px 10px; border: 1px solid #e5e5e5; border-radius: 6px; background: #fff; color: #111; outline: none; transition: border-color 0.15s; width: 100%; }
.field__input::placeholder { color: #bbb; }
.field__input:focus { border-color: #111; }
.field__textarea { resize: vertical; min-height: 80px; font-family: 'Geist', sans-serif; }
.form__error { font-size: 11px; color: #e5484d; font-family: 'Geist Mono', monospace; }
.modal__footer { display: flex; gap: 8px; justify-content: flex-end; padding-top: 8px; border-top: 1px solid #f0f0f0; }
</style>