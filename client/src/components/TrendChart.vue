<script setup lang="ts">
import { BarChart, LineChart } from "echarts/charts";
import { GridComponent, TooltipComponent } from "echarts/components";
import { init, use, type ECharts } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import type { AdminTrendPoint } from "../api/admin";

use([BarChart, LineChart, GridComponent, TooltipComponent, CanvasRenderer]);

const props = defineProps<{
  data: AdminTrendPoint[];
}>();

const chartRef = ref<HTMLDivElement | null>(null);
let chart: ECharts | null = null;

function renderChart() {
  if (!chartRef.value) return;

  if (!chart) {
    chart = init(chartRef.value);
  }

  chart.setOption({
    tooltip: { trigger: "axis" },
    grid: { top: 28, right: 24, bottom: 28, left: 42 },
    xAxis: {
      type: "category",
      data: props.data.map((item) => item.date)
    },
    yAxis: { type: "value" },
    series: [
      {
        name: "预约数",
        type: "line",
        smooth: true,
        data: props.data.map((item) => item.reservation_count),
        color: "#0f766e"
      },
      {
        name: "签到数",
        type: "bar",
        data: props.data.map((item) => item.checkin_count),
        color: "#2563eb"
      }
    ]
  });
}

function handleResize() {
  chart?.resize();
}

onMounted(() => {
  renderChart();
  window.addEventListener("resize", handleResize);
});

watch(() => props.data, renderChart, { deep: true });

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
  chart?.dispose();
});
</script>

<template>
  <div ref="chartRef" class="trend-chart"></div>
</template>
