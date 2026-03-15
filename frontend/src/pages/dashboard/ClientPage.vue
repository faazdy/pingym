<template>
  <div class="app">
    <AppSidebar />
    <main class="main">
      <div class="page">

        <div class="page__header">
          <div class="page__header-left">
            <span class="page__tag">Gestión</span>
            <h1 class="page__title">Clientes</h1>
          </div>
          <div class="btns-actions" v-if="auth.isAdmin">
            <button class="btn primary" @click="showModal = true">+ Nuevo cliente</button>
          </div>
        </div>

        <div class="toolbar">
          <input class="search" v-model="search" placeholder="Buscar por nombre o email..." />
          <span class="section__count">{{ filteredClients.length }} clientes</span>
        </div>

        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Membresía</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="5" class="table__empty">Cargando...</td>
              </tr>
              <tr v-else-if="filteredClients.length === 0">
                <td colspan="5" class="table__empty">No hay clientes registrados</td>
              </tr>
              <tr v-for="client in filteredClients" :key="client.id" class="table__row">
                <td class="table__name">{{ client.name }}</td>
                <td class="table__sub">{{ client.email }}</td>
                <td class="table__sub">{{ client.phone || "—" }}</td>
                <td>
                  <span v-if="!client.membership_status" class="badge badge--none">Sin membresía</span>
                  <span v-else-if="client.membership_status === 'active'" class="badge badge--active">
                    Activo · {{ client.days_remaining }}d
                  </span>
                  <span v-else class="badge badge--expired">Vencida</span>
                </td>
                <td class="table__actions">
                  <button v-if="auth.isAdmin" class="action-btn" @click="editClient(client)">Editar</button>
                  <button v-if="auth.isAdmin" class="action-btn action-btn--danger" @click="deleteClient(client.user_id)">Eliminar</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Modal -->
        <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
          <div class="modal">
            <div class="modal__header">
              <h2 class="modal__title">{{ editingClient ? "Editar cliente" : "Nuevo cliente" }}</h2>
              <button class="modal__close" @click="closeModal">✕</button>
            </div>
            <form class="modal__form" @submit.prevent="handleSubmit">
              <div class="field">
                <label class="field__label">Nombre</label>
                <input class="field__input" v-model="form.name" required />
              </div>
              <div class="field">
                <label class="field__label">Email</label>
                <input class="field__input" v-model="form.email" type="email" required />
              </div>
              <div class="field" v-if="!editingClient">
                <label class="field__label">Contraseña</label>
                <input class="field__input" v-model="form.password" type="password" required />
              </div>
              <div class="fields-row">
                <div class="field">
                  <label class="field__label">Teléfono</label>
                  <input class="field__input" v-model="form.phone" />
                </div>
                <div class="field">
                  <label class="field__label">EPS</label>
                  <input class="field__input" v-model="form.eps" />
                </div>
              </div>
              <div class="field">
                <label class="field__label">Dirección</label>
                <input class="field__input" v-model="form.address" />
              </div>
              <div class="field">
                <label class="field__label">Contacto de emergencia</label>
                <input class="field__input" v-model="form.emergency_contact" />
              </div>
              <p v-if="formError" class="form__error">{{ formError }}</p>
              <div class="modal__footer">
                <button type="button" class="btn secundary" @click="closeModal">Cancelar</button>
                <button type="submit" class="btn primary">{{ editingClient ? "Guardar" : "Crear" }}</button>
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
const clients = ref([]);
const loading = ref(false);
const search = ref("");
const showModal = ref(false);
const editingClient = ref(null);
const formError = ref("");
const form = ref({ name: "", email: "", password: "", phone: "", address: "", eps: "", emergency_contact: "" });

const filteredClients = computed(() =>
  clients.value.filter(c =>
    c.name?.toLowerCase().includes(search.value.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.value.toLowerCase())
  )
);

async function fetchClients() {
  loading.value = true;
  try {
    const { data } = await api.get(`/clients/${auth.user?.gym_id}`);
    clients.value = data;
  } catch (err) { console.error(err); }
  finally { loading.value = false; }
}

async function handleSubmit() {
  formError.value = "";
  try {
    if (editingClient.value) {
      await api.put(`/clients/detail/${editingClient.value.id}`, form.value);
    } else {
      await api.post("/auth/register-user", { ...form.value, role: "client" });
    }
    closeModal();
    fetchClients();
  } catch (err) {
    formError.value = err.response?.data?.message || "Error al guardar";
  }
}

function editClient(client) {
  editingClient.value = client;
  form.value = { ...client, password: "" };
  showModal.value = true;
}

async function deleteClient(userId) {
  if (!confirm("¿Eliminar este cliente?")) return;
  await api.delete(`/clients/${userId}`);
  fetchClients();
}

function closeModal() {
  showModal.value = false;
  editingClient.value = null;
  form.value = { name: "", email: "", password: "", phone: "", address: "", eps: "", emergency_contact: "" };
}

onMounted(fetchClients);
</script>