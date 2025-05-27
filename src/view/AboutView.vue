<script setup lang="ts">
import {useTheme} from '@/composables/useTheme';

// 获取主题状态
const { isDark } = useTheme();
</script>

<template>
  <div class="min-h-screen dark-bg">
    <main class="container mx-auto px-6 py-8">
      <h1 class="text-2xl font-bold mb-6 dark-text">关于本项目</h1>

      <n-card :bordered="false" class="mb-6">
        <template #header>项目介绍</template>
        <p class="mb-4">电影数据可视化平台是一个用于展示和分析电影相关数据的工具，提供了丰富的数据可视化和筛选功能。</p>
        <p>本项目采用 Vue 3 + TypeScript + Naive UI 开发，具有响应式设计和暗黑主题支持。</p>
      </n-card>
    </main>
  </div>
</template>

<style scoped>
</style>
