<script setup lang="ts">
import type { Seat } from "../api/library";

defineProps<{
  seats: Seat[];
  selectedSeatId: number | null;
}>();

const emit = defineEmits<{
  (event: "select", seatId: number): void;
}>();
</script>

<template>
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
      <span class="seat-no">{{ seat.seatNo }}</span>
      <span class="seat-type">{{ seat.type }}</span>
      <span class="seat-state">{{ seat.available ? "可预约" : "不可用" }}</span>
    </button>
  </div>
</template>
