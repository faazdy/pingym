<template>
  <div class="dashboard">
    <AppSidebar />
    <main class="dashboard__main dash-center">

      <!-- Admin -->
      <template v-if="auth.isAdmin">
        <header class="topbar">
          <div>
            <h1 class="topbar__title">{{ auth.user?.gym_name || "GymSaaS" }}</h1>
            <p class="topbar__sub">Bienvenido, {{ auth.user?.name }}</p>
          </div>
        </header>

        <div class="dashboard__body">

          <!-- Row 1: hero stats -->
          <div class="row row--2 card-info">
            <div class="widget widget--dark">
              <p class="widget__label">Clientes activos</p>
              <p class="widget__big-number">{{ stats.clients }}</p>
              <p class="widget__hint">Total registrados en el gym</p>
            </div>
            <div class="widget widget--cta">
              <div>
                <h3 class="widget__cta-title">Registrá un nuevo cliente</h3>
                <p class="widget__cta-sub">Agregá clientes y asignales membresía y rutina al instante.</p>
              </div>
              <router-link class="cta-btn" to="/clients">+ Nuevo cliente</router-link>
            </div>
          </div>

          <!-- Row 2: stats secundarias -->
          <div class="row row--3">
            <div class="widget widget--stat">
              <p class="widget__label">Membresías</p>
              <p class="widget__number">{{ stats.activeMemberships }}</p>
              <p class="widget__hint">Tipos disponibles</p>
            </div>
            <div class="widget widget--stat">
              <p class="widget__label">Rutinas</p>
              <p class="widget__number">{{ stats.routines }}</p>
              <p class="widget__hint">Creadas en el gym</p>
            </div>
            <div class="widget widget--stat">
              <p class="widget__label">Entrenadores</p>
              <p class="widget__number">{{ stats.trainers }}</p>
              <p class="widget__hint">En tu equipo</p>
            </div>
          </div>

          <!-- Row 3: accesos rápidos -->
          <div class="widget">
            <p class="widget__label">Accesos rápidos</p>
            <div class="quick-grid">
              <router-link class="quick-item" to="/clients">
                <span class="quick-item__icon">◎</span>
                <span class="quick-item__name">Clientes</span>
                <span class="quick-item__arrow">→</span>
              </router-link>
              <router-link class="quick-item" to="/trainers">
                <span class="quick-item__icon">◉</span>
                <span class="quick-item__name">Entrenadores</span>
                <span class="quick-item__arrow">→</span>
              </router-link>
              <router-link class="quick-item" to="/memberships">
                <span class="quick-item__icon">▣</span>
                <span class="quick-item__name">Membresías</span>
                <span class="quick-item__arrow">→</span>
              </router-link>
              <router-link class="quick-item" to="/routines">
                <span class="quick-item__icon">◈</span>
                <span class="quick-item__name">Rutinas</span>
                <span class="quick-item__arrow">→</span>
              </router-link>
              <router-link class="quick-item" to="/attendance">
                <span class="quick-item__icon">◷</span>
                <span class="quick-item__name">Asistencia</span>
                <span class="quick-item__arrow">→</span>
              </router-link>
              <router-link class="quick-item" to="/lockers">
                <span class="quick-item__icon">⬡</span>
                <span class="quick-item__name">Casilleros</span>
                <span class="quick-item__arrow">→</span>
              </router-link>
              <router-link class="quick-item" to="/progress">
                <span class="quick-item__icon">◬</span>
                <span class="quick-item__name">Progreso</span>
                <span class="quick-item__arrow">→</span>
              </router-link>
              <router-link class="quick-item" to="/posts">
                <span class="quick-item__icon">◫</span>
                <span class="quick-item__name">Blog</span>
                <span class="quick-item__arrow">→</span>
              </router-link>
              <router-link class="quick-item quick-item--dark" to="/qr">
                <span class="quick-item__icon">⊞</span>
                <span class="quick-item__name">QR Registro</span>
                <span class="quick-item__arrow">→</span>
              </router-link>
            </div>
          </div>

        </div>
      </template>

      <!-- Trainer -->
      <template v-else-if="auth.isTrainer">
        <header class="topbar">
          <div>
            <h1 class="topbar__title">{{ auth.user?.gym_name || "GymSaaS" }}</h1>
            <p class="topbar__sub">Hola, {{ auth.user?.name }}</p>
          </div>
        </header>

        <div class="dashboard__body">
          <div class="row row--2">
            <div class="widget widget--dark">
              <p class="widget__label">Clientes</p>
              <p class="widget__big-number">{{ stats.clients }}</p>
              <p class="widget__hint">En el gym</p>
            </div>
            <div class="widget widget--stat">
              <p class="widget__label">Rutinas</p>
              <p class="widget__number">{{ stats.routines }}</p>
              <p class="widget__hint">Disponibles</p>
            </div>
          </div>

          <div class="widget">
            <p class="widget__label">Accesos rápidos</p>
            <div class="quick-grid">
              <router-link class="quick-item" to="/clients">
                <span class="quick-item__icon">◎</span>
                <span class="quick-item__name">Clientes</span>
                <span class="quick-item__arrow">→</span>
              </router-link>
              <router-link class="quick-item" to="/routines">
                <span class="quick-item__icon">◈</span>
                <span class="quick-item__name">Rutinas</span>
                <span class="quick-item__arrow">→</span>
              </router-link>
              <router-link class="quick-item" to="/attendance">
                <span class="quick-item__icon">◷</span>
                <span class="quick-item__name">Asistencia</span>
                <span class="quick-item__arrow">→</span>
              </router-link>
              <router-link class="quick-item" to="/progress">
                <span class="quick-item__icon">◬</span>
                <span class="quick-item__name">Progreso</span>
                <span class="quick-item__arrow">→</span>
              </router-link>
              <router-link class="quick-item" to="/lockers">
                <span class="quick-item__icon">⬡</span>
                <span class="quick-item__name">Mi casillero</span>
                <span class="quick-item__arrow">→</span>
              </router-link>
              <router-link class="quick-item" to="/posts">
                <span class="quick-item__icon">◫</span>
                <span class="quick-item__name">Blog</span>
                <span class="quick-item__arrow">→</span>
              </router-link>
            </div>
          </div>
        </div>
      </template>

      <!-- Cliente de gym -->
      <template v-else-if="auth.isClient && auth.hasGym">
        <header class="topbar">
          <div>
            <h1 class="topbar__title">{{ auth.user?.gym_name }}</h1>
            <p class="topbar__sub">Hola, {{ auth.user?.name }}</p>
          </div>
        </header>

        <div class="dashboard__body">
          <div class="row row--2">
            <div class="widget widget--dark" v-if="activeMembership">
              <p class="widget__label">Membresía activa</p>
              <p class="widget__big-number">{{ activeMembership.days_remaining ?? 0 }}</p>
              <p class="widget__hint">días restantes · {{ activeMembership.membership_name }}</p>
              <div class="membership-bar">
                <div class="membership-bar__fill" :style="{ width: membershipProgress + '%' }"></div>
              </div>
            </div>
            <div class="widget widget--dark widget--empty" v-else>
              <p class="widget__label">Membresía</p>
              <p class="widget__big-number widget__big-number--muted">—</p>
              <p class="widget__hint">Sin membresía activa</p>
            </div>
            <div class="widget widget--cta">
              <div>
                <h3 class="widget__cta-title">Tu rutina te espera</h3>
                <p class="widget__cta-sub">Revisá los ejercicios asignados por tu entrenador.</p>
              </div>
              <router-link class="cta-btn" to="/routines">Ver rutina</router-link>
            </div>
          </div>

          <div class="widget">
            <p class="widget__label">Mis accesos</p>
            <div class="quick-grid">
              <router-link class="quick-item" to="/routines">
                <span class="quick-item__icon">◈</span>
                <span class="quick-item__name">Mi rutina</span>
                <span class="quick-item__arrow">→</span>
              </router-link>
              <router-link class="quick-item" to="/progress">
                <span class="quick-item__icon">◬</span>
                <span class="quick-item__name">Mi progreso</span>
                <span class="quick-item__arrow">→</span>
              </router-link>
              <router-link class="quick-item" to="/attendance">
                <span class="quick-item__icon">◷</span>
                <span class="quick-item__name">Mi asistencia</span>
                <span class="quick-item__arrow">→</span>
              </router-link>
              <router-link class="quick-item" to="/lockers">
                <span class="quick-item__icon">⬡</span>
                <span class="quick-item__name">Mi casillero</span>
                <span class="quick-item__arrow">→</span>
              </router-link>
              <router-link class="quick-item" to="/posts">
                <span class="quick-item__icon">◫</span>
                <span class="quick-item__name">Blog del gym</span>
                <span class="quick-item__arrow">→</span>
              </router-link>
            </div>
          </div>
        </div>
      </template>

      <!-- Independiente -->
      <template v-else-if="auth.isIndependiente">
        <header class="topbar">
          <div>
            <h1 class="topbar__title">PinGym</h1>
            <p class="topbar__sub">Hola, {{ auth.user?.name }}</p>
          </div>
        </header>

        <div class="dashboard__body">
          <div class="widget widget--cta">
            <div>
              <h3 class="widget__cta-title">Controla tu entrenamiento</h3>
              <p class="widget__cta-sub">Crea rutinas y registra tu progreso sin necesidad de un gym.</p>
            </div>
            <router-link class="cta-btn" to="/routines">Mis rutinas</router-link>
          </div>

          <div class="widget">
            <p class="widget__label">Accesos</p>
            <div class="quick-grid quick-grid--half">
              <router-link class="quick-item" to="/routines">
                <span class="quick-item__icon">◈</span>
                <span class="quick-item__name">Mis rutinas</span>
                <span class="quick-item__arrow">→</span>
              </router-link>
              <router-link class="quick-item" to="/progress">
                <span class="quick-item__icon">◬</span>
                <span class="quick-item__name">Mi progreso</span>
                <span class="quick-item__arrow">→</span>
              </router-link>
            </div>
          </div>
        </div>
      </template>

    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import AppSidebar from "../../components/Nav.vue";
