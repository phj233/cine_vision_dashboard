import {createApp} from 'vue'
import './style.css'
import './assets/theme.css'
import App from './App.vue'
import {router} from './router'
import {createPinia} from 'pinia'
import * as echarts from 'echarts'
import VChart from 'vue-echarts'

const pinia = createPinia()
const app = createApp(App)

// 全局注册v-chart组件
app.component('v-chart', VChart)

// 挂载echarts到全局
app.config.globalProperties.$echarts = echarts

app.use(pinia)
app.use(router)
app.mount('#app')
