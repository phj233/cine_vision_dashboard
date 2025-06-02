<template>
  <n-card>
    <main class="container mx-auto px-6 py-8">
      <h1 class="text-2xl font-bold mb-6">数据可视化中心</h1>

      <!-- 图表过滤器 -->
      <n-card style="margin-bottom: 1.5rem;" embedded>
        <n-form>
          <n-grid :cols="24" :x-gap="12" :y-gap="12">
            <n-gi :span="6">
              <n-form-item label="图表选择">
                <n-select
                  v-model:value="selectedChart"
                  :options="[
                    { label: '评分分布', value: 'rating' },
                    { label: '年度趋势', value: 'yearly' },
                    { label: '类型比较', value: 'genre' },
                    { label: '时长分布', value: 'runtime' },
                    { label: '制作公司排名', value: 'companies' },
                    { label: '预算与票房关系', value: 'budget' }
                  ]"
                />
              </n-form-item>
            </n-gi>

            <n-gi :span="6" v-if="selectedChart === 'rating'">
              <n-form-item label="评分区间大小">
                <n-select
                  v-model:value="bucketSize"
                  :options="[
                    { label: '0.5', value: 0.5 },
                    { label: '1.0', value: 1 },
                    { label: '0.25', value: 0.25 }
                  ]"
                />
              </n-form-item>
            </n-gi>

            <n-gi :span="12" v-if="selectedChart === 'yearly'">
              <n-form-item label="年份范围">
                <n-grid :cols="2" :x-gap="12">
                  <n-gi>
                    <n-input-number
                      v-model:value="startYear"
                      placeholder="起始年份"
                      clearable
                    />
                  </n-gi>
                  <n-gi>
                    <n-input-number
                      v-model:value="endYear"
                      placeholder="结束年份"
                      clearable
                    />
                  </n-gi>
                </n-grid>
              </n-form-item>
            </n-gi>

            <n-gi :span="6" v-if="selectedChart === 'genre'">
              <n-form-item label="比较指标">
                <n-select
                  v-model:value="genreMetric"
                  :options="[
                    { label: '平均评分', value: 'avg_rating' },
                    { label: '平均预算', value: 'avg_budget' },
                    { label: '平均票房', value: 'avg_revenue' },
                    { label: '电影数量', value: 'count' },
                    { label: '平均时长', value: 'avg_runtime' }
                  ]"
                />
              </n-form-item>
            </n-gi>

            <n-gi :span="6" v-if="selectedChart === 'runtime'">
              <n-form-item label="时长区间大小（分钟）">
                <n-select
                  v-model:value="runtimeBucketSize"
                  :options="[
                    { label: '15', value: 15 },
                    { label: '30', value: 30 },
                    { label: '10', value: 10 }
                  ]"
                />
              </n-form-item>
            </n-gi>

            <n-gi :span="6" v-if="selectedChart === 'companies'">
              <n-form-item label="排序指标">
                <n-select
                  v-model:value="companyMetric"
                  :options="[
                    { label: '电影数量', value: 'movie_count' },
                    { label: '平均评分', value: 'avg_rating' },
                    { label: '总票房', value: 'total_revenue' },
                    { label: '平均票房', value: 'avg_revenue' }
                  ]"
                />
              </n-form-item>
            </n-gi>

            <n-gi :span="6" v-if="selectedChart === 'budget'">
              <n-form-item label="最低评分人数">
                <n-select
                  v-model:value="minVotes"
                  :options="[
                    { label: '10', value: 10 },
                    { label: '50', value: 50 },
                    { label: '100', value: 100 }
                  ]"
                />
              </n-form-item>
            </n-gi>

            <n-gi :span="24">
              <div style="display: flex; justify-content: flex-end;">
                <n-button
                  @click="loadChartData"
                  type="primary">
                  更新图表
                </n-button>
              </div>
            </n-gi>
          </n-grid>
        </n-form>
      </n-card>

      <!-- 图表区域 -->
      <n-card>
        <div v-if="loading" style="display: flex; justify-content: center; align-items: center; height: 500px;">
          <n-spin size="large" />
        </div>

        <div v-else style="height: 500px; width: 100%;">
          <!-- 评分分布图表 -->
          <v-chart
            v-if="selectedChart === 'rating' && ratingData.length > 0"
            style="width: 100%; height: 100%;"
            :option="ratingChartOption"
            :autoresize="true"></v-chart>

          <!-- 年度趋势图表 -->
          <v-chart
            v-else-if="selectedChart === 'yearly' && yearlyData.length > 0"
            style="width: 100%; height: 100%;"
            :option="yearlyChartOption"
            :autoresize="true"></v-chart>

          <!-- 类型比较图表 -->
          <v-chart
            v-else-if="selectedChart === 'genre' && genreData.length > 0"
            style="width: 100%; height: 100%;"
            :option="genreChartOption"
            :autoresize="true"></v-chart>

          <!-- 时长分布图表 -->
          <v-chart
            v-else-if="selectedChart === 'runtime' && runtimeData.length > 0"
            style="width: 100%; height: 100%;"
            :option="runtimeChartOption"
            :autoresize="true"></v-chart>

          <!-- 制作公司排名图表 -->
          <v-chart
            v-else-if="selectedChart === 'companies' && companiesData.length > 0"
            style="width: 100%; height: 100%;"
            :option="companiesChartOption"
            :autoresize="true"></v-chart>

          <!-- 预算与票房关系图表 -->
          <v-chart
            v-else-if="selectedChart === 'budget' && budgetData.buckets && budgetData.buckets.length > 0"
            style="width: 100%; height: 100%;"
            :option="budgetChartOption"
            :autoresize="true"></v-chart>

          <n-empty
            v-else
            description="暂无数据可显示，请尝试调整过滤条件或选择其他图表"
            style="height: 100%; display: flex; flex-direction: column; justify-content: center;" />
        </div>
      </n-card>

      <!-- 数据表格 -->
      <n-card v-if="!loading && showTable" style="margin-top: 1.5rem;">
        <n-h2>数据表格</n-h2>

        <!-- 评分分布表格 -->
        <n-data-table
          v-if="selectedChart === 'rating' && ratingData.length > 0"
          :columns="[
            { title: '评分区间', key: 'bucket_range', render: (row) => `${parseFloat(row.bucket_start)} - ${parseFloat(row.bucket_end)}` },
            { title: '电影数量', key: 'movie_count' }
          ]"
          :data="ratingData"
          :bordered="false"
          :pagination="{ pageSize: 10 }"
          striped
        />

        <!-- 年度趋势表格 -->
        <n-data-table
          v-else-if="selectedChart === 'yearly' && yearlyData.length > 0"
          :columns="[
            { title: '年份', key: 'year' },
            { title: '电影数量', key: 'movie_count' },
            { title: '平均评分', key: 'avg_rating' },
            { title: '平均预算', key: 'avg_budget', render: (row) => formatCurrency(row.avg_budget) },
            { title: '平均票房', key: 'avg_revenue', render: (row) => formatCurrency(row.avg_revenue) }
          ]"
          :data="yearlyData"
          :bordered="false"
          :pagination="{ pageSize: 10 }"
          striped
        />

        <!-- 类型比较表格 -->
        <n-data-table
          v-else-if="selectedChart === 'genre' && genreData.length > 0"
          :columns="[
            { title: '电影类型', key: 'genre' },
            { title: genreData[0]?.metric || '指标', key: 'value' }
          ]"
          :data="genreData"
          :bordered="false"
          :pagination="{ pageSize: 10 }"
          striped
        />

        <!-- 时长分布表格 -->
        <n-data-table
          v-else-if="selectedChart === 'runtime' && runtimeData.length > 0"
          :columns="[
            { title: '时长区间（分钟）', key: 'bucket_range', render: (row) => `${row.bucket_start} - ${row.bucket_end}` },
            { title: '电影数量', key: 'movie_count' },
            { title: '平均评分', key: 'avg_rating' }
          ]"
          :data="runtimeData"
          :bordered="false"
          :pagination="{ pageSize: 10 }"
          striped
        />

        <!-- 制作公司表格 -->
        <n-data-table
          v-else-if="selectedChart === 'companies' && companiesData.length > 0"
          :columns="[
            { title: '制作公司', key: 'company_name' },
            { title: '电影数量', key: 'movie_count' },
            { title: '平均评分', key: 'avg_rating' },
            { title: '总票房', key: 'total_revenue', render: (row) => formatCurrency(row.total_revenue) },
            { title: '平均票房', key: 'avg_revenue', render: (row) => formatCurrency(row.avg_revenue) }
          ]"
          :data="companiesData"
          :bordered="false"
          :pagination="{ pageSize: 10 }"
          striped
        />

        <!-- 预算与票房表格 -->
        <n-data-table
          v-else-if="selectedChart === 'budget' && budgetData.buckets && budgetData.buckets.length > 0"
          :columns="[
            { title: '预算区间', key: 'budget_range', render: (row) => `${formatCurrency(row.budget_bucket)} - ${formatCurrency(row.budget_bucket_end)}` },
            { title: '电影数量', key: 'movie_count' },
            { title: '平均票房', key: 'avg_revenue', render: (row) => formatCurrency(row.avg_revenue) },
            { title: '平均回报率', key: 'avg_roi', render: (row) => `${parseFloat(row.avg_roi).toFixed(2)}倍` }
          ]"
          :data="budgetData.buckets"
          :bordered="false"
          :pagination="{ pageSize: 10 }"
          striped
        />
      </n-card>
    </main>
  </n-card>
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
import {
  NButton,
  NCard,
  NDataTable,
  NEmpty,
  NForm,
  NFormItem,
  NGi,
  NGrid,
  NH2,
  NInputNumber,
  NSelect,
  NSpin
} from 'naive-ui';

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
