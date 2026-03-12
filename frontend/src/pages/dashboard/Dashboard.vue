<template>
  <div class="app">
    <AppSidebar />
    <main class="main">
      <div class="page">
        <div class="page__header">
          <span class="page__tag">Panel</span>
          <h1 class="page__title">{{ stats.gymName ? stats.gymName : 'GYM'}}</h1>
        </div>

        <div class="stats">
          <div class="stat-card">
            <p class="stat-card__label">Clientes</p>
            <p class="stat-card__value">{{ stats.clients }}</p>
          </div>
          <div class="stat-card">
            <p class="stat-card__label">Membresías activas</p>
            <p class="stat-card__value">{{ stats.activeMemberships }}</p>
          </div>
          <div class="stat-card">
            <p class="stat-card__label">Rutinas</p>
            <p class="stat-card__value">{{ stats.routines }}</p>
          </div>
        </div>

        <div class="section">
          <div class="section__meta">
            <p class="section__title">Accesos rápidos</p>
          </div>
          <div class="quick-links">
            <router-link class="quick-link" to="/clients">
              <span class="quick-link__name">Clientes</span>
              <span class="quick-link__arrow">→</span>
            </router-link>
            <router-link class="quick-link" to="/memberships">
              <span class="quick-link__name">Membresías</span>
              <span class="quick-link__arrow">→</span>
            </router-link>
            <router-link class="quick-link" to="/routines">
              <span class="quick-link__name">Rutinas</span>
              <span class="quick-link__arrow">→</span>
            </router-link>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from "vue";
import AppSidebar from "../../components/Nav.vue";

const stats = ref({ clients: 0, activeMemberships: 0, routines: 0 });
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500&family=Geist:wght@400;500;600&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.app { min-height: 100vh; font-family: 'Geist', sans-serif; }

.main {
  
  flex: 1;
  background: #f9f9f9;
  padding: 48px 48px 100px;
}

.page { max-width: 720px; display: flex; flex-direction: column; gap: 48px; }

.page__header {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e5e5e5;
}

.page__tag {
  font-family: 'Geist Mono', monospace;
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #999;
}

.page__title {
  font-size: 26px;
  font-weight: 600;
  color: #111;
  letter-spacing: -0.03em;
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.stat-card {
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: border-color 0.15s ease;
}

.stat-card:hover { border-color: #111; }

.stat-card__label {
  font-family: 'Geist Mono', monospace;
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #999;
}

.stat-card__value {
  font-size: 28px;
  font-weight: 600;
  color: #111;
  letter-spacing: -0.04em;
}

.section { display: flex; flex-direction: column; gap: 16px; }

.section__meta { display: flex; align-items: baseline; justify-content: space-between; }

.section__title {
  font-family: 'Geist Mono', monospace;
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #999;
}

.quick-links {
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}

.quick-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid #e5e5e5;
  text-decoration: none;
  transition: background 0.15s ease;
}

.quick-link:last-child { border-bottom: none; }
.quick-link:hover { background: #f9f9f9; }

.quick-link__name {
  font-size: 13px;
  font-weight: 500;
  color: #111;
  letter-spacing: -0.01em;
}

.quick-link__arrow {
  font-size: 13px;
  color: #bbb;
  transition: color 0.15s, transform 0.15s;
}

.quick-link:hover .quick-link__arrow { color: #111; transform: translateX(2px); }
</style>