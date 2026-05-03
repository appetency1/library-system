<script setup lang="ts">
import type { Seat } from "../api/library";

defineProps<{
  seats: Seat[];
  selectedSeatId: number | null;
}>();

const emit = defineEmits<{
  (event: "select", seatId: number): void;
}>();

function getStatusText(available: boolean): string {
  return available ? "可预约" : "已占用";
}
</script>

<template>
  <div class="seat-grid-wrapper">
    <div class="seat-grid">
      <button
        v-for="seat in seats"
        :key="seat.id"
        type="button"
        class="seat-tile"
        :class="{
          available: seat.available,
          disabled: !seat.available,
          selected: seat.id === selectedSeatId
        }"
        :disabled="!seat.available"
        @click="emit('select', seat.id)"
      >
        <!-- Seat Icon -->
        <div class="seat-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
          </svg>
        </div>
        
        <!-- Seat Number -->
        <span class="seat-no">{{ seat.seatNo }}</span>
        
        <!-- Seat Type -->
        <span class="seat-type">{{ seat.type }}</span>
        
        <!-- Status -->
        <span class="seat-state">
          <span class="status-dot"></span>
          {{ getStatusText(seat.available) }}
        </span>
      </button>
    </div>
    
    <!-- Empty State -->
    <div v-if="seats.length === 0" class="seat-empty">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
      </svg>
      <p>请先选择阅览室</p>
    </div>
  </div>
</template>

<style scoped>
.seat-grid-wrapper {
  width: 100%;
}

.seat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1rem;
}

.seat-tile {
  display: grid;
  grid-template-rows: auto auto auto auto;
  gap: 0.5rem;
  align-items: center;
  min-height: 160px;
  padding: 1.25rem;
  border-radius: var(--radius);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  text-align: center;
  backdrop-filter: blur(12px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.seat-tile::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 0%, rgba(255,255,255,0.08), transparent 60%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.seat-tile:hover::before {
  opacity: 1;
}

/* Available State */
.seat-tile.available {
  border-color: var(--accent-border);
  background: linear-gradient(135deg, var(--glass-bg), rgba(20, 184, 166, 0.08));
}

.seat-tile.available:hover {
  border-color: var(--accent);
  transform: translateY(-6px) scale(1.02);
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.3),
    0 0 30px var(--accent-glow);
}

.seat-tile.available:hover .seat-icon {
  background: var(--accent);
  color: #fff;
  transform: scale(1.1);
}

.seat-tile.available:hover .seat-no {
  color: var(--accent);
}

.seat-tile.available:hover .status-dot {
  background: var(--accent);
  box-shadow: 0 0 8px var(--accent-glow);
}

/* Selected State */
.seat-tile.selected,
.seat-tile.selected:hover {
  border-color: var(--accent);
  background: linear-gradient(135deg, rgba(20, 184, 166, 0.15), rgba(20, 184, 166, 0.08));
  box-shadow: 
    0 0 30px var(--accent-glow),
    0 16px 40px rgba(0, 0, 0, 0.3);
  transform: translateY(-6px) scale(1.02);
}

.seat-tile.selected::after {
  content: '';
  position: absolute;
  top: 12px;
  right: 12px;
  width: 24px;
  height: 24px;
  background: var(--accent);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px var(--accent-glow);
}

.seat-tile.selected .seat-icon {
  background: var(--accent);
  color: #fff;
  transform: scale(1.1);
}

.seat-tile.selected .seat-no {
  color: var(--accent);
}

.seat-tile.selected .status-dot {
  background: var(--accent);
  box-shadow: 0 0 8px var(--accent-glow);
}

/* Disabled State */
.seat-tile.disabled {
  background: rgba(30, 41, 59, 0.4);
  color: var(--text-muted);
  cursor: not-allowed;
  opacity: 0.6;
}

.seat-tile.disabled:hover {
  transform: none;
}

/* Seat Icon */
.seat-icon {
  width: 52px;
  height: 52px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-secondary);
  transition: all 0.3s ease;
}

/* Seat Number */
.seat-no {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--text);
  transition: color 0.3s ease;
}

/* Seat Type */
.seat-type {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Status */
.seat-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--text-muted);
  transition: all 0.3s ease;
}

/* Empty State */
.seat-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 3rem;
  border-radius: var(--radius);
  background: var(--glass-bg);
  border: 1px dashed var(--glass-border);
  color: var(--text-muted);
}

.seat-empty p {
  margin: 0;
  font-size: 0.95rem;
}

/* Responsive */
@media (max-width: 768px) {
  .seat-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 0.75rem;
  }
  
  .seat-tile {
    min-height: 140px;
    padding: 1rem;
  }
  
  .seat-icon {
    width: 44px;
    height: 44px;
  }
}

@media (max-width: 480px) {
  .seat-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
