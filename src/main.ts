
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import 'element-plus/dist/index.css';
import './assets/main.scss'
import ElementPlus from 'element-plus';
import locale from 'element-plus/es/locale/lang/zh-cn';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import "element-plus/theme-chalk/src/index.scss";

import App from './App.vue'
import router from './router'

const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

app.use(createPinia())
app.use(router)
app.use(ElementPlus, { locale });

router.isReady().then(() => {
    app.mount('#app');
});
