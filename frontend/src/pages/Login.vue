<template>
  <div class="auth">
    <div class="auth__card">
      <div class="auth__header">
        <div class="logo">
          <img src="/logo.png" alt="logo">
        </div>
        <h1 class="auth__title">Bienvenido</h1>
        <p class="auth__sub">Inicia sesión en tu cuenta</p>
      </div>

      <form class="auth__form" @submit.prevent="handleLogin">
        <div class="field">
          <label class="field__label">Email</label>
          <input class="field__input" v-model="form.email" type="email" placeholder="tu@email.com" required />
        </div>
        <div class="field">
          <label class="field__label">Contraseña</label>
          <input class="field__input" v-model="form.password" type="password" placeholder="••••••••" required />
        </div>

        <p v-if="error" class="auth__error">{{ error }}</p>

        <button class="btn btn--primary" type="submit" :disabled="loading">
          {{ loading ? "Ingresando..." : "Ingresar" }}
        </button>
      </form>

      <p class="auth__footer">
        ¿No tienes una cuenta?
        <router-link class="auth__link" to="/register">Registrate</router-link>
      </p>
    </div>
  </div>
  <AppFooter />
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth.store";
import AppFooter from "../components/Footer.vue";

const auth = useAuthStore();
const router = useRouter();
const form = ref({ email: "", password: "" });
const error = ref("");
const loading = ref(false);

async function handleLogin() {
  error.value = "";
  loading.value = true;
  try {
    await auth.login(form.value.email, form.value.password);
    router.push(auth.user?.role === "superadmin" ? "/superadmin" : "/dashboard");
  } catch (err) {
    error.value = err.response?.data?.message || "Credenciales incorrectas";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500&family=Geist:wght@400;500;600&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.auth {
  min-height: 95dvh;
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
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.auth__header { display: flex; flex-direction: column; gap: 6px; }

.auth__tag {
  font-family: 'Geist Mono', monospace;
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #999;
}

.auth__title {
  font-size: 22px;
  font-weight: 600;
  color: #111;
  letter-spacing: -0.03em;
  line-height: 1.2;
}

.auth__sub { font-size: 13px; color: #999; }

.auth__form { display: flex; flex-direction: column; gap: 16px; }

.field { display: flex; flex-direction: column; gap: 6px; }

.field__label {
  font-size: 12px;
  font-weight: 500;
  color: #111;
  letter-spacing: -0.01em;
}

.field__input {
  font-family: 'Geist', sans-serif;
  font-size: 13px;
  padding: 9px 12px;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  background: #fff;
  color: #111;
  transition: border-color 0.15s ease;
  outline: none;
  width: 100%;
}

.field__input::placeholder { color: #bbb; }
.field__input:focus { border-color: #111; }

.btn {
  font-family: 'Geist', sans-serif;
  font-size: 12px;
  font-weight: 500;
  padding: 9px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;
  letter-spacing: -0.01em;
  border: 1px solid transparent;
  width: 100%;
}

.btn--primary { background: #111; color: #fff; border-color: #111; margin-top: 4px; }
.btn--primary:hover:not(:disabled) { background: #333; border-color: #333; }
.btn--primary:disabled { opacity: 0.5; cursor: not-allowed; }

.auth__error {
  font-size: 11px;
  color: #e5484d;
  font-family: 'Geist Mono', monospace;
}

.auth__footer {
  font-size: 12px;
  color: #999;
  text-align: center;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.auth__link {
  color: #111;
  font-weight: 500;
  text-decoration: none;
  border-bottom: 1px solid #e5e5e5;
  transition: border-color 0.15s;
}
.auth__link:hover { border-color: #111; }
</style>