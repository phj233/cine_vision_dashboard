<script setup lang="ts">
import {NButton, NCard, NGrid, NGridItem, NList, NListItem, NSpace, NTag, NThing} from 'naive-ui';

const openLicense = () => {
  window.open('https://www.gnu.org/licenses/gpl-3.0.html', '_blank')
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4 sm:px-6 lg:px-8">
    <!-- Logo 部分 -->
    <div class="flex justify-center mb-8">
      <div class="text-center">
          <span class="material-symbols-outlined text-3xl text-blue-500 dark:text-blue-400 mr-2 animate-pulse">
            Cine Vision
          </span>
      </div>
    </div>

    <n-space vertical size="large">
      <!-- 项目介绍卡片 -->
      <n-card title="项目介绍" class="transition-all duration-300 hover:shadow-xl">
        <n-space vertical>
          <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
            Cine Vision 是一个专业的电影数据可视化平台，通过直观的图表和交互式界面，帮助用户深入理解电影行业的发展趋势和市场动态。
          </p>
          <n-space>
            <n-tag type="success" class="transition-transform duration-200 hover:scale-110">Vue 3</n-tag>
            <n-tag type="info" class="transition-transform duration-200 hover:scale-110">TypeScript</n-tag>
            <n-tag type="warning" class="transition-transform duration-200 hover:scale-110">ECharts</n-tag>
            <n-tag type="error" class="transition-transform duration-200 hover:scale-110">Naive UI</n-tag>
          </n-space>
        </n-space>
      </n-card>

      <!-- 主要特性卡片 -->
      <n-card title="主要特性" class="transition-all duration-300 hover:shadow-xl">
        <n-space vertical>
          <n-list hoverable clickable>
            <n-list-item class="transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-800">
              <n-thing title="📊 丰富的数据可视化展示">
                <template #description>
                  提供多种图表类型，包括折线图、柱状图、饼图、地图等，全方位展示电影数据
                </template>
              </n-thing>
            </n-list-item>
            <n-list-item class="transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-800">
              <n-thing title="📱 响应式设计">
                <template #description>
                  完美支持移动端和桌面端，提供一致的用户体验
                </template>
              </n-thing>
            </n-list-item>
            <n-list-item class="transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-800">
              <n-thing title="🌓 主题切换">
                <template #description>
                  支持深色/浅色主题切换，保护用户视力
                </template>
              </n-thing>
            </n-list-item>
            <n-list-item class="transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-800">
              <n-thing title="🔍 数据分析功能">
                <template #description>
                  强大的数据筛选和分析功能，帮助用户深入理解数据
                </template>
              </n-thing>
            </n-list-item>
          </n-list>
        </n-space>
      </n-card>

      <!-- 数据可视化组件卡片 -->
      <n-card title="数据可视化组件" class="transition-all duration-300 hover:shadow-xl">
        <n-grid :cols="2" :x-gap="12" :y-gap="8">
          <n-grid-item>
            <n-card title="核心图表" size="small" class="transition-all duration-300 hover:shadow-lg">
              <n-list hoverable>
                <n-list-item class="transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-800">票房趋势分析</n-list-item>
                <n-list-item class="transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-800">预算与票房对比</n-list-item>
                <n-list-item class="transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-800">电影类型统计</n-list-item>
                <n-list-item class="transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-800">全球电影分布</n-list-item>
                <n-list-item class="transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-800">语言分布</n-list-item>
                <n-list-item class="transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-800">导演作品分析</n-list-item>
              </n-list>
            </n-card>
          </n-grid-item>
          <n-grid-item>
            <n-card title="辅助组件" size="small" class="transition-all duration-300 hover:shadow-lg">
              <n-list hoverable>
                <n-list-item class="transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-800">关键数据统计卡片</n-list-item>
                <n-list-item class="transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-800">小型数据图表</n-list-item>
                <n-list-item class="transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-800">图表展示区域</n-list-item>
                <n-list-item class="transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-800">电影数据表格</n-list-item>
              </n-list>
            </n-card>
          </n-grid-item>
        </n-grid>
      </n-card>

      <!-- 数据来源卡片 -->
      <n-card title="数据来源" class="transition-all duration-300 hover:shadow-xl">
        <n-space vertical>
          <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
            项目使用 Kaggle IMDB 公共电影数据集，包含以下信息：
          </p>
          <n-list hoverable>
            <n-list-item class="transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-800">电影基本信息</n-list-item>
            <n-list-item class="transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-800">票房数据</n-list-item>
            <n-list-item class="transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-800">评分信息</n-list-item>
            <n-list-item class="transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-800">制片国家</n-list-item>
            <n-list-item class="transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-800">导演和演员信息</n-list-item>
          </n-list>
        </n-space>
      </n-card>

      <!-- 目标用户卡片 -->
      <n-card title="目标用户" class="transition-all duration-300 hover:shadow-xl">
        <n-grid :cols="2" :x-gap="12" :y-gap="8">
          <n-grid-item>
            <n-card title="专业用户" size="small" class="transition-all duration-300 hover:shadow-lg">
              <n-list hoverable>
                <n-list-item class="transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-800">电影行业从业者</n-list-item>
                <n-list-item class="transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-800">数据分析师</n-list-item>
                <n-list-item class="transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-800">研究人员</n-list-item>
              </n-list>
            </n-card>
          </n-grid-item>
          <n-grid-item>
            <n-card title="普通用户" size="small" class="transition-all duration-300 hover:shadow-lg">
              <n-list hoverable>
                <n-list-item class="transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-800">影迷</n-list-item>
                <n-list-item class="transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-800">电影爱好者</n-list-item>
                <n-list-item class="transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-800">学生</n-list-item>
              </n-list>
            </n-card>
          </n-grid-item>
        </n-grid>
      </n-card>

      <!-- 技术栈卡片 -->
      <n-card title="技术栈" class="transition-all duration-300 hover:shadow-xl">
        <n-space vertical>
          <n-grid :cols="3" :x-gap="12" :y-gap="8">
            <n-grid-item>
              <n-card title="前端框架" size="small" class="transition-all duration-300 hover:shadow-lg">
                <n-list hoverable>
                  <n-list-item class="transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-800">Vue 3</n-list-item>
                  <n-list-item class="transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-800">TypeScript</n-list-item>
                  <n-list-item class="transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-800">Vite</n-list-item>
                </n-list>
              </n-card>
            </n-grid-item>
            <n-grid-item>
              <n-card title="UI 框架" size="small" class="transition-all duration-300 hover:shadow-lg">
                <n-list hoverable>
                  <n-list-item class="transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-800">Naive UI</n-list-item>
                  <n-list-item class="transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-800">Tailwind CSS</n-list-item>
                  <n-list-item class="transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-800">ECharts</n-list-item>
                </n-list>
              </n-card>
            </n-grid-item>
            <n-grid-item>
              <n-card title="工具库" size="small" class="transition-all duration-300 hover:shadow-lg">
                <n-list hoverable>
                  <n-list-item class="transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-800">Pinia</n-list-item>
                  <n-list-item class="transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-800">Vue Router</n-list-item>
                  <n-list-item class="transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-800">Axios</n-list-item>
                </n-list>
              </n-card>
            </n-grid-item>
          </n-grid>
        </n-space>
      </n-card>

      <!-- 许可证卡片 -->
      <n-card title="许可证" class="transition-all duration-300 hover:shadow-xl">
        <n-space vertical>
          <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
            本项目采用 GPL-3.0 许可证
          </p>
          <n-button type="primary" class="transition-all duration-200 hover:scale-105" @click="openLicense">
            查看许可证详情
          </n-button>
        </n-space>
      </n-card>
    </n-space>
  </div>
</template>

<style scoped>
.animate-float {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0px);
  }
}
</style>
