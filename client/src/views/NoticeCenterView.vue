<script setup lang="ts">
import { onMounted, ref } from "vue";
import { fetchNotices, type Notice } from "../api/library";

const notices = ref<Notice[]>([]);

onMounted(async () => {
  notices.value = await fetchNotices();
});
</script>

<template>
  <div class="workspace-page">
    <section class="page-header">
      <div>
        <p class="eyebrow">公告中心</p>
        <h2>系统通知与预约提示</h2>
      </div>
    </section>

    <section class="content-band">
      <article v-for="notice in notices" :key="notice.id" class="notice-item">
        <h4>{{ notice.title }}</h4>
        <p>{{ notice.content }}</p>
      </article>

      <p v-if="notices.length === 0" class="empty-state">暂无公告。</p>
    </section>
  </div>
</template>