import { useAuthStore } from "../../stores/auth.store";
import api from "../../services/api";

const auth = useAuthStore();
const stats = ref({ clients: 0, activeMemberships: 0, routines: 0, trainers: 0 });
const clientMemberships = ref([]);

const activeMembership = computed(() =>
  clientMemberships.value.find(m => m.status === "active") || null
);

const membershipProgress = computed(() => {
  if (!activeMembership.value) return 0;
  const total = activeMembership.value.duration_days || 30;
  const remaining = activeMembership.value.days_remaining ?? 0;
  return Math.max(0, Math.min(100, (remaining / total) * 100));
});

async function fetchStats() {
  if (!auth.hasGym) return;
  try {
    if (auth.isAdmin) {
      const [clientsRes, routinesRes, membershipsRes, trainersRes] = await Promise.all([
        api.get(`/clients/${auth.user.gym_id}`),
        api.get(`/routines/gym/${auth.user.gym_id}`),
        api.get(`/memberships/gym/${auth.user.gym_id}`).catch(() => ({ data: [] })),
        api.get(`/trainers`).catch(() => ({ data: [] })),
      ]);
      stats.value = {
        clients: clientsRes.data?.length ?? 0,
        routines: routinesRes.data?.length ?? 0,
        activeMemberships: membershipsRes.data?.length ?? 0,
        trainers: trainersRes.data?.length ?? 0,
      };
    } else {
      const [clientsRes, routinesRes] = await Promise.all([
        api.get(`/clients/${auth.user.gym_id}`),
        api.get(`/routines/gym/${auth.user.gym_id}`),
      ]);
      stats.value = {
        clients: clientsRes.data?.length ?? 0,
        routines: routinesRes.data?.length ?? 0,
        activeMemberships: 0,
        trainers: 0,
      };
    }
  } catch (err) { console.error(err); }
}

