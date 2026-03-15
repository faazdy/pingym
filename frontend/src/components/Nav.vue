<script setup>
import { computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.store'

const router = useRouter()
const auth = useAuthStore()

const navItems = computed(() => {
  const items = [
    { to: '/dashboard', icon: '⬡', label: 'Dashboard' },
    { to: '/clients', icon: '◎', label: 'Clientes', show: () => auth.isAdmin || auth.isTrainer },
    { to: '/trainers', icon: '◉', label: 'Entrenadores', show: () => auth.isAdmin },
    { to: '/memberships', icon: '▣', label: 'Membresías', show: () => auth.isAdmin },
    { to: '/routines', icon: '◈', label: 'Rutinas' },
    { to: '/attendance', icon: '✓', label: 'Asistencia', show: () => auth.hasGym },
    { to: '/lockers', icon: '▢', label: 'Casilleros' },
    { to: '/progress', icon: '↗', label: 'Progreso' },
    { to: '/posts', icon: '◇', label: 'Noticias', show: () => auth.hasGym },
    { to: '/qr', icon: '⬚', label: 'QR', show: () => auth.isAdmin },
  ]
  return items.filter((item) => (item.show ? item.show() : true))
})

const logout = () => {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <header class="glass-header">
    <div class="liquidGlass-wrapper glass-nav">
      <div class="liquidGlass-effect"></div>
      <div class="liquidGlass-tint"></div>
      <div class="liquidGlass-shine"></div>

      <nav class="liquidGlass-text">
        <ul>
          <!-- Logo -->
          <li class="nav-logo-item">
            <RouterLink to="/dashboard">
              <img src="/logo.png" alt="Logo" class="nav-logo" />
            </RouterLink>
          </li>

          <li v-for="item in navItems" :key="item.to">
            <RouterLink :to="item.to" active-class="nav-link--active">
              <span class="nav-icon">{{ item.icon }}</span>
              <span class="nav-label">{{ item.label }}</span>
            </RouterLink>
          </li>

          <li>
            <button class="nav-logout" @click="logout">
              <span class="nav-icon">⎋</span>
              <span class="nav-label">Salir</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  </header>

  <svg style="display: none">
    <filter id="glass-distortion">
      <feTurbulence type="fractalNoise" baseFrequency="0.01 0.01" numOctaves="1" seed="5" />
      <feGaussianBlur stdDeviation="3" result="softMap" />
      <feDisplacementMap in="SourceGraphic" in2="softMap" scale="120" />
    </filter>
  </svg>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500&family=Geist:wght@400;500;600&display=swap');

.glass-header {
  position: fixed;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
}

.glass-nav {
  width: fit-content;
  height: 56px;
  border-radius: 2.5rem;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
}

.liquidGlass-wrapper {
  position: relative;
  display: flex;
  overflow: hidden;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.18),
    0 2px 8px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

.liquidGlass-effect {
  position: absolute;
  inset: 0;
  backdrop-filter: blur(16px) saturate(180%);
  filter: url(#glass-distortion);
  z-index: 0;
}

.liquidGlass-tint {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.5);
  z-index: 1;
}

.liquidGlass-shine {
  position: absolute;
  inset: 0;
  z-index: 2;
  box-shadow:
    inset 1px 1px 1px rgba(255, 255, 255, 0.8),
    inset -1px -1px 1px rgba(255, 255, 255, 0.3);
}

.liquidGlass-text {
  position: relative;
  z-index: 3;
  height: 100%;
  display: flex;
  align-items: center;
}

nav ul {
  display: flex;
  gap: 4px;
  list-style: none;
  padding: 0 6px;
  margin: 0;
  align-items: center;
  height: 100%;
}

nav li {
  display: flex;
  align-items: center;
}

/* ── Logo ── */
.nav-logo-item {
  margin-right: 4px;
  padding-right: 8px;
  border-right: 1px solid rgba(0, 0, 0, 0.1);
}

.nav-logo-item a {
  padding: 4px 6px;
  border-radius: 8px;
  display: flex;
  align-items: center;
}

.nav-logo {
  height: 28px;
  width: auto;
  display: block;
  object-fit: contain;
}

/* ── Links ── */
nav a,
.nav-logout {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Geist', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.55);
  text-decoration: none;
  padding: 7px 14px;
  border-radius: 999px;
  transition: background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
  white-space: nowrap;
  letter-spacing: -0.01em;
  border: none;
  background: none;
  cursor: pointer;
}

nav a:hover,
.nav-logout:hover {
  color: #111;
  background: rgba(255, 255, 255, 0.65);
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.8),
    0 2px 8px rgba(0, 0, 0, 0.06);
}

.nav-link--active {
  color: #111 !important;
  background: rgba(255, 255, 255, 0.7) !important;
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.9),
    0 2px 8px rgba(0, 0, 0, 0.08) !important;
}

.nav-icon {
  font-size: 14px;
  line-height: 1;
  opacity: 0.7;
}

.nav-link--active .nav-icon,
nav a:hover .nav-icon,
.nav-logout:hover .nav-icon {
  opacity: 1;
}

nav li:last-child {
  margin-left: 4px;
  padding-left: 8px;
  border-left: 1px solid rgba(0, 0, 0, 0.1);
}

.nav-logout {
  color: rgba(0, 0, 0, 0.4);
}

.nav-logout:hover {
  color: #e5484d;
  background: rgba(229, 72, 77, 0.08);
  box-shadow: inset 0 0 0 1px rgba(229, 72, 77, 0.15);
}


/* En móvil, ocultamos etiquetas de la barra principal pero no del menú burger */
@media (max-width: 768px) {
  .glass-nav .nav-label {
    display: none;
  }
  .burger-menu-content .nav-label {
    display: inline;
  }
}
</style>