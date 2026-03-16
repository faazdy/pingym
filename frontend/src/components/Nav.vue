<script setup>
import { computed, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.store'

const router = useRouter()
const auth = useAuthStore()

const menuOpen = ref(false)

const openMenu = () => {
  menuOpen.value = true
}

const closeMenu = () => {
  menuOpen.value = false
}

const navItems = computed(() => {
  const items = [
    { to: '/dashboard', icon: '⬡', label: 'Dashboard' },
    { to: '/clients', icon: '◎', label: 'Clientes', show: () => auth.isAdmin || auth.isTrainer },
    { to: '/trainers', icon: '◉', label: 'Entrenadores', show: () => auth.isAdmin },
    { to: '/memberships', icon: '▣', label: 'Membresías', show: () => auth.isAdmin },
    { to: '/routines', icon: '◈', label: 'Rutinas' },
    { to: '/attendance', icon: '✓', label: 'Asistencia', show: () => auth.hasGym },
    { to: '/lockers', icon: '▢', label: 'Casilleros', show: () => auth.hasGym },
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
  <!-- NAVBAR PRINCIPAL -->
  <header class="glass-header">

    <div class="liquidGlass-wrapper glass-nav">
      <div class="liquidGlass-effect"></div>
      <div class="liquidGlass-tint"></div>
      <div class="liquidGlass-shine"></div>

      <nav class="liquidGlass-text">
        <ul>

          <li class="nav-logo-item">
            <RouterLink to="/dashboard">
              <img src="/logo.png" alt="Logo" class="nav-logo" />
            </RouterLink>
          </li>

          <li v-for="item in navItems" :key="item.to" class="menu-phill-tags">
            <RouterLink :to="item.to" active-class="nav-link--active">
              <span class="nav-icon">{{ item.icon }}</span>
              <span class="nav-label">{{ item.label }}</span>
            </RouterLink>
          </li>

          <li class="responsive-menu">
            <button class="burger-btn" @click="openMenu">
              ☰ MENU
            </button>
          </li>

          <li class="menu-phill-tags">
            <button class="nav-logout" @click="logout">
              <span class="nav-icon">⎋</span>
              <span class="nav-label">Salir</span>
            </button>
          </li>

        </ul>
      </nav>
    </div>
  </header>

  <!-- MENÚ RESPONSIVE -->
  <aside :class="menuOpen ? 'asidebar-menu open' : 'asidebar-menu'">
    <nav>
      <div class="header-nav">
        <h1>Menu</h1>
        <button @click="closeMenu">X</button>
      </div>
      <h3>Navegación</h3>
      <ul class="nav-tags-container">
        <li v-for="item in navItems">
          <RouterLink :to="item.to" active-class="nav-link--active">
            <span class="nav-label">{{ item.label }}</span>
          </RouterLink>
        </li>
      </ul>
      <div class="nav-bottom">
        <h3>Cuenta</h3>
        <br>
        <ul class="nav-tags-container">
          <li>
            <button class="nav-logout" @click="logout">
              <span class="nav-label">Salir</span>
            </button>
          </li>
        </ul>
      </div>
    </nav>
  </aside>

  <svg style="display:none">
    <filter id="glass-distortion">
      <feTurbulence type="fractalNoise" baseFrequency="0.01 0.01" numOctaves="1" seed="5" />
      <feGaussianBlur stdDeviation="3" result="softMap" />
      <feDisplacementMap in="SourceGraphic" in2="softMap" scale="120" />
    </filter>
  </svg>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&display=swap');

/* NAVBAR */

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
}

.liquidGlass-tint {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.5);
}

.liquidGlass-shine {
  position: absolute;
  inset: 0;
  box-shadow:
    inset 1px 1px 1px rgba(255, 255, 255, 0.8),
    inset -1px -1px 1px rgba(255, 255, 255, 0.3);
}

.liquidGlass-text {
  position: relative;
  z-index: 3;
  display: flex;
  align-items: center;
}

.liquidGlass-text ul {
  display: flex;
  gap: 4px;
  list-style: none;
  padding: 0 6px;
  margin: 0;
  align-items: center;
}

.nav-logo {
  height: 28px;
}

/* LINKS */

.liquidGlass-text a,
.nav-logout {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Geist', sans-serif;
  font-size: 13px;
  color: rgba(0, 0, 0, 0.55);
  text-decoration: none;
  padding: 7px 14px;
  border-radius: 999px;
  border: none;
  background: none;
  cursor: pointer;
  transition: .2s ease;
}

.liquidGlass-text a:hover {
  color: #111;
  background: rgba(255, 255, 255, 0.65);
}

.nav-link--active {
  color: #111 !important;
  background: rgba(255, 255, 255, 0.7) !important;
}

/* BURGER */

.burger-btn {
  font-size: 20px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 6px 10px;
}

/* SIDEBAR OVERLAY */
.responsive-menu{
  display: none;
}

.asidebar-menu {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(2px);
  z-index: 2000;
  justify-content: flex-end;
}

.open {
  display: flex;
}

.asidebar-menu .nav-link--active {
  background-color: #ffb8032a !important;
  color: #ff9203 !important;
}

/* SIDEBAR PANEL */

.asidebar-menu nav {
  width: 100%;
  max-width: 420px;
  background: white;
  overflow: auto;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 30px;
  border-radius: 30px 0 0 30px;
  animation: slideIn .25s ease;
}

/* HEADER SIDEBAR */

.header-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.2);
  padding-bottom: 1.2em;
}

.header-nav button {
  padding: 7px 15px;
  font-size: 15px;
  background: transparent;
  border: 1px solid rgba(0, 0, 0, 0.28);
  border-radius: 10px;
  cursor: pointer;
}

/* TITLES */

.asidebar-menu h3 {
  font-size: 18px;
  font-weight: 500;
  color: rgb(255, 187, 61);
}

/* LINKS SIDEBAR */

.nav-tags-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.nav-tags-container li {
  list-style: none;
  font-size: 18px;
}

.nav-tags-container a {
  padding: 10px 15px;
  display: block;
  text-decoration: none;
  color: black;
  border-radius: 20px;
  transition: .2s ease;
}

.nav-tags-container a:hover {
  background: rgba(0, 0, 0, 0.08);
}

/* BOTTOM */

.nav-bottom {
  margin-top: auto;
}

.nav-bottom .nav-logout{
  display: block;
  border: 1px solid rgba(255, 0, 0, 0.274);
  color: rgba(230, 0, 0, 0.541);
  width: 100%;
  text-align: center;
}

.nav-logout:hover{
  border: 1px solid rgba(255, 0, 0, 0.274);
  background: rgba(230, 0, 0, 0.541);
  color: white;
}

/* ANIMATION */

@keyframes slideIn {
  from {
    transform: translateX(100%);
  }

  to {
    transform: translateX(0);
  }
}

/* RESPONSIVE */

@media (max-width:1300px) {
  .responsive-menu{
    display: block;
  }

  .menu-phill-tags{
    display: none;
  }

  .liquidGlass-text .nav-label {
    display: none;
  }

}
</style>