async function fetchClientMemberships() {
  if (!auth.user?.client_profile_id || !auth.hasGym) return;
  try {
    const { data } = await api.get(`/memberships/client/${auth.user.client_profile_id}`);
    clientMemberships.value = data || [];
  } catch (_) { clientMemberships.value = []; }
}

onMounted(() => {
  if (auth.isAdmin || auth.isTrainer) fetchStats();
  if (auth.isClient && auth.hasGym) fetchClientMemberships();
});
</script>

<style scoped>
/* ── Shell ── */
.dashboard { display: flex; min-height: 100vh; font-family: var(--font-sans); background: rgb(250, 250, 250); }
.dashboard__main { flex: 1; display: flex; flex-direction: column; padding-bottom: 80px; }

.dash-center{
  max-width: 1250px;
  margin: 2rem auto;
}

/* ── Topbar ── */
.topbar {
  padding: 28px 5% 0;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 24px;
}

.topbar__title {
  font-size: 22px;
  font-weight: 700;
  color: #111;
  letter-spacing: -0.03em;
}

.topbar__sub {
  font-size: 13px;
  color: #999;
  margin-top: 2px;
}

/* ── Body ── */
.dashboard__body {
  padding: 0 5%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ── Rows ── */
.row { display: grid; gap: 12px; }
.row--2 { grid-template-columns: 1fr 2fr; }
.row--3 { grid-template-columns: repeat(3, 1fr); }

/* ── Widget base ── */
.widget {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(0,0,0,0.06);
}

.widget__label {
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #999;
  margin-bottom: 10px;
}

.widget__hint {
  font-size: 12px;
  color: #aaa;
  margin-top: 6px;
}

/* ── Dark widget ── */
.widget--dark {
  background: #111;
  border-color: #111;
}

.widget--dark .widget__label { color: rgba(255,255,255,0.35); }
.widget--dark .widget__hint { color: rgba(255,255,255,0.3); }

.widget__big-number {
  font-size: 48px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.05em;
  line-height: 1;
}

.widget-info{
  background-color: #caf0f8;
  color: #0077b6;
  border: 0;
}

.widget__big-number--muted { color: rgba(255,255,255,0.2); }

/* ── Stat widget ── */
.widget--stat { display: flex; flex-direction: column; }

.widget__number {
  font-size: 36px;
  font-weight: 700;
  color: #111;
  letter-spacing: -0.04em;
  line-height: 1;
}

/* ── CTA widget ── */
.widget--cta {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 20px;
  background: #f9f9f7;
  border: 1px solid rgba(0,0,0,0.06);
}

.widget__cta-title {
  font-size: 18px;
  font-weight: 600;
  color: #111;
  letter-spacing: -0.02em;
  margin-bottom: 6px;
}

.widget__cta-sub {
  font-size: 13px;
  color: #888;
  line-height: 1.5;
}

.cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #111;
  color: #fff;
  font-family: var(--font-sans);
  font-size: 12px;
  font-weight: 500;
  padding: 9px 16px;
  border-radius: 8px;
  text-decoration: none;
  letter-spacing: -0.01em;
  transition: background 0.15s;
  align-self: flex-start;
}

