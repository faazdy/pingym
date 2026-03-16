<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "../stores/auth.store";
import api from "../services/api";

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

const step = ref(1); // 1: datos personales, 2: ¿tenés gym?, 3: datos del gym
const hasGym = ref(null);
const gymFromQr = ref(null);

const form = ref({ name: "", email: "", password: "" });
const gymForm = ref({ name: "", address: "", phone: "" });

const error = ref("");
const success = ref("");
const loading = ref(false);

onMounted(() => {
  const gymId = route.query.gym_id;
  if (gymId) {
    api.get(`/auth/gym-info/${gymId}`).then(({ data }) => {
      gymFromQr.value = data;
    }).catch(() => {});
  }
});

async function handleRegister() {
  error.value = "";
  success.value = "";
  loading.value = true;
  try {
    let payload = { ...form.value };

    if (gymFromQr.value) {
      // Caso QR: client vinculado a gym existente
      payload.gym_id = gymFromQr.value.id;
    } else if (hasGym.value) {
      // Caso con gym: admin + gym nuevo
      payload.gym = { ...gymForm.value };
    }
    // Caso sin gym: solo datos personales → client independiente

    await auth.register(payload);
    success.value = "Cuenta creada correctamente. Redirigiendo…";
    setTimeout(() => router.push("/login"), 1500);
  } catch (err) {
    error.value = err.response?.data?.message || "Error al registrarse";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="auth">
    <div class="auth__card">
      <div class="auth__header">
        <div class="logo">
          <img src="/logo.png" alt="logo">
        </div>
        <h1 class="auth__title">Crear cuenta</h1>
        <p class="auth__sub">
          {{ gymFromQr ? `Registro en ${gymFromQr.name}` : 'Completa tus datos para registrarte' }}
        </p>
      </div>

      <form class="auth__form" @submit.prevent="handleRegister">

        <!-- Paso 1: Datos personales -->
        <template v-if="step === 1">
          <div class="field">
            <label class="field__label">Nombre</label>
            <input class="field__input" v-model="form.name" type="text" placeholder="Tu nombre" required />
          </div>
          <div class="field">
            <label class="field__label">Email</label>
            <input class="field__input" v-model="form.email" type="email" placeholder="tu@email.com" required />
          </div>
          <div class="field">
            <label class="field__label">Contraseña</label>
            <input class="field__input" v-model="form.password" type="password" placeholder="••••••••" required />
          </div>
          <button
            type="button"
            class="btn btn--primary"
            @click="gymFromQr ? handleRegister() : step = 2"
            :disabled="!form.name || !form.email || !form.password"
          >
            Continuar
          </button>
        </template>

        <!-- Paso 2: ¿Tenés gym? (solo si no viene de QR) -->
        <template v-if="step === 2 && !gymFromQr">
          <p class="wizard__question">¿Quieres registrar un gym?</p>
          <p class="wizard__sub">Si tienes un gimnasio, puedes registrarlo y administrarlo desde la app.</p>
          <div class="wizard__options">
            <button type="button" class="wizard__option" @click="hasGym = true; step = 3">
              <span class="wizard__option-icon">🏋️</span>
              <span class="wizard__option-label">Sí, tengo un gym</span>
              <span class="wizard__option-sub">Registra tu gym y gestiona clientes</span>
            </button>
            <button type="button" class="wizard__option" @click="hasGym = false; handleRegister()">
              <span class="wizard__option-icon">👤</span>
              <span class="wizard__option-label">No, solo quiero usar la app</span>
              <span class="wizard__option-sub">Controla tus ejercicios y progreso</span>
            </button>
          </div>
          <button type="button" class="btn btn--ghost" @click="step = 1">← Volver</button>
        </template>

        <!-- Paso 3: Datos del gym -->
        <template v-if="step === 3">
          <p class="wizard__question">Datos de tu gym</p>
          <div class="field">
            <label class="field__label">Nombre del gym</label>
            <input class="field__input" v-model="gymForm.name" placeholder="Ej: Iron Gym" required />
          </div>
          <div class="field">
            <label class="field__label">Dirección</label>
            <input class="field__input" v-model="gymForm.address" placeholder="Calle 123" />
          </div>
          <div class="field">
            <label class="field__label">Teléfono</label>
            <input class="field__input" v-model="gymForm.phone" placeholder="+57 300 000 0000" />
          </div>

          <p v-if="error" class="auth__error">{{ error }}</p>
          <p v-if="success" class="auth__success">{{ success }}</p>

          <button type="submit" class="btn btn--primary" :disabled="loading || !gymForm.name">
            {{ loading ? "Registrando..." : "Crear cuenta y gym" }}
          </button>
          <button type="button" class="btn btn--ghost" @click="step = 2">← Volver</button>
        </template>

        <!-- Errores en paso 1 y 2 -->
        <p v-if="error && step !== 3" class="auth__error">{{ error }}</p>
        <p v-if="success && step !== 3" class="auth__success">{{ success }}</p>

      </form>

      <p class="auth__footer">
        ¿Ya tienes una cuenta?
        <router-link class="auth__link" to="/login">Inicia sesión</router-link>
      </p>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500&family=Geist:wght@400;500;600&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.auth {
  min-height: 100vh;
  background-image: url('../assets/images/backgrounds/bgauth.png');
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Geist', sans-serif;
  padding: 24px;
}
.auth .logo img{
  width: auto;
  height: 60px;
  object-fit: contain;
}

.auth__card {
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 10px;
  padding: 40px;
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.auth__header { display: flex; flex-direction: column; gap: 6px; }
.auth__tag { font-family: 'Geist Mono', monospace; font-size: 10px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: #999; }
.auth__title { font-size: 22px; font-weight: 600; color: #111; letter-spacing: -0.03em; line-height: 1.2; }
.auth__sub { font-size: 13px; color: #999; }

.auth__form { display: flex; flex-direction: column; gap: 14px; }

.field { display: flex; flex-direction: column; gap: 6px; }
.field__label { font-size: 12px; font-weight: 500; color: #111; letter-spacing: -0.01em; }
.field__input { font-family: 'Geist', sans-serif; font-size: 13px; padding: 9px 12px; border: 1px solid #e5e5e5; border-radius: 6px; background: #fff; color: #111; transition: border-color 0.15s ease; outline: none; width: 100%; }
.field__input::placeholder { color: #bbb; }
.field__input:focus { border-color: #111; }

.btn { font-family: 'Geist', sans-serif; font-size: 12px; font-weight: 500; padding: 9px 16px; border-radius: 6px; cursor: pointer; transition: all 0.15s ease; letter-spacing: -0.01em; border: 1px solid transparent; width: 100%; }
.btn--primary { background: #111; color: #fff; border-color: #111; margin-top: 4px; }
.btn--primary:hover:not(:disabled) { background: #333; border-color: #333; }
.btn--primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn--ghost { background: transparent; color: #999; border-color: transparent; font-size: 12px; }
.btn--ghost:hover { color: #111; }

.wizard__question { font-size: 15px; font-weight: 600; color: #111; letter-spacing: -0.02em; }
.wizard__sub { font-size: 12px; color: #999; margin-top: -8px; }

.wizard__options { display: flex; flex-direction: column; gap: 8px; }

.wizard__option {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  padding: 14px 16px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  text-align: left;
  transition: border-color 0.15s, background 0.15s;
  width: 100%;
}
.wizard__option:hover { border-color: #111; background: #fafafa; }
.wizard__option-icon { font-size: 18px; margin-bottom: 4px; }
.wizard__option-label { font-size: 13px; font-weight: 600; color: #111; font-family: 'Geist', sans-serif; }
.wizard__option-sub { font-size: 11px; color: #999; font-family: 'Geist', sans-serif; }

.auth__error { font-size: 11px; color: #e5484d; font-family: 'Geist Mono', monospace; }
.auth__success { font-size: 11px; color: #30a46c; font-family: 'Geist Mono', monospace; }

.auth__footer { font-size: 12px; color: #999; text-align: center; padding-top: 16px; border-top: 1px solid #f0f0f0; }
.auth__link { color: #111; font-weight: 500; text-decoration: none; border-bottom: 1px solid #e5e5e5; transition: border-color 0.15s; }
.auth__link:hover { border-color: #111; }
</style>