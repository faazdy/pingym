<template>
  <div class="app">
    <AppSidebar />
    <main class="main">
      <div class="page page--narrow">

        <div class="page__header">
          <div class="page__header-left">
            <span class="page__tag">Registro</span>
            <h1 class="page__title">QR de registro</h1>
          </div>
        </div>

        <p class="qr-desc">
          Compartí este enlace o el código QR para que nuevos clientes se registren directamente en tu gym.
          No requiere login — al escanearlo llegarán al formulario con tu gym preseleccionado.
        </p>

        <div v-if="loading" class="empty">Cargando...</div>

        <div v-else-if="qrData" class="widget qr-card">
          <div class="qr-card__image" ref="qrPlaceholder">
            <span class="qr-card__image-hint">QR aquí</span>
          </div>
          <div class="qr-card__info">
            <p class="qr-card__gym">{{ qrData.gym_name }}</p>
            <a :href="qrData.register_url" target="_blank" rel="noopener" class="qr-card__link">
              {{ qrData.register_url }}
            </a>
            <button class="btn primary qr-card__btn" @click="copyLink">
              {{ copied ? "✓ Copiado" : "Copiar enlace" }}
            </button>
          </div>
        </div>

        <div v-else class="empty">No se pudo cargar el enlace de registro.</div>

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
const qrData = ref(null);
const loading = ref(true);
const copied = ref(false);
const qrPlaceholder = ref(null);

async function fetchQr() {
  if (!auth.user?.gym_id) return;
  loading.value = true;
  try {
    const { data } = await api.get(`/qr/register/${auth.user.gym_id}`);
    qrData.value = data;
  } catch (err) { console.error(err); }
  finally { loading.value = false; }
}

function copyLink() {
  if (!qrData.value?.register_url) return;
  navigator.clipboard.writeText(qrData.value.register_url);
  copied.value = true;
  setTimeout(() => { copied.value = false; }, 2000);
}

onMounted(fetchQr);
</script>

<style scoped>
.qr-desc {
  font-size: 13px;
  color: var(--color-text-sub);
  line-height: 1.6;
}

.qr-card {
  display: flex;
  align-items: center;
  gap: 32px;
}

.qr-card__image {
  width: 180px;
  height: 180px;
  flex-shrink: 0;
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.qr-card__image-hint {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-muted);
}

.qr-card__info {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}

.qr-card__gym {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
  letter-spacing: -0.02em;
}

.qr-card__link {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-sub);
  word-break: break-all;
  line-height: 1.5;
  text-decoration: none;
  border-bottom: 1px solid var(--color-border);
  transition: border-color 0.15s;
}

.qr-card__link:hover { border-color: var(--color-text); color: var(--color-text); }

.qr-card__btn { align-self: flex-start; margin-top: 4px; }
</style>