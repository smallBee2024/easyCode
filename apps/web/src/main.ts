import { createApp } from "vue";
import Antd from 'ant-design-vue';
import router from './router'
import App from './app.vue';
import 'ant-design-vue/dist/reset.css';
import '@/assets/style/common.less';

import FcDesigner from '@form-create/designer'
import formCreate from '@form-create/ant-design-vue';
import ELEMENT from 'element-plus';
import 'element-plus/dist/index.css';


// const app = createApp(App);
// app.use(Antd).use(router)
// .use(ELEMENT)
// .use(formCreate)
// .use(FcDesigner)
// .use(FcDesigner.formCreate);
// app.mount('#app');
createApp(App)
  .use(router)
  .use(Antd)
  .use(ELEMENT)
  .use(formCreate)
  .use(FcDesigner)
  .use(FcDesigner.formCreate)
  .mount('#app')
