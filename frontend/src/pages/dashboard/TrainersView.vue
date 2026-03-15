<template>
  <div class="app">
    <AppSidebar />
    <main class="main">
      <div class="page">

        <div class="page__header">
          <div class="page__header-left">
            <span class="page__tag">Equipo</span>
            <h1 class="page__title">Entrenadores</h1>
          </div>
          <button class="btn primary" @click="showModal = true">+ Nuevo entrenador</button>
        </div>

        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Desde</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="4" class="table__empty">Cargando...</td>
              </tr>
              <tr v-else-if="trainers.length === 0">
                <td colspan="4" class="table__empty">No hay entrenadores registrados</td>
              </tr>
              <tr v-for="t in trainers" :key="t.id" class="table__row">
                <td class="table__name">{{ t.name }}</td>
                <td class="table__sub">{{ t.email }}</td>
                <td class="table__sub">{{ formatDate(t.created_at) }}</td>
                <td class="table__actions">
                  <button class="action-btn" @click="openEdit(t)">Editar</button>
                  <button class="action-btn action-btn--danger" @click="handleDelete(t.id)">Eliminar</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="toast" class="toast" :class="toast.type === 'success' ? 'toast--success' : 'toast--error'">
          {{ toast.message }}
        </div>

        <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
          <div class="modal">
            <div class="modal__header">
              <h2 class="modal__title">{{ editingTrainer ? "Editar entrenador" : "Nuevo entrenador" }}</h2>
              <button class="modal__close" @click="closeModal">✕</button>
            </div>
            <form class="modal__form" @submit.prevent="handleSubmit">
              <div class="field">
                <label class="field__label">Nombre</label>
                <input class="field__input" v-model="form.name" placeholder="Nombre completo" required />
              </div>
              <div class="field">
                <label class="field__label">Email</label>
                <input class="field__input" v-model="form.email" type="email" placeholder="correo@ejemplo.com" required />
              </div>
              <div class="field" v-if="!editingTrainer">
                <label class="field__label">Contraseña</label>
                <input class="field__input" v-model="form.password" type="password" placeholder="••••••••" required />
              </div>
              <p v-if="formError" class="form__error">{{ formError }}</p>
              <div class="modal__footer">
                <button type="button" class="btn secundary" @click="closeModal">Cancelar</button>
                <button type="submit" class="btn primary" :disabled="loading">
                  {{ editingTrainer ? "Guardar" : "Crear" }}
                </button>
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
const trainers = ref([]);
const loading = ref(false);
const showModal = ref(false);
const editingTrainer = ref(null);
const formError = ref("");
const toast = ref(null);
const form = ref({ name: "", email: "", password: "" });

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
}

function showToast(message, type = "success") {
  toast.value = { message, type };
  setTimeout(() => toast.value = null, 3000);
}

async function fetchTrainers() {
  loading.value = true;
  try {
    const { data } = await api.get("/trainers");
    trainers.value = data;
  } catch (err) { console.error(err); }
  finally { loading.value = false; }
}

async function handleSubmit() {
  formError.value = "";
  try {
    if (editingTrainer.value) {
      await api.put(`/trainers/${editingTrainer.value.id}`, { name: form.value.name, email: form.value.email });
      showToast("Entrenador actualizado");
    } else {
      await api.post("/trainers", form.value);
      showToast("Entrenador creado");
    }
    closeModal();
    fetchTrainers();
  } catch (err) {
    formError.value = err.response?.data?.message || "Error al guardar";
  }
}

async function handleDelete(id) {
  if (!confirm("¿Eliminar este entrenador?")) return;
  try {
    await api.delete(`/trainers/${id}`);
    showToast("Entrenador eliminado");
    fetchTrainers();
  } catch (err) {
    showToast(err.response?.data?.message || "Error al eliminar", "error");
  }
}

function openEdit(t) {
  editingTrainer.value = t;
  form.value = { name: t.name, email: t.email, password: "" };
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  editingTrainer.value = null;
  form.value = { name: "", email: "", password: "" };
  formError.value = "";
}

onMounted(fetchTrainers);
</script>