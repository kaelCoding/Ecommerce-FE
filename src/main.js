import { createApp } from 'vue'
import { init_store } from './stores'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

const app = createApp(App)

const init_app = async () => {
    await init_store()
    app.use(createPinia())
    app.use(router)
    app.mount('#app')
}

init_app()


