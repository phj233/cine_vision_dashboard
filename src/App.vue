<script setup lang="ts">
import AppHeader from "@/components/Header.vue";
import {darkTheme, NConfigProvider, NLayout, NLayoutContent, NMessageProvider} from 'naive-ui';
import {onMounted, provide, ref, watch} from 'vue';
import {darkThemeOverrides, lightThemeOverrides} from '@/lib/theme';

// 创建主题状态
const theme = ref<null | typeof darkTheme>(null);
const themeOverrides = ref(lightThemeOverrides);

// 提供主题状态给整个应用
provide('theme', theme);

// 切换主题的方法，可以传递给Header组件
const toggleTheme = () => {
  theme.value = theme.value === null ? darkTheme : null;
  themeOverrides.value = theme.value === null ? lightThemeOverrides : darkThemeOverrides;

  // 保存主题偏好到本地存储
  localStorage.setItem('theme-preference', theme.value === null ? 'light' : 'dark');
};

// 监听主题变化，更新文档类名
watch(theme, (newTheme) => {
  if (newTheme === darkTheme) {
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('dark');
  }
});

// 初始化时从本地存储读取主题偏好
const initTheme = () => {
  const savedTheme = localStorage.getItem('theme-preference');
  if (savedTheme === 'dark') {
    theme.value = darkTheme;
    themeOverrides.value = darkThemeOverrides;
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark');
  }
};

// 在组件挂载后初始化主题
onMounted(() => {
  initTheme();
});
</script>

<template>
  <n-config-provider :theme="theme" :theme-overrides="themeOverrides">
    <n-notification-provider>
      <n-message-provider>
        <n-layout position="absolute">
          <!-- 头部导航 -->
          <AppHeader @toggle-theme="toggleTheme" :dark-mode="theme !== null" />
          <n-layout-content>
            <router-view/>
          </n-layout-content>
        </n-layout>
      </n-message-provider>
    </n-notification-provider>
  </n-config-provider>
</template>

<style>

</style>
