import { createApp } from 'vue'
import { init_store } from './stores'
import { createPinia } from 'pinia'
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import App from './App.vue'
import router from './router'

export const firebaseConfig = {
  apiKey: "AIzaSyCd6VV5jVJXQ_xZbse7yvL3czd91DglmOU",
  authDomain: "ecommercetunitoku.firebaseapp.com",
  projectId: "ecommercetunitoku",
  storageBucket: "ecommercetunitoku.firebasestorage.app",
  messagingSenderId: "811418653806",
  appId: "1:811418653806:web:648e869345a18f8e27427f",
  measurementId: "G-JFNQ2PNPCE"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const vueApp = createApp(App)

const init_app = async () => {
    await init_store()
    vueApp.use(createPinia())
    vueApp.use(router)
    vueApp.mount('#app')
}

init_app()