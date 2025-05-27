<template>
  <div class="min-h-screen dark-bg">
    <main class="container mx-auto px-6 py-8">
      <h1 class="text-2xl font-bold mb-6 dark-text">电影数据可视化</h1>

      <!-- 图表过滤器 -->
      <div class="dark-card rounded-lg shadow-sm p-4 mb-6">
        <div class="flex flex-wrap gap-4">
          <div class="flex-1">
            <label class="block text-sm font-medium dark-text-secondary mb-1">图表选择</label>
            <select
              v-model="selectedChart"
              class="w-full border border-gray-300 rounded-md p-2">
              <option value="rating">评分分布</option>
              <option value="yearly">年度趋势</option>
              <option value="genre">类型比较</option>
              <option value="runtime">时长分布</option>
              <option value="companies">制作公司排名</option>
              <option value="budget">预算与票房关系</option>
            </select>
          </div>

          <div v-if="selectedChart === 'rating'" class="flex-1">
            <label class="block text-sm font-medium dark-text-secondary mb-1">评分区间大小</label>
            <select
              v-model="bucketSize"
              class="w-full border border-gray-300 rounded-md p-2">
              <option :value="0.5">0.5</option>
              <option :value="1">1.0</option>
              <option :value="0.25">0.25</option>
            </select>
          </div>

          <div v-if="selectedChart === 'yearly'" class="flex-1">
            <label class="block text-sm font-medium dark-text-secondary mb-1">年份范围</label>
            <div class="flex gap-2">
              <input
                type="number"
                v-model="startYear"
                placeholder="起始年份"
                class="w-1/2 border border-gray-300 rounded-md p-2" />
              <input
                type="number"
                v-model="endYear"
                placeholder="结束年份"
                class="w-1/2 border border-gray-300 rounded-md p-2" />
            </div>
          </div>

          <div v-if="selectedChart === 'genre'" class="flex-1">
            <label class="block text-sm font-medium dark-text-secondary mb-1">比较指标</label>
            <select
              v-model="genreMetric"
              class="w-full border border-gray-300 rounded-md p-2">
              <option value="avg_rating">平均评分</option>
              <option value="avg_budget">平均预算</option>
              <option value="avg_revenue">平均票房</option>
              <option value="count">电影数量</option>
              <option value="avg_runtime">平均时长</option>
            </select>
          </div>

          <div v-if="selectedChart === 'runtime'" class="flex-1">
            <label class="block text-sm font-medium dark-text-secondary mb-1">时长区间大小（分钟）</label>
            <select
              v-model="runtimeBucketSize"
              class="w-full border border-gray-300 rounded-md p-2">
              <option :value="15">15</option>
              <option :value="30">30</option>
              <option :value="10">10</option>
            </select>
          </div>

          <div v-if="selectedChart === 'companies'" class="flex-1">
            <label class="block text-sm font-medium dark-text-secondary mb-1">排序指标</label>
            <select
              v-model="companyMetric"
              class="w-full border border-gray-300 rounded-md p-2">
              <option value="movie_count">电影数量</option>
              <option value="avg_rating">平均评分</option>
              <option value="total_revenue">总票房</option>
              <option value="avg_revenue">平均票房</option>
            </select>
          </div>

          <div v-if="selectedChart === 'budget'" class="flex-1">
            <label class="block text-sm font-medium dark-text-secondary mb-1">最低评分人数</label>
            <select
              v-model="minVotes"
              class="w-full border border-gray-300 rounded-md p-2">
              <option :value="10">10</option>
              <option :value="50">50</option>
              <option :value="100">100</option>
            </select>
          </div>

          <div class="flex items-end">
            <button
              @click="loadChartData"
              class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              更新图表
            </button>
          </div>
        </div>
      </div>

      <!-- 图表区域 -->
      <div class="dark-card-bg rounded-lg shadow-sm p-6">
        <div v-if="loading" class="flex justify-center items-center h-80">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>

        <div v-else class="h-[500px]">
          <!-- 评分分布图表 -->
          <v-chart
            v-if="selectedChart === 'rating' && ratingData.length > 0"
            class="w-full h-full"
            :option="ratingChartOption"
            autoresize />

          <!-- 年度趋势图表 -->
          <v-chart
            v-else-if="selectedChart === 'yearly' && yearlyData.length > 0"
            class="w-full h-full"
            :option="yearlyChartOption"
            autoresize />

          <!-- 类型比较图表 -->
          <v-chart
            v-else-if="selectedChart === 'genre' && genreData.length > 0"
            class="w-full h-full"
            :option="genreChartOption"
            autoresize />

          <!-- 时长分布图表 -->
          <v-chart
            v-else-if="selectedChart === 'runtime' && runtimeData.length > 0"
            class="w-full h-full"
            :option="runtimeChartOption"
            autoresize />

          <!-- 制作公司排名图表 -->
          <v-chart
            v-else-if="selectedChart === 'companies' && companiesData.length > 0"
            class="w-full h-full"
            :option="companiesChartOption"
            autoresize />

          <!-- 预算与票房关系图表 -->
          <v-chart
            v-else-if="selectedChart === 'budget' && budgetData.buckets && budgetData.buckets.length > 0"
            class="w-full h-full"
            :option="budgetChartOption"
            autoresize />

          <div v-else class="flex justify-center items-center h-full">
            <p class="text-gray-500">暂无数据可显示，请尝试调整过滤条件或选择其他图表</p>
          </div>
        </div>
      </div>

      <!-- 数据表格 -->
      <div v-if="!loading && showTable" class="dark-card-bg rounded-lg shadow-sm p-6 mt-6">
        <h2 class="text-xl font-semibold mb-4">数据表格</h2>

        <!-- 评分分布表格 -->
        <table v-if="selectedChart === 'rating' && ratingData.length > 0" class="w-full border-collapse">
          <thead>
            <tr class="bg-gray-100">
              <th class="p-2 text-left">评分区间</th>
              <th class="p-2 text-left">电影数量</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in ratingData" :key="index" class="border-b">
              <td class="p-2">{{ parseFloat(item.bucket_start) }} - {{ parseFloat(item.bucket_end) }}</td>
              <td class="p-2">{{ item.movie_count }}</td>
            </tr>
          </tbody>
        </table>

        <!-- 年度趋势表格 -->
        <table v-else-if="selectedChart === 'yearly' && yearlyData.length > 0" class="w-full border-collapse">
          <thead>
            <tr class="bg-gray-100">
              <th class="p-2 text-left">年份</th>
              <th class="p-2 text-left">电影数量</th>
              <th class="p-2 text-left">平均评分</th>
              <th class="p-2 text-left">平均预算</th>
              <th class="p-2 text-left">平均票房</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in yearlyData" :key="index" class="border-b">
              <td class="p-2">{{ item.year }}</td>
              <td class="p-2">{{ item.movie_count }}</td>
              <td class="p-2">{{ item.avg_rating }}</td>
              <td class="p-2">{{ formatCurrency(item.avg_budget) }}</td>
              <td class="p-2">{{ formatCurrency(item.avg_revenue) }}</td>
            </tr>
          </tbody>
        </table>

        <!-- 其他表格根据需要添加 -->
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, ref, watch} from 'vue';
import {visualizationApi} from '@/lib/api';
import {use} from 'echarts/core';
import {CanvasRenderer} from 'echarts/renderers';
import {BarChart, LineChart, ScatterChart} from 'echarts/charts';
import {
  DataZoomComponent,
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
  VisualMapComponent,
} from 'echarts/components';
import VChart from 'vue-echarts';
import {useTheme} from '@/composables/useTheme'

