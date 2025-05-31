<template>
  <n-layout-header bordered class="fixed top-0 left-0 right-0 z-50 backdrop-blur-md transition-all duration-300"
    :style="headerStyle">
    <div class="container mx-auto px-6 py-3">
      <n-space justify="space-between" align="center" :wrap="isSmallScreen">
        <h1 class="text-2xl font-bold mb-0">电影数据可视化平台</h1>

        <!-- 导航链接 -->
        <n-space justify="center" align="center" class="my-2 md:my-0" :wrap="true" :size="16">
          <n-button text tag="div" :class="linkClass" @click="navigateTo('home')">首页</n-button>
          <n-button text tag="div" :class="linkClass" @click="navigateTo('visualization')">数据可视化</n-button>
          <n-button text tag="div" :class="linkClass" @click="navigateTo('advancedVisualization')">高级分析</n-button>
          <n-button text tag="div" :class="linkClass" @click="navigateTo('actorNetwork')">演员网络</n-button>
          <n-button text tag="div" :class="linkClass" @click="navigateTo('import')">数据导入</n-button>
          <n-button text tag="div" :class="linkClass" @click="navigateTo('about')">关于</n-button>
        </n-space>

        <!-- 日期、主题切换和刷新按钮 -->
        <n-space align="center" :size="12">
          <span>{{ currentDate }}</span>

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
        </n-space>
      </n-space>
    </div>
  </n-layout-header>

  <!-- 占位空间，防止内容被固定标题遮挡 -->
  <div class="h-20 md:h-16"></div>
</template>

<script setup lang="ts">
import {computed, onMounted, ref} from 'vue';
import {useRouter} from 'vue-router';
import {NButton, NLayoutHeader, NSpace} from 'naive-ui';
import {Icon} from '@iconify/vue';

// 接收父组件传递的属性
const props = defineProps<{
  darkMode: boolean
}>();

// 定义事件
const emit = defineEmits(['toggle-theme']);

const router = useRouter();

// 判断屏幕大小
const isSmallScreen = ref(window.innerWidth < 768);

// 设置header样式
const headerStyle = computed(() => ({
  backgroundColor: props.darkMode ? 'rgba(24, 24, 28, 0.8)' : 'rgba(255, 255, 255, 0.8)',
  color: props.darkMode ? 'white' : 'inherit',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)'
}));

// 路由导航
const navigateTo = (name: string) => {
  router.push({ name });
};

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
  'hover:text-blue-500 transition-colors': true,
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

// 窗口大小变化处理
const handleResize = () => {
  isSmallScreen.value = window.innerWidth < 768;
};

onMounted(() => {
  formatDate();
  // 每分钟更新一次日期
  setInterval(formatDate, 60000);

  // 监听窗口大小变化
  window.addEventListener('resize', handleResize);
});
</script>

<style scoped>

.backdrop-blur-md {
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

</style>
