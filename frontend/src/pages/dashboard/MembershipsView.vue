<template>
  <div class="app">
    <AppSidebar />
    <main class="main">
      <div class="page">

        <div class="page__header">
          <div>
            <span class="page__tag">Gestión</span>
            <h1 class="page__title">Membresías</h1>
          </div>
          <button class="btn primary" @click="showModal = true">+ Nueva membresía</button>
        </div>

        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Duración</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="3" class="table__empty">Cargando...</td>
              </tr>
              <tr v-else-if="memberships.length === 0">
                <td colspan="3" class="table__empty">No hay membresías registradas</td>
              </tr>
              <tr v-for="m in memberships" :key="m.id" class="table__row">
                <td class="table__name">{{ m.name }}</td>
                <td class="table__sub">{{ m.duration_days }} días</td>
                <td class="table__actions">
                  <button class="action-btn" @click="editMembership(m)">Editar</button>
                  <button class="action-btn action-btn--danger" @click="deleteMembership(m.id)">Eliminar</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
          <div class="modal">
            <div class="modal__header">
              <h2 class="modal__title">{{ editingMembership ? "Editar membresía" : "Nueva membresía" }}</h2>
              <button class="modal__close" @click="closeModal">✕</button>
            </div>
            <form class="modal__form" @submit.prevent="handleSubmit">
              <div class="field">
                <label class="field__label">Nombre</label>
                <input class="field__input" v-model="form.name" placeholder="Ej: Mensual, Trimestral..." required />
              </div>
              <div class="field">
                <label class="field__label">Duración (días)</label>
                <input class="field__input" v-model="form.duration_days" type="number" placeholder="30" required />
              </div>
              <p v-if="formError" class="form__error">{{ formError }}</p>
              <div class="modal__footer">
                <button type="button" class="btn secundary" @click="closeModal">Cancelar</button>
                <button type="submit" class="btn primary">{{ editingMembership ? "Guardar" : "Crear" }}</button>
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
const memberships = ref([]);
const loading = ref(false);
const showModal = ref(false);
const editingMembership = ref(null);
const formError = ref("");
const form = ref({ name: "", duration_days: "" });

async function fetchMemberships() {
  loading.value = true;
  try {
    const { data } = await api.get(`/memberships/${auth.user?.gym_id}`);
    memberships.value = data;
  } catch (err) { console.error(err); }
  finally { loading.value = false; }
}

async function handleSubmit() {
  formError.value = "";
  try {
    const payload = { ...form.value, gym_id: auth.user?.gym_id };
    if (editingMembership.value) {
      await api.put(`/memberships/${editingMembership.value.id}`, payload);
    } else {
      await api.post("/memberships", payload);
    }
    closeModal();
    fetchMemberships();
  } catch (err) {
    formError.value = err.response?.data?.message || "Error al guardar";
  }
}

function editMembership(m) {
  editingMembership.value = m;
  form.value = { name: m.name, duration_days: m.duration_days };
  showModal.value = true;
}

async function deleteMembership(id) {
  if (!confirm("¿Eliminar esta membresía?")) return;
  await api.delete(`/memberships/${id}`);
  fetchMemberships();
}

function closeModal() {
  showModal.value = false;
  editingMembership.value = null;
  form.value = { name: "", duration_days: "" };
}

onMounted(fetchMemberships);
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

.table-wrap { background: #fff; border: 1px solid #e5e5e5; border-radius: 8px; overflow: hidden; }
.table { width: 100%; border-collapse: collapse; }
th { font-family: 'Geist Mono', monospace; font-size: 10px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: #999; padding: 10px 16px; text-align: left; background: #fafafa; border-bottom: 1px solid #e5e5e5; }
.table__row { border-bottom: 1px solid #f0f0f0; transition: background 0.1s; }
.table__row:last-child { border-bottom: none; }
.table__row:hover { background: #fafafa; }
td { padding: 12px 16px; }
.table__name { font-size: 13px; font-weight: 500; color: #111; letter-spacing: -0.01em; }
.table__sub { font-size: 12px; color: #888; }
.table__empty { text-align: center; font-size: 12px; color: #bbb; padding: 32px; font-family: 'Geist Mono', monospace; }
.table__actions { display: flex; gap: 6px; justify-content: flex-end; }
.action-btn { font-family: 'Geist', sans-serif; font-size: 11px; font-weight: 500; padding: 5px 10px; border-radius: 5px; cursor: pointer; border: 1px solid #e5e5e5; background: #fff; color: #555; transition: all 0.15s; }
.action-btn:hover { border-color: #111; color: #111; }
.action-btn--danger:hover { border-color: #e5484d; color: #e5484d; background: #fff5f5; }

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
.form__error { font-size: 11px; color: #e5484d; font-family: 'Geist Mono', monospace; }
.modal__footer { display: flex; gap: 8px; justify-content: flex-end; padding-top: 8px; border-top: 1px solid #f0f0f0; }
</style>