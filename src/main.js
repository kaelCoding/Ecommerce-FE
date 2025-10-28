import { createApp } from 'vue'
import { init_store } from './stores'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import i18n from './i18n'

const vueApp = createApp(App)

const init_app = async () => {
    await init_store()
    vueApp.use(createPinia())
    vueApp.use(router)
    vueApp.use(i18n);
    vueApp.mount('#app')
}

init_app()