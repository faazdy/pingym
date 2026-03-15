<template>
  <div class="app">
    <AppSidebar />
    <main class="main">
      <div class="page page--narrow">

        <div class="page__header">
          <div class="page__header-left">
            <span class="page__tag">Blog</span>
            <h1 class="page__title">Novedades del gym</h1>
          </div>
          <button v-if="auth.isAdmin || auth.isTrainer" class="btn primary" @click="openCreate">+ Nueva entrada</button>
        </div>

        <div v-if="loading" class="empty">Cargando...</div>
        <div v-else-if="posts.length === 0" class="empty">No hay publicaciones. Crea la primera.</div>

        <div v-else class="posts-list">
          <div v-for="p in posts" :key="p.id" class="post-card">
            <div v-if="p.image" class="post-card__image" :style="{ backgroundImage: `url(${p.image})` }"></div>
            <div class="post-card__body">
              <div class="post-card__meta">
                <span class="post-card__author">{{ p.author_name || "Sin autor" }}</span>
                <span class="post-card__dot">·</span>
                <span class="post-card__date">{{ formatDate(p.created_at) }}</span>
              </div>
              <h2 class="post-card__title">{{ p.title }}</h2>
              <p class="post-card__excerpt">{{ excerpt(p.content) }}</p>
            </div>
            <div class="post-card__footer" v-if="canEditPost(p)">
              <button class="action-btn" @click="editPost(p)">Editar</button>
              <button class="action-btn action-btn--danger" @click="deletePost(p)">Eliminar</button>
            </div>
          </div>
        </div>

        <!-- Modal -->
        <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
          <div class="modal modal--wide">
            <div class="modal__header">
              <h2 class="modal__title">{{ editingPost ? "Editar entrada" : "Nueva entrada" }}</h2>
              <button class="modal__close" @click="closeModal">✕</button>
            </div>
            <form class="modal__form" @submit.prevent="handleSubmit">
              <div class="field">
                <label class="field__label">Título</label>
                <input class="field__input" v-model="form.title" placeholder="Título de la entrada" required />
              </div>
              <div class="field">
                <label class="field__label">Contenido</label>
                <textarea class="field__input field__textarea" v-model="form.content" rows="6" placeholder="Escribe el contenido..."></textarea>
              </div>
              <div class="field">
                <label class="field__label">URL de imagen (opcional)</label>
                <input class="field__input" v-model="form.image" placeholder="https://..." />
              </div>
              <p v-if="formError" class="form__error">{{ formError }}</p>
              <div class="modal__footer">
                <button type="button" class="btn secundary" @click="closeModal">Cancelar</button>
                <button type="submit" class="btn primary">{{ editingPost ? "Guardar" : "Crear" }}</button>
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
const posts = ref([]);
const loading = ref(false);
const showModal = ref(false);
const editingPost = ref(null);
const formError = ref("");
const form = ref({ title: "", content: "", image: "" });

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
}

function excerpt(text) {
  if (!text) return "Sin contenido.";
  return text.length > 120 ? text.slice(0, 120) + "…" : text;
}

async function fetchPosts() {
  loading.value = true;
  try {
    const { data } = await api.get(`/posts/gym/${auth.user?.gym_id}`);
    posts.value = data;
  } catch (err) { console.error(err); }
  finally { loading.value = false; }
}

function openCreate() {
  editingPost.value = null;
  form.value = { title: "", content: "", image: "" };
  showModal.value = true;
}

function editPost(p) {
  editingPost.value = p;
  form.value = { title: p.title, content: p.content || "", image: p.image || "" };
  showModal.value = true;
}
function canEditPost(post) {
  if (auth.isAdmin) return true;
  if (auth.isTrainer) return post.author_id === auth.user?.id;
  return false;
}

async function handleSubmit() {
  formError.value = "";
  try {
    if (editingPost.value) {
      await api.put(`/posts/${editingPost.value.id}`, form.value);
    } else {
      await api.post("/posts", form.value);
    }
    closeModal();
    fetchPosts();
  } catch (err) {
    formError.value = err.response?.data?.message || "Error al guardar";
  }
}

async function deletePost(p) {
  if (!confirm("¿Eliminar esta entrada?")) return;
  try {
    await api.delete(`/posts/${p.id}`);
    fetchPosts();
  } catch (err) { console.error(err); }
}

function closeModal() {
  showModal.value = false;
  editingPost.value = null;
  form.value = { title: "", content: "", image: "" };
  formError.value = "";
}

onMounted(fetchPosts);
</script>

<style scoped>
.posts-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.post-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: border-color 0.15s;
}

.post-card:hover { border-color: var(--color-text); }

.post-card__image {
  width: 100%;
  height: 180px;
  background-size: cover;
  background-position: center;
  background-color: #f0f0f0;
}

.post-card__body {
  padding: 20px 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.post-card__meta {
  display: flex;
  align-items: center;
  gap: 6px;
}

.post-card__author {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  color: var(--color-text);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.post-card__dot { color: var(--color-text-muted); font-size: 11px; }

.post-card__date {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-muted);
}

.post-card__title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
  letter-spacing: -0.02em;
  line-height: 1.3;
}

.post-card__excerpt {
  font-size: 13px;
  color: var(--color-text-sub);
  line-height: 1.6;
}

.post-card__footer {
  display: flex;
  gap: 6px;
  padding: 12px 24px;
  border-top: 1px solid #f0f0f0;
}

.modal--wide { max-width: 520px; }
</style>