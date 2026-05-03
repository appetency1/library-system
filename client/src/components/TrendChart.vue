<script setup lang="ts">
import { BarChart, LineChart } from "echarts/charts";
import { GridComponent, TooltipComponent, LegendComponent } from "echarts/components";
import { init, use, type ECharts } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import type { AdminTrendPoint } from "../api/admin";

use([BarChart, LineChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

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
    backgroundColor: 'transparent',
    tooltip: {
      trigger: "axis",
      backgroundColor: 'rgba(30, 41, 59, 0.95)',
      borderColor: 'rgba(148, 163, 184, 0.2)',
      borderWidth: 1,
      textStyle: {
        color: '#f1f5f9',
        fontSize: 13
      },
      axisPointer: {
        type: "cross",
        crossStyle: { color: '#94a3b8' },
        lineStyle: { color: 'rgba(20, 184, 166, 0.3)' }
      }
    },
    legend: {
      data: ['预约数', '签到数'],
      top: 0,
      right: 0,
      textStyle: { color: '#94a3b8', fontSize: 12 },
      itemWidth: 16,
      itemHeight: 8,
      itemGap: 20
    },
    grid: { top: 40, right: 20, bottom: 30, left: 50 },
    xAxis: {
      type: "category",
      data: props.data.map((item) => item.date),
      axisLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.2)' } },
      axisTick: { show: false },
      axisLabel: { color: '#64748b', fontSize: 12 }
    },
    yAxis: {
      type: "value",
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.1)' } },
      axisLabel: { color: '#64748b', fontSize: 12 }
    },
    series: [
      {
        name: "预约数",
        type: "line",
        smooth: true,
        data: props.data.map((item) => item.reservation_count),
        color: '#14b8a6',
        lineStyle: { width: 3 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(20, 184, 166, 0.35)' },
              { offset: 1, color: 'rgba(20, 184, 166, 0)' }
            ]
          }
        },
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: { color: '#14b8a6', borderWidth: 2, borderColor: '#fff' },
        emphasis: {
          scale: true,
          itemStyle: { shadowBlur: 10, shadowColor: 'rgba(20, 184, 166, 0.5)' }
        }
      },
      {
        name: "签到数",
        type: "bar",
        data: props.data.map((item) => item.checkin_count),
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: '#3b82f6' },
            { offset: 1, color: '#1d4ed8' }
          ]
        },
        borderRadius: [4, 4, 0, 0],
        barWidth: '40%',
        emphasis: {
          itemStyle: { shadowBlur: 10, shadowColor: 'rgba(59, 130, 246, 0.4)' }
        }
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

<style scoped>
.trend-chart {
  width: 100%;
  height: 340px;
  padding: 1rem;
  border-radius: var(--radius);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(12px);
}
</style>
