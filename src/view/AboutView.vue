<script setup lang="ts">
import {NCard} from 'naive-ui';
</script>

<template>
  <n-card class="min-h-screen" >
    <main class="container mx-auto px-6 py-8">
      <h1 class="text-2xl font-bold mb-6">关于本项目</h1>

      <n-card embedded class="mb-6">
        <template #header>项目介绍</template>
        <p class="mb-4">电影数据可视化平台是一个用于展示和分析电影相关数据的工具，提供了丰富的数据可视化和筛选功能。</p>
        <p>本项目采用 Vue 3 + TypeScript + Naive UI 开发，具有响应式设计和暗黑主题支持。</p>
      </n-card>
    </main>
  </n-card>
</template>

<style scoped>
.min-h-screen {
  min-height: 1024px;
}
</style>