// 注册 ECharts 组件
use([
  CanvasRenderer,
  BarChart,
  LineChart,
  ScatterChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
  VisualMapComponent,
]);

// 获取主题状态
const { isDark } = useTheme();

// 状态变量
const loading = ref(false);
const showTable = ref(true);
const selectedChart = ref('rating');

// 图表参数
const bucketSize = ref(0.5);
const startYear = ref(1990);
const endYear = ref(new Date().getFullYear());
const genreMetric = ref('avg_rating');
const runtimeBucketSize = ref(15);
const companyMetric = ref('movie_count');
const minVotes = ref(50);

// 图表数据
const ratingData = ref<any[]>([]);
const yearlyData = ref<any[]>([]);
const genreData = ref<any[]>([]);
const runtimeData = ref<any[]>([]);
const companiesData = ref<any[]>([]);
const budgetData = ref<any>({});

// 加载图表数据
const loadChartData = async () => {
  loading.value = true;
  try {
    switch (selectedChart.value) {
      case 'rating':
        const ratingResult = await visualizationApi.getRatingDistribution(bucketSize.value);
        ratingData.value = ratingResult.data;
        break;
      case 'yearly':
        const yearlyResult = await visualizationApi.getYearlyTrends(startYear.value, endYear.value, minVotes.value);
        yearlyData.value = yearlyResult.data;
        break;
      case 'genre':
        const genreResult = await visualizationApi.getGenreComparison(undefined, genreMetric.value);
        genreData.value = genreResult.data;
        break;
      case 'runtime':
        const runtimeResult = await visualizationApi.getRuntimeDistribution(runtimeBucketSize.value, minVotes.value);
        runtimeData.value = runtimeResult.data;
        break;
      case 'companies':
        const companiesResult = await visualizationApi.getTopProductionCompanies(10, 5, companyMetric.value);
        companiesData.value = companiesResult.data;
        break;
      case 'budget':
        const budgetResult = await visualizationApi.getBudgetRevenueAnalysis(
          startYear.value,
          endYear.value,
          minVotes.value
        );
        budgetData.value = budgetResult.data;
        break;
    }
  } catch (error) {
    console.error('加载图表数据失败:', error);
  } finally {
    loading.value = false;
  }
};

