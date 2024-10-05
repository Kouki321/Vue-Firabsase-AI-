// main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import { QuillEditor } from 'vue3-quill';

import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';
import 'quill/dist/quill.core.css';
import 'quill/dist/quill.snow.css';
import 'quill/dist/quill.bubble.css';

const app = createApp(App);

const options = {
    position: 'bottom-right',
    timeout: 3000,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    draggablePercent: 50,
    showCloseButtonOnHover: true,
    hideProgressBar: false,
    icon: true,
    transition: 'Vue-Toastification__bounce',
  };
app.use(store);
app.use(router);
app.component('QuillEditor', QuillEditor); // Register QuillEditor globally
app.use(Toast, options);

app.mount('#app');
