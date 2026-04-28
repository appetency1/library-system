import { createApp } from "vue";
import App from "./App.vue";
import { createPinia } from "pinia";
import router from "./router";
import { useAuthStore } from "./stores/auth";
import "./styles/main.css";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
useAuthStore(pinia).restoreSession();
app.use(router);
app.mount("#app");