// 监听图表类型变化
watch(selectedChart, () => {
  loadChartData();
});

// 格式化金额
const formatCurrency = (value: string | number) => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (num >= 1000000) {
    return (num / 1000000).toFixed(2) + '百万';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(2) + '千';
  }
  return num;
};

// 评分分布图表选项
const ratingChartOption = computed(() => ({
  title: {
    text: '电影评分分布',
    left: 'center'
  },
  tooltip: {
    trigger: 'axis',
    formatter: '{b}<br />电影数量: {c}'
  },
  xAxis: {
    type: 'category',
    data: ratingData.value.map(item => `${item.bucket_start}-${item.bucket_end}`),
    name: '评分区间'
  },
  yAxis: {
    type: 'value',
    name: '电影数量'
  },
  series: [
    {
      name: '电影数量',
      type: 'bar',
      data: ratingData.value.map(item => item.movie_count),
      itemStyle: {
        color: function(params: any) {
          const value = parseFloat(ratingData.value[params.dataIndex].bucket_start);
          return value < 5 ? '#ff7979' : value < 7 ? '#ffbe76' : '#badc58';
        }
      }
    }
  ]
}));

// 年度趋势图表选项
const yearlyChartOption = computed(() => ({
  title: {
    text: '电影年度趋势',
    left: 'center'
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  legend: {
    data: ['电影数量', '平均评分', '平均预算', '平均票房'],
    top: 30
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: yearlyData.value.map(item => item.year),
    name: '年份'
  },
  yAxis: [
    {
      type: 'value',
      name: '电影数量',
      position: 'left'
    },
    {
      type: 'value',
      name: '平均评分',
      position: 'right',
      min: 0,
      max: 10,
      splitNumber: 5
    }
  ],
  series: [
    {
      name: '电影数量',
      type: 'bar',
      data: yearlyData.value.map(item => item.movie_count)
    },
    {
      name: '平均评分',
      type: 'line',
      yAxisIndex: 1,
      data: yearlyData.value.map(item => item.avg_rating),
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: {
        width: 3,
        color: '#ff7979'
      },
      itemStyle: {
        color: '#ff7979'
      }
    },
    {
      name: '平均预算',
      type: 'line',
      data: yearlyData.value.map(item => parseFloat(item.avg_budget) / 1000000),
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: {
        width: 3,
        color: '#badc58'
      },
      itemStyle: {
        color: '#badc58'
      }
    },
    {
      name: '平均票房',
      type: 'line',
      data: yearlyData.value.map(item => parseFloat(item.avg_revenue) / 1000000),
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: {
        width: 3,
        color: '#54a0ff'
      },
      itemStyle: {
        color: '#54a0ff'
      }
    }
  ]
}));

// 类型比较图表选项
const genreChartOption = computed(() => ({
  title: {
    text: `电影类型${genreData.value.length > 0 ? genreData.value[0].metric : ''}比较`,
    left: 'center'
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  xAxis: {
    type: 'category',
    data: genreData.value.map(item => item.genre),
    axisLabel: {
      rotate: 45,
      interval: 0
    },
    name: '电影类型'
  },
  yAxis: {
    type: 'value',
    name: genreData.value.length > 0 ? genreData.value[0].metric : ''
  },
  series: [
    {
      type: 'bar',
      data: genreData.value.map(item => item.value),
      itemStyle: {
        color: function(params: any) {
          const colors = ['#ff7979', '#ffbe76', '#badc58', '#54a0ff', '#5f27cd', '#ff6b81'];
          return colors[params.dataIndex % colors.length];
        }
      }
    }
  ]
}));

// 时长分布图表选项
const runtimeChartOption = computed(() => ({
  title: {
    text: '电影时长分布',
    left: 'center'
  },
  tooltip: {
    trigger: 'axis',
    formatter: '{b}<br />电影数量: {c}'
  },
  xAxis: {
    type: 'category',
    data: runtimeData.value.map(item => `${item.bucket_start}-${item.bucket_end}`),
    name: '时长区间（分钟）',
    axisLabel: {
      rotate: 45,
      interval: 0
    }
  },
  yAxis: {
    type: 'value',
    name: '电影数量'
  },
  series: [
    {
      name: '电影数量',
      type: 'bar',
      data: runtimeData.value.map(item => item.movie_count),
      itemStyle: {
        color: function(params: any) {
          const value = parseFloat(runtimeData.value[params.dataIndex].bucket_start);
          // 颜色从蓝色渐变到红色
          return `rgba(${Math.min(255, value / 3)}, ${Math.max(0, 255 - value / 1.5)}, 255, 0.8)`;
        }
      }
    }
  ]
}));

// 制作公司排名图表选项
const companiesChartOption = computed(() => {
  const sortedData = [...companiesData.value].sort((a, b) => {
    const aValue = companyMetric.value === 'total_revenue' || companyMetric.value === 'avg_revenue'
      ? parseFloat(a[companyMetric.value])
      : a[companyMetric.value];
    const bValue = companyMetric.value === 'total_revenue' || companyMetric.value === 'avg_revenue'
      ? parseFloat(b[companyMetric.value])
      : b[companyMetric.value];
    return bValue - aValue;
  });

  const displayData = sortedData.slice(0, 10);

  return {
    title: {
      text: '制作公司排名',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: function(params: any) {
        const data = displayData[params[0].dataIndex];
        return `${data.company_name}<br />
                电影数量: ${data.movie_count}<br />
                平均评分: ${data.avg_rating}<br />
                总票房: ${formatCurrency(data.total_revenue)}<br />
                平均票房: ${formatCurrency(data.avg_revenue)}`;
      }
    },
    xAxis: {
      type: 'category',
      data: displayData.map(item => item.company_name),
      axisLabel: {
        rotate: 45,
        interval: 0
      },
      name: '制作公司'
    },
    yAxis: {
      type: 'value',
      name: companyMetric.value === 'movie_count' ? '电影数量' :
            companyMetric.value === 'avg_rating' ? '平均评分' :
            companyMetric.value === 'total_revenue' ? '总票房' : '平均票房'
    },
    series: [
      {
        type: 'bar',
        data: displayData.map(item =>
          companyMetric.value === 'total_revenue' || companyMetric.value === 'avg_revenue'
            ? parseFloat(item[companyMetric.value])
            : item[companyMetric.value]
        ),
        itemStyle: {
          color: function(params: any) {
            const colors = ['#ff7979', '#ffbe76', '#badc58', '#54a0ff', '#5f27cd',
                           '#ff6b81', '#7bed9f', '#70a1ff', '#a4b0be', '#ff9ff3'];
            return colors[params.dataIndex % colors.length];
          }
        }
      }
    ]
  };
});

// 预算与票房关系图表选项
const budgetChartOption = computed(() => {
  if (!budgetData.value || !budgetData.value.buckets || budgetData.value.buckets.length === 0) {
    return {};
  }

  return {
    title: {
      text: '预算与票房关系分析',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      },
      formatter: function(params: any) {
        const budgetBucket = budgetData.value.buckets[params[0].dataIndex];
        const budget = parseFloat(budgetBucket.budget_bucket) / 1000000;
        const budgetEnd = parseFloat(budgetBucket.budget_bucket_end) / 1000000;
        return `预算区间: ${budget.toFixed(0)}-${budgetEnd.toFixed(0)}百万<br />
                平均票房: ${(parseFloat(budgetBucket.avg_revenue) / 1000000).toFixed(2)}百万<br />
                平均ROI: ${budgetBucket.avg_roi}<br />
                电影数量: ${budgetBucket.movie_count}`;
      }
    },
    legend: {
      data: ['平均票房', '平均ROI', '电影数量'],
      top: 30
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: budgetData.value.buckets.map((item: any) =>
        `${(parseFloat(item.budget_bucket) / 1000000).toFixed(0)}M`
      ),
      name: '预算区间（百万）',
      axisLabel: {
        rotate: 45,
        interval: 0
      }
    },
    yAxis: [
      {
        type: 'value',
        name: '平均票房（百万）',
        position: 'left'
      },
      {
        type: 'value',
        name: '平均ROI',
        position: 'right'
      }
    ],
    series: [
      {
        name: '平均票房',
        type: 'bar',
        data: budgetData.value.buckets.map((item: any) => parseFloat(item.avg_revenue) / 1000000)
      },
      {
        name: '平均ROI',
        type: 'line',
        yAxisIndex: 1,
        data: budgetData.value.buckets.map((item: any) => item.avg_roi),
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          width: 3,
          color: '#ff7979'
        },
        itemStyle: {
          color: '#ff7979'
        }
      },
      {
        name: '电影数量',
        type: 'line',
        data: budgetData.value.buckets.map((item: any) => item.movie_count),
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          width: 3,
          color: '#badc58'
        },
        itemStyle: {
          color: '#badc58'
        }
      }
    ]
  };
});

// 组件挂载时加载初始数据
onMounted(() => {
  loadChartData();
});
</script>

<style scoped>
.chart-container {
  min-height: 400px;
  width: 100%;
}

/* 暗色模式下表单元素样式 */
.dark select,
.dark input[type="text"],
.dark input[type="number"] {
  background-color: #1f2937;
  color: #e5e7eb;
  border-color: #4b5563;
}

.dark select:focus,
.dark input[type="text"]:focus,
.dark input[type="number"]:focus {
  border-color: #60a5fa;
  outline: none;
}

.dark table thead tr {
  background-color: #1f2937;
}

.dark table tbody tr {
  border-color: #374151;
}

.dark table tbody tr:nth-child(even) {
  background-color: rgba(55, 65, 81, 0.1);
}
</style>
