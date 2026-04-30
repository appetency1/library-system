<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import {
  createAdminNotice,
  deleteAdminNotice,
  fetchAdminNotices,
  updateAdminNotice,
  type NoticePayload
} from "../../api/admin";
import { getApiErrorMessage } from "../../api/error";
import type { Notice } from "../../api/library";

const notices = ref<Notice[]>([]);
const message = ref("");
const deletingId = ref<number | null>(null);
const form = reactive<NoticePayload>({
  title: "",
  content: "",
  status: "published"
});

async function loadNotices() {
  notices.value = await fetchAdminNotices();
}

onMounted(loadNotices);

async function createNotice() {
  await createAdminNotice(form);
  Object.assign(form, { title: "", content: "", status: "published" });
  await loadNotices();
  message.value = "公告已发布。";
}

async function toggleNotice(notice: Notice) {
  await updateAdminNotice(notice.id, {
    title: notice.title,
    content: notice.content,
    status: notice.status === "published" ? "draft" : "published"
  });
  await loadNotices();
}

async function removeNotice(notice: Notice) {
  if (!window.confirm("确定删除这条公告吗？")) {
    return;
  }

  deletingId.value = notice.id;
  try {
    await deleteAdminNotice(notice.id);
    await loadNotices();
    message.value = "公告已删除。";
  } catch (error) {
    message.value = getApiErrorMessage(error, "公告删除失败。");
  } finally {
    deletingId.value = null;
  }
}
</script>

<template>
  <div class="workspace-page">
    <section class="page-header">
      <div>
        <p class="eyebrow">公告管理</p>
        <h2>发布和上下线公告</h2>
      </div>
      <p class="muted">{{ message }}</p>
    </section>

    <form class="management-form wide" @submit.prevent="createNotice">
      <label><span>标题</span><input v-model="form.title" required /></label>
      <label><span>内容</span><input v-model="form.content" required /></label>
      <button class="primary-button" type="submit">发布</button>
    </form>

    <section class="content-band">
      <article v-for="notice in notices" :key="notice.id" class="list-row">
        <div>
          <strong>{{ notice.title }}</strong>
          <p>{{ notice.content }}</p>
        </div>
        <div class="row-actions">
          <button class="secondary-button" type="button" @click="toggleNotice(notice)">
            {{ notice.status === "published" ? "转为草稿" : "发布" }}
          </button>
          <button
            class="danger-button"
            type="button"
            :disabled="deletingId === notice.id"
            @click="removeNotice(notice)"
          >
            {{ deletingId === notice.id ? "删除中..." : "删除" }}
          </button>
        </div>
      </article>
    </section>
  </div>
</template>
