<template>
  <div class="app">
    <AppSidebar />
    <main class="main">
      <div class="page page--narrow">

        <div class="page__header">
          <div class="page__header-left">
            <span class="page__tag">Gestión</span>
            <h1 class="page__title">Membresías</h1>
          </div>
          <div class="btns-actions">
            <button class="btn secundary" @click="showAssignModal = true">Asignar a cliente</button>
            <button class="btn primary" @click="openCreateModal">+ Nueva membresía</button>
          </div>
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
                <td colspan="3" class="table__empty">No hay membresías. Crea una para poder asignarlas a clientes.</td>
              </tr>
              <tr v-for="m in memberships" :key="m.id" class="table__row">
                <td class="table__name">{{ m.name }}</td>
                <td class="table__sub">{{ m.duration_days }} días</td>
                <td class="table__actions">
                  <button class="action-btn" @click="openEditModal(m)">Editar</button>
                  <button class="action-btn action-btn--danger" @click="handleDelete(m.id)">Eliminar</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="toast" class="toast" :class="toast.type === 'success' ? 'toast--success' : 'toast--error'">
          {{ toast.message }}
        </div>

        <!-- Modal crear / editar -->
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
                <input class="field__input" v-model="form.duration_days" type="number" min="1" placeholder="30" required />
              </div>
              <p v-if="formError" class="form__error">{{ formError }}</p>
              <div class="modal__footer">
                <button type="button" class="btn secundary" @click="closeModal">Cancelar</button>
                <button type="submit" class="btn primary">{{ editingMembership ? "Guardar" : "Crear" }}</button>
              </div>
            </form>
          </div>
        </div>

        <!-- Modal asignar -->
        <div v-if="showAssignModal" class="modal-overlay" @click.self="closeAssignModal">
          <div class="modal">
            <div class="modal__header">
              <h2 class="modal__title">Asignar membresía</h2>
              <button class="modal__close" @click="closeAssignModal">✕</button>
            </div>
            <form class="modal__form" @submit.prevent="handleAssign">
              <div class="field">
                <label class="field__label">Cliente</label>
                <select class="field__input" v-model="assignForm.client_id" required>
                  <option value="">Selecciona un cliente</option>
                  <option v-for="c in clients" :key="c.id" :value="c.id">{{ c.name }} — {{ c.email }}</option>
                </select>
              </div>
              <div class="field">
                <label class="field__label">Membresía</label>
                <select class="field__input" v-model="assignForm.membership_id" required>
                  <option value="">Selecciona una membresía</option>
                  <option v-for="m in memberships" :key="m.id" :value="m.id">{{ m.name }} ({{ m.duration_days }} días)</option>
                </select>
              </div>
              <p v-if="assignError" class="form__error">{{ assignError }}</p>
              <div class="modal__footer">
                <button type="button" class="btn secundary" @click="closeAssignModal">Cancelar</button>
                <button type="submit" class="btn primary" :disabled="assignLoading">
                  {{ assignLoading ? "Asignando..." : "Asignar" }}
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
const memberships = ref([]);
const clients = ref([]);
const loading = ref(false);
const assignLoading = ref(false);
const showModal = ref(false);
const showAssignModal = ref(false);
const editingMembership = ref(null);
const formError = ref("");
const assignError = ref("");
const toast = ref(null);
const form = ref({ name: "", duration_days: "" });
const assignForm = ref({ client_id: "", membership_id: "" });

function showToast(message, type = "success") {
  toast.value = { message, type };
  setTimeout(() => toast.value = null, 3000);
}

async function fetchMemberships() {
  loading.value = true;
  try {
    const { data } = await api.get(`/memberships/gym/${auth.user?.gym_id}`);
    memberships.value = data;
  } catch (err) { console.error(err); }
  finally { loading.value = false; }
}

async function fetchClients() {
  try {
    const { data } = await api.get(`/clients/${auth.user?.gym_id}`);
    clients.value = data;
  } catch (err) { console.error(err); }
}

function openCreateModal() {
  editingMembership.value = null;
  form.value = { name: "", duration_days: "" };
  showModal.value = true;
}

function openEditModal(m) {
  editingMembership.value = m;
  form.value = { name: m.name, duration_days: m.duration_days };
  showModal.value = true;
}

async function handleSubmit() {
  formError.value = "";
  try {
    if (editingMembership.value) {
      await api.put(`/memberships/${editingMembership.value.id}`, {
        name: form.value.name,
        duration_days: Number(form.value.duration_days)
      });
      showToast("Membresía actualizada");
    } else {
      await api.post("/memberships", {
        name: form.value.name,
        duration_days: Number(form.value.duration_days)
      });
      showToast("Membresía creada");
    }
    closeModal();
    fetchMemberships();
  } catch (err) {
    formError.value = err.response?.data?.message || "Error al guardar";
  }
}

async function handleAssign() {
  assignError.value = "";
  assignLoading.value = true;
  try {
    await api.post("/memberships/assign", {
      client_id: assignForm.value.client_id,
      membership_id: assignForm.value.membership_id
    });
    closeAssignModal();
    showToast("Membresía asignada correctamente");
  } catch (err) {
    assignError.value = err.response?.data?.message || "Error al asignar";
  } finally {
    assignLoading.value = false;
  }
}

async function handleDelete(id) {
  if (!confirm("¿Eliminar esta membresía?")) return;
  try {
    await api.delete(`/memberships/${id}`);
    showToast("Membresía eliminada");
    fetchMemberships();
  } catch (err) {
    showToast(err.response?.data?.message || "Error al eliminar", "error");
  }
}

function closeModal() {
  showModal.value = false;
  editingMembership.value = null;
  form.value = { name: "", duration_days: "" };
  formError.value = "";
}

function closeAssignModal() {
  showAssignModal.value = false;
  assignForm.value = { client_id: "", membership_id: "" };
  assignError.value = "";
}

onMounted(() => {
  fetchMemberships();
  fetchClients();
});
</script>