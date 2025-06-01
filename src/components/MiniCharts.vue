<template>
  <n-card title="数据概要" size="small">
    <n-grid :cols="1" :x-gap="12" :y-gap="12">
      <!-- 预算-票房对比 -->
      <n-gi :span="1">
        <n-statistic label="预算-票房对比">
          <div class="h-50">
            <v-chart class="w-full h-full" :option="budgetRevenueChartOption" :autoresize="true"></v-chart>
          </div>
        </n-statistic>
      </n-gi>

      <!-- 电影时长分布 -->
      <n-gi :span="1">
        <n-statistic label="电影时长分布">
          <div class="h-50">
            <v-chart class="w-full h-full" :option="runtimeChartOption" :autoresize="true"></v-chart>
          </div>
        </n-statistic>
      </n-gi>
    </n-grid>
  </n-card>
</template>

<script setup lang="ts">
import {computed, onMounted, ref} from 'vue';
import {NCard, NGi, NGrid, NStatistic} from 'naive-ui';
import {use} from 'echarts/core';
import {CanvasRenderer} from 'echarts/renderers';
import {BarChart, PieChart} from 'echarts/charts';
import {GridComponent, LegendComponent, TitleComponent, TooltipComponent} from 'echarts/components';
import VChart from 'vue-echarts';
import {visualizationApi} from '@/lib/api';
import {useTheme} from '@/composables/useTheme';
import {getChartTheme} from '@/lib/theme';

// 注册 ECharts 组件
use([
  CanvasRenderer,
  BarChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
]);

// 获取主题状态
const { isDark } = useTheme();

// 应用主题
const getEchartTheme = computed(() => {
  return getChartTheme(isDark.value);
});

interface BudgetData {
  budget_bucket: string;
  budget_bucket_end: string;
  avg_revenue: string;
  avg_roi: string;
  movie_count: number;
}

interface RuntimeData {
  bucket_start: string;
  bucket_end: string;
  movie_count: number;
}

const budgetData = ref<BudgetData[]>([]);
const runtimeData = ref<RuntimeData[]>([]);

// 获取预算-票房数据
const fetchBudgetRevenueData = async () => {
  try {
    // 调用API
    const data = await visualizationApi.getBudgetRevenueAnalysis();
    console.log('预算票房原始数据:', data);

    if (data && data.data && data.data.buckets) {
      budgetData.value = data.data.buckets;
      console.log('预算票房数据处理后:', budgetData.value);
    }
  } catch (error) {
    console.error('获取预算票房数据失败:', error);
    // 模拟数据
    budgetData.value = generateSampleBudgetData();
  }
};

// 获取时长分布数据
const fetchRuntimeData = async () => {
  try {
    // 调用API
    const data = await visualizationApi.getRuntimeDistribution();
    if (data && data.data) {
      runtimeData.value = data.data;
      console.log('电影时长数据:', data.data);
    }
  } catch (error) {
    console.error('获取时长分布数据失败:', error);
    // 模拟数据
    runtimeData.value = generateSampleRuntimeData();
  }
};

// 生成预算与票房样本数据
const generateSampleBudgetData = () => {
  return [
    { budget_bucket: "0", budget_bucket_end: "20000000", avg_revenue: "30000000", avg_roi: "1.5", movie_count: 300 },
    { budget_bucket: "20000000", budget_bucket_end: "40000000", avg_revenue: "80000000", avg_roi: "2.0", movie_count: 200 },
    { budget_bucket: "40000000", budget_bucket_end: "60000000", avg_revenue: "150000000", avg_roi: "2.5", movie_count: 100 },
    { budget_bucket: "60000000", budget_bucket_end: "80000000", avg_revenue: "180000000", avg_roi: "2.25", movie_count: 80 },
    { budget_bucket: "80000000", budget_bucket_end: "100000000", avg_revenue: "220000000", avg_roi: "2.2", movie_count: 60 },
    { budget_bucket: "100000000", budget_bucket_end: "200000000", avg_revenue: "300000000", avg_roi: "2.0", movie_count: 40 },
  ];
};

// 生成时长分布样本数据
const generateSampleRuntimeData = () => {
  return [
    { bucket_start: "0", bucket_end: "60", movie_count: 120 },
    { bucket_start: "60", bucket_end: "90", movie_count: 580 },
    { bucket_start: "90", bucket_end: "120", movie_count: 980 },
    { bucket_start: "120", bucket_end: "150", movie_count: 650 },
    { bucket_start: "150", bucket_end: "180", movie_count: 320 },
    { bucket_start: "180", bucket_end: "210", movie_count: 130 },
    { bucket_start: "210", bucket_end: "240", movie_count: 50 },
    { bucket_start: "240", bucket_end: "300", movie_count: 20 },
  ];
};

// 预算-票房图表配置
const budgetRevenueChartOption = computed(() => {
  if (budgetData.value.length === 0) {
    return {};
  }

  // 处理数据格式，确保使用正确的属性名
  const processedData = budgetData.value.map((item: any) => {
    return {
      budget_bucket: item.budget_bucket || item.bucket_start || '0',
      budget_bucket_end: item.budget_bucket_end || item.bucket_end || '0',
      avg_revenue: item.avg_revenue || '0',
      movie_count: parseInt(item.movie_count) || 0
    };
  });

  return {
    ...getEchartTheme.value,
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: function(params: any) {
        const data = processedData[params[0].dataIndex];
        const budgetStart = parseFloat(data.budget_bucket)/1000000;
        const budgetEnd = parseFloat(data.budget_bucket_end)/1000000;
        const revenue = parseFloat(data.avg_revenue)/1000000;
        return `预算: ${budgetStart}-${budgetEnd}百万<br/>
平均票房: ${revenue.toFixed(1)}百万<br/>
电影数量: ${data.movie_count}部`;
      }
    },
    grid: {
      top: 10,
      right: 10,
      bottom: 20,
      left: 50,
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: processedData.map((item: any) => {
        const budgetStart = parseFloat(item.budget_bucket)/1000000;
        const budgetEnd = parseFloat(item.budget_bucket_end)/1000000;
        return `${budgetStart}-${budgetEnd}`;
      }),
      axisLabel: {
        rotate: 30,
        fontSize: 10
      }
    },
    yAxis: {
      type: 'value',
      name: '百万美元',
      nameLocation: 'middle',
      nameGap: 30,
      axisLabel: {
        fontSize: 10
      }
    },
    series: [
      {
        name: '平均票房',
        type: 'bar',
        data: processedData.map((item: any) => parseFloat(item.avg_revenue)/1000000),
        itemStyle: {
          color: function(params: any) {
            const colorList = ['#91caff', '#73d13d', '#ffc53d', '#ffa940', '#ff7a45', '#ff4d4f'];
            return colorList[params.dataIndex % colorList.length];
          }
        }
      }
    ]
  };
});

// 时长分布图表配置
const runtimeChartOption = computed(() => {
  if (runtimeData.value.length === 0) {
    return {};
  }

  // 处理数据格式，确保使用正确的属性名
  const processedData = runtimeData.value.map((item: any) => {
    return {
      bucket_start: item.bucket_start || '0',
      bucket_end: item.bucket_end || '0',
      movie_count: parseInt(item.movie_count) || 0
    };
  });

  return {
    ...getEchartTheme.value,
    tooltip: {
      trigger: 'axis',
      formatter: function(params: any) {
        const data = processedData[params[0].dataIndex];
        return `${data.bucket_start}-${data.bucket_end}分钟: ${data.movie_count}部电影`;
      }
    },
    grid: {
      top: 10,
      right: 10,
      bottom: 20,
      left: 50,
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: processedData.map((item: any) => `${item.bucket_start}-${item.bucket_end}`),
      axisLabel: {
        interval: 0,
        rotate: 30,
        fontSize: 10
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        fontSize: 10
      }
    },
    series: [
      {
        data: processedData.map((item: any) => item.movie_count),
        type: 'bar',
        itemStyle: {
          color: function(params: any) {
            const colorList = ['#91caff', '#73d13d', '#ffc53d', '#ffa940', '#ff7a45', '#ff4d4f'];
            return colorList[params.dataIndex % colorList.length];
          }
        }
      }
    ]
  };
});

onMounted(() => {
  fetchBudgetRevenueData();
  fetchRuntimeData();
});
</script>

<style scoped>
.h-50 {
  height: 12.5rem;
}
.w-full {
  width: 100%;
}
.h-full {
  height: 100%;
}
</style>
