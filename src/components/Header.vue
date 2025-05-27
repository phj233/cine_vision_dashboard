<template>
  <header :class="[
    'fixed top-0 left-0 right-0 z-50 backdrop-blur-md shadow-sm transition-all duration-300',
    props.darkMode ? 'bg-gray-900/80 text-white' : 'bg-white/80 text-gray-800'
  ]">
    <div class="container mx-auto px-6 py-4">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 class="text-2xl font-bold mb-4 md:mb-0">电影数据可视化平台</h1>

        <!-- 导航链接 -->
        <nav class="flex flex-wrap gap-4 mb-3 md:mb-0">
          <router-link :to="{ name: 'home' }" :class="linkClass">首页</router-link>
          <router-link :to="{ name: 'visualization' }" :class="linkClass">数据可视化</router-link>
          <router-link :to="{ name: 'advancedVisualization' }" :class="linkClass">高级分析</router-link>
          <router-link :to="{ name: 'actorNetwork' }" :class="linkClass">演员网络</router-link>
          <router-link :to="{ name: 'import' }" :class="linkClass">数据导入</router-link>
          <router-link :to="{ name: 'about' }" :class="linkClass">关于</router-link>
        </nav>

        <!-- 日期、主题切换和刷新按钮 -->
        <div class="flex items-center gap-4">
          <span :class="props.darkMode ? 'text-gray-300' : 'text-gray-600'">{{ currentDate }}</span>

          <!-- 主题切换按钮 -->
          <n-button circle @click="toggleTheme">
            <template #icon>
              <Icon :icon="props.darkMode ? 'material-symbols:light-mode-outline' : 'material-symbols:dark-mode-outline'" />
            </template>
          </n-button>

          <n-button type="primary" @click="refreshData">
            <template #icon>
              <Icon icon="material-symbols:refresh" />
            </template>
            刷新数据
          </n-button>
        </div>
      </div>
    </div>
  </header>

  <!-- 占位空间，防止内容被固定标题遮挡 -->
  <div class="header-placeholder h-24 md:h-20"></div>
</template>

<script setup lang="ts">
import {computed, onMounted, ref} from 'vue';
import {NButton} from 'naive-ui';
import {Icon} from '@iconify/vue';

// 接收父组件传递的属性
const props = defineProps<{
  darkMode: boolean
}>();

// 定义事件
const emit = defineEmits(['toggle-theme']);

// 切换主题
const toggleTheme = () => {
  emit('toggle-theme');
};

// 刷新数据
const refreshData = () => {
  console.log('刷新数据');
  // 这里可以添加刷新数据的逻辑
};

// 导航链接样式
const linkClass = computed(() => ({
  'hover:text-blue-600 transition-colors': true,
  'text-gray-300': props.darkMode,
  'text-gray-600': !props.darkMode,
}));

// 当前日期
const currentDate = ref('');

// 格式化日期
const formatDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const weekday = weekdays[now.getDay()];
  currentDate.value = `${year}年${month}月${day}日 ${weekday}`;
};

onMounted(() => {
  formatDate();
  // 每分钟更新一次日期
  setInterval(formatDate, 60000);

  // 监听滚动事件，添加阴影效果
  const header = document.querySelector('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 10) {
      header?.classList.add('shadow-md');
      header?.classList.remove('shadow-sm');
    } else {
      header?.classList.remove('shadow-md');
      header?.classList.add('shadow-sm');
    }
  });
});
</script>

<style scoped>
.router-link-active {
  color: #3b82f6 !important;
  font-weight: 600;
}

.backdrop-blur-md {
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.shadow-md {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
</style>
