<template>
  <n-layout-header bordered class="fixed top-0 left-0 right-0 z-50 backdrop-blur-md transition-all duration-300"
    :style="headerStyle">
    <div class="container mx-auto px-4 md:px-6 py-3">
      <n-space justify="space-between" align="center" :wrap="isSmallScreen">
        <!-- Logo和标题 -->
        <div class="flex items-center">
          <span class="material-symbols-outlined text-3xl text-blue-500 dark:text-blue-400 mr-2 animate-pulse">
            Cine Vision
          </span>
        </div>

        <!-- 移动端菜单按钮和主题切换 -->
        <div v-if="isSmallScreen" class="flex items-center">
          <n-button circle @click="toggleTheme" class="hover:bg-gray-100 dark:hover:bg-gray-700">
            <template #icon>
              <Icon :icon="props.darkMode ? 'material-symbols:light-mode-outline' : 'material-symbols:dark-mode-outline'" />
            </template>
          </n-button>
          <div class="w-3"></div>
          <n-button circle @click="toggleMobileMenu">
            <template #icon>
              <Icon :icon="showMobileMenu ? 'material-symbols:close' : 'material-symbols:menu'" />
            </template>
          </n-button>
        </div>

        <!-- 桌面端导航链接 -->
        <n-space v-else justify="center" align="center" class="my-2 md:my-0" :size="16">
          <n-button text tag="div" :class="linkClass" @click="navigateTo('home')">
            <template #icon>
              <Icon icon="material-symbols:home-outline" class="mr-1" />
            </template>
            首页
          </n-button>
          <n-button text tag="div" :class="linkClass" @click="navigateTo('visualization')">
            <template #icon>
              <Icon icon="material-symbols:analytics-outline" class="mr-1" />
            </template>
            数据可视化
          </n-button>
          <n-button text tag="div" :class="linkClass" @click="navigateTo('advancedVisualization')">
            <template #icon>
              <Icon icon="carbon:chart-multitype" class="mr-1" />
            </template>
            高级分析
          </n-button>
          <n-button text tag="div" :class="linkClass" @click="navigateTo('actorNetwork')">
            <template #icon>
              <Icon icon="material-symbols:account-tree-outline" class="mr-1" />
            </template>
            演员网络
          </n-button>
          <n-button text tag="div" :class="linkClass" @click="navigateTo('import')">
            <template #icon>
              <Icon icon="material-symbols:upload-file-outline" class="mr-1" />
            </template>
            数据导入
          </n-button>
          <n-button text tag="div" :class="linkClass" @click="navigateTo('about')">
            <template #icon>
              <Icon icon="material-symbols:info-outline" class="mr-1" />
            </template>
            关于
          </n-button>
        </n-space>

        <!-- 右侧工具栏 -->
        <n-space v-if="!isSmallScreen" align="center" :size="12">
          <span class="text-sm">{{ currentDate }}</span>

          <n-button circle @click="toggleTheme" class="hover:bg-gray-100 dark:hover:bg-gray-700">
            <template #icon>
              <Icon :icon="props.darkMode ? 'material-symbols:light-mode-outline' : 'material-symbols:dark-mode-outline'" />
            </template>
          </n-button>
        </n-space>
      </n-space>

      <!-- 移动端菜单 -->
      <n-collapse-transition :show="showMobileMenu && isSmallScreen">
        <div class="mt-4 space-y-1 pb-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-lg">
          <n-button block text tag="div" class="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 text-base py-3 flex items-center px-4" @click="navigateTo('home')">
            <template #icon>
              <Icon icon="material-symbols:home-outline" class="text-xl" />
            </template>
            <span class="ml-2">首页</span>
          </n-button>
          <n-button block text tag="div" class="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 text-base py-3 flex items-center px-4" @click="navigateTo('visualization')">
            <template #icon>
              <Icon icon="material-symbols:analytics-outline" class="text-xl" />
            </template>
            <span class="ml-2">数据可视化</span>
          </n-button>
          <n-button block text tag="div" class="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 text-base py-3 flex items-center px-4" @click="navigateTo('advancedVisualization')">
            <template #icon>
              <Icon icon="carbon:chart-multitype" class="text-xl" />
            </template>
            <span class="ml-2">高级分析</span>
          </n-button>
          <n-button block text tag="div" class="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 text-base py-3 flex items-center px-4" @click="navigateTo('actorNetwork')">
            <template #icon>
              <Icon icon="material-symbols:account-tree-outline" class="text-xl" />
            </template>
            <span class="ml-2">演员网络</span>
          </n-button>
          <n-button block text tag="div" class="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 text-base py-3 flex items-center px-4" @click="navigateTo('import')">
            <template #icon>
              <Icon icon="material-symbols:upload-file-outline" class="text-xl" />
            </template>
            <span class="ml-2">数据导入</span>
          </n-button>
          <n-button block text tag="div" class="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 text-base py-3 flex items-center px-4" @click="navigateTo('about')">
            <template #icon>
              <Icon icon="material-symbols:info-outline" class="text-xl" />
            </template>
            <span class="ml-2">关于</span>
          </n-button>

          <div class="flex items-center justify-between px-4 py-3 mt-2 border-t border-gray-200 dark:border-gray-700">
            <span class="text-sm text-gray-600 dark:text-gray-400">{{ currentDate }}</span>
          </div>
        </div>
      </n-collapse-transition>
    </div>
  </n-layout-header>

  <!-- 占位空间，防止内容被固定标题遮挡 -->
  <div class="h-20 md:h-16"></div>
</template>

<script setup lang="ts">
import {computed, onMounted, ref} from 'vue';
import {useRouter} from 'vue-router';
import {NButton, NCollapseTransition, NLayoutHeader, NSpace} from 'naive-ui';
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
const showMobileMenu = ref(false);

// 设置header样式
const headerStyle = computed(() => ({
  backgroundColor: props.darkMode ? 'rgba(24, 24, 28, 0.75)' : 'rgba(255, 255, 255, 0.75)',
  color: props.darkMode ? 'white' : 'inherit',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
}));

// 路由导航
const navigateTo = (name: string) => {
  router.push({ name });
  if (isSmallScreen.value) {
    showMobileMenu.value = false;
  }
};

// 切换主题
const toggleTheme = () => {
  emit('toggle-theme');
};

// 切换移动端菜单
const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value;
};

// 导航链接样式
const linkClass = computed(() => ({
  'hover:text-blue-500 transition-all duration-300': true,
  'text-base': true,
  'py-2': true,
  'flex items-center': true,
  'relative group': true,
  'after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-blue-500 after:transition-all after:duration-300 hover:after:w-full': true
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
  if (!isSmallScreen.value) {
    showMobileMenu.value = false;
  }
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
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

</style>