.cta-btn:hover { background: #333; }

/* ── Membership bar ── */
.membership-bar {
  height: 3px;
  background: rgba(255,255,255,0.12);
  border-radius: 999px;
  overflow: hidden;
  margin-top: 12px;
}

.membership-bar__fill {
  height: 100%;
  background: #fff;
  border-radius: 999px;
  transition: width 0.6s ease;
}

/* ── Quick grid ── */
.quick-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-top: 4px;
}

.quick-grid--half { grid-template-columns: repeat(2, 1fr); }

.quick-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  background: #f9f9f7;
  border: 1px solid rgba(0,0,0,0.06);
  border-radius: 10px;
  text-decoration: none;
  transition: background 0.12s, border-color 0.12s, transform 0.12s;
}

.quick-item:hover {
  background: #f0f0ee;
  border-color: rgba(0,0,0,0.15);
  transform: translateY(-1px);
}

.quick-item__icon {
  font-size: 14px;
  color: #bbb;
  flex-shrink: 0;
  transition: color 0.12s;
}

.quick-item:hover .quick-item__icon { color: #111; }

.quick-item__name {
  font-size: 12px;
  font-weight: 500;
  color: #333;
  letter-spacing: -0.01em;
  flex: 1;
}

.quick-item__arrow {
  font-size: 11px;
  color: #ccc;
  flex-shrink: 0;
  transition: color 0.12s, transform 0.12s;
}

.quick-item:hover .quick-item__arrow {
  color: #111;
  transform: translateX(2px);
}

.quick-item--dark {
  background: #111;
  border-color: #111;
}

.quick-item--dark .quick-item__icon,
.quick-item--dark .quick-item__name,
.quick-item--dark .quick-item__arrow { color: rgba(255,255,255,0.5); }

.quick-item--dark:hover { background: #222; border-color: #222; }
.quick-item--dark:hover .quick-item__icon,
.quick-item--dark:hover .quick-item__name,
.quick-item--dark:hover .quick-item__arrow { color: #fff; }

/* ── Responsive ── */
@media (max-width: 900px) {
  .row--2 { grid-template-columns: 1fr; }
  .row--3 { grid-template-columns: repeat(2, 1fr); }
  .quick-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>