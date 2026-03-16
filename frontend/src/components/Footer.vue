<script setup>
import { RouterLink } from 'vue-router'

const year = new Date().getFullYear()

const columns = [
  {
    title: 'Plataforma',
    links: [
      { label: 'Dashboard', to: '/dashboard' },
      { label: 'Clientes', to: '/clients' },
      { label: 'Entrenadores', to: '/trainers' },
      { label: 'Membresías', to: '/memberships' },
    ],
  },
  {
    title: 'Herramientas',
    links: [
      { label: 'Rutinas', to: '/routines' },
      { label: 'Asistencia', to: '/attendance' },
      { label: 'Casilleros', to: '/lockers' },
      { label: 'Progreso', to: '/progress' },
    ],
  },
  {
    title: 'Gimnasio',
    links: [
      { label: 'Noticias', to: '/posts' },
      { label: 'Código QR', to: '/qr' },
      { label: 'Mi cuenta', to: '/profile' },
    ],
  },
]
</script>

<template>
  <footer class="footer">
    <!-- Top divider glow -->
    <div class="footer-glow-line" />

    <div class="footer-inner">

      <!-- Brand column -->
      <div class="footer-brand">
        <div class="footer-logo-wrap">
          <img src="/logo.png" alt="PinGym Logo" class="footer-logo" />
          <span class="footer-brand-name">PinGym</span>
        </div>
        <p class="footer-tagline">
          Gestión inteligente para tu gimnasio.<br />
          Rápido, seguro y sin complicaciones.
        </p>
        <div class="footer-status">
          <span class="status-dot" />
          <span class="status-text">Todos los sistemas operativos</span>
        </div>
      </div>

      <!-- Link columns -->
      <div class="footer-cols">
        <div
          v-for="col in columns"
          :key="col.title"
          class="footer-col"
        >
          <h4 class="footer-col-title">{{ col.title }}</h4>
          <ul class="footer-col-links">
            <li v-for="link in col.links" :key="link.label">
              <RouterLink :to="link.to" class="footer-link">
                {{ link.label }}
              </RouterLink>
            </li>
          </ul>
        </div>
      </div>

    </div>

    <div class="footer-bottom">
      <span class="footer-copy">© {{ year }} PinGym · Todos los derechos reservados</span>
      <div class="footer-badges">
        <span class="badge">v1.0.0</span>
        <span class="badge">Vue 3</span>
        <span class="badge">SaaS</span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&display=swap');

/* ── Layout ── */

.footer {
  position: relative;
  bottom: 0;
  left: 0;
  right: 0;
  background: #0a0a0a;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
  font-family: 'Geist', sans-serif;
  color: rgba(255, 255, 255, 0.55);
  padding: 0 24px;
}

/* Top glow line */
.footer-glow-line {
  position: absolute;
  top: -1px;
  left: 50%;
  transform: translateX(-50%);
  width: 320px;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 187, 61, 0.6),
    transparent
  );
  filter: blur(1px);
}

.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 0 40px;
  display: flex;
  gap: 64px;
  align-items: flex-start;
}

/* ── Brand ── */

.footer-brand {
  flex: 0 0 260px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.footer-logo-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.footer-logo {
  height: 28px;
  filter: brightness(0) invert(1);
  opacity: 0.9;
}

.footer-brand-name {
  font-size: 15px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  letter-spacing: -0.02em;
}

.footer-tagline {
  font-size: 13px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.38);
  max-width: 220px;
}

/* Status indicator */
.footer-status {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-top: 4px;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 8px rgba(34, 197, 94, 0.65);
  animation: pulse-dot 2.4s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.6; transform: scale(0.85); }
}

.status-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.35);
}

/* ── Columns ── */

.footer-cols {
  flex: 1;
  display: flex;
  gap: 48px;
  flex-wrap: wrap;
}

.footer-col {
  min-width: 120px;
}

.footer-col-title {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 16px;
}

.footer-col-links {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.footer-link {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
  text-decoration: none;
  transition: color 0.18s ease;
  display: inline-block;
  position: relative;
}

.footer-link::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 0;
  height: 1px;
  background: rgba(255, 187, 61, 0.7);
  transition: width 0.22s ease;
}

.footer-link:hover {
  color: rgba(255, 255, 255, 0.88);
}

.footer-link:hover::after {
  width: 100%;
}

/* ── Bottom bar ── */

.footer-bottom {
  max-width: 1200px;
  margin: 0 auto;
  padding: 18px 0 28px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.footer-copy {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.25);
}

.footer-badges {
  display: flex;
  gap: 6px;
}

.badge {
  font-size: 11px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.35);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 6px;
  padding: 3px 9px;
  letter-spacing: 0.02em;
  transition: background 0.18s, color 0.18s;
}

.badge:hover {
  background: rgba(255, 187, 61, 0.1);
  color: rgba(255, 187, 61, 0.85);
  border-color: rgba(255, 187, 61, 0.2);
}

/* ── Responsive ── */

@media (max-width: 768px) {
  .footer-inner {
    flex-direction: column;
    gap: 40px;
    padding: 48px 0 32px;
  }

  .footer-brand {
    flex: unset;
    width: 100%;
  }

  .footer-cols {
    gap: 32px;
  }

  .footer-bottom {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>