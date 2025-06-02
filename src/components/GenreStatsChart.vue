<template>
  <n-card :bordered="false" size="small" class="genre-stats-card">
    <n-space vertical>
      <!-- 加载状态 -->
      <n-spin :show="loading">
        <!-- 图表容器 -->
        <div ref="chartRef" style="width: 100%; height: 350px;"></div>
      </n-spin>

      <!-- 类型详情表格 -->
      <n-data-table
        :columns="columns"
        :data="genreStats"
        :pagination="pagination"
        :bordered="false"
        striped
      />
    </n-space>
  </n-card>
</template>

<script lang="ts" setup>
import {computed, onMounted, ref} from 'vue';
import {type DataTableColumns, NCard, NDataTable, NSpace, NSpin} from 'naive-ui';
import {visualizationApi} from '@/lib/api';
import type {EChartsOption} from 'echarts';
import * as echarts from 'echarts';

// 类型定义
interface GenreStat {
  genre: string;
  total_movies: string;
  avg_rating: string;
  total_revenue: string;
  avg_budget: string;
}

// 状态
const loading = ref(true);
const chartRef = ref<HTMLElement | null>(null);
const genreStats = ref<GenreStat[]>([]);
let chart: echarts.ECharts | null = null;

// 分页配置
const pagination = {
  pageSize: 10,
  showSizePicker: true,
  pageSizes: [10, 20, 50]
};

// 格式化数字
const formatNumber = (num: string | number) => {
  const n = typeof num === 'string' ? parseFloat(num) : num;
  if (n >= 1000000000) return `${(n / 1000000000).toFixed(2)}B`;
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return n.toFixed(0);
};

// 表格列定义
const columns = computed<DataTableColumns<GenreStat>>(() => [
  {
    title: '类型',
    key: 'genre',
    width: 120,
    sorter: 'default'
  },
  {
    title: '电影数量',
    key: 'total_movies',
    width: 100,
    sorter: (a, b) => parseInt(a.total_movies) - parseInt(b.total_movies)
  },
  {
    title: '平均评分',
    key: 'avg_rating',
    width: 100,
    sorter: (a, b) => parseFloat(a.avg_rating) - parseFloat(b.avg_rating),
    render(row) {
      return parseFloat(row.avg_rating).toFixed(1);
    }
  },
  {
    title: '总票房',
    key: 'total_revenue',
    width: 120,
    sorter: (a, b) => parseInt(a.total_revenue) - parseInt(b.total_revenue),
    render(row) {
      return formatNumber(row.total_revenue);
    }
  },
  {
    title: '平均预算',
    key: 'avg_budget',
    width: 120,
    sorter: (a, b) => parseFloat(a.avg_budget) - parseFloat(b.avg_budget),
    render(row) {
      return formatNumber(row.avg_budget);
    }
  }
]);

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return;

  chart = echarts.init(chartRef.value);
  updateChart();

  // 响应式调整
  window.addEventListener('resize', () => {
    chart?.resize();
  });
};

// 更新图表数据
const updateChart = () => {
  if (!chart) return;

  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params: any) => {
        const genre = params[0].name;
        const stat = genreStats.value.find(item => item.genre === genre);
        if (!stat) return '';

        return `${genre}<br/>
                电影数量: ${stat.total_movies}<br/>
                平均评分: ${parseFloat(stat.avg_rating).toFixed(1)}<br/>
                总票房: ${formatNumber(stat.total_revenue)}<br/>
                平均预算: ${formatNumber(stat.avg_budget)}`;
      }
    },
    legend: {
      data: ['电影数量', '平均评分', '总票房(百万)', '平均预算(百万)'],
      top: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: genreStats.value.map(item => item.genre),
      axisLabel: {
        interval: 0,
        rotate: 30
      }
    },
    yAxis: [
      {
        type: 'value',
        name: '数量/评分',
        position: 'left'
      },
      {
        type: 'value',
        name: '金额(百万)',
        position: 'right'
      }
    ],
    series: [
      {
        name: '电影数量',
        type: 'bar',
        data: genreStats.value.map(item => parseInt(item.total_movies))
      },
      {
        name: '平均评分',
        type: 'line',
        yAxisIndex: 0,
        data: genreStats.value.map(item => parseFloat(item.avg_rating))
      },
      {
        name: '总票房(百万)',
        type: 'bar',
        yAxisIndex: 1,
        data: genreStats.value.map(item => parseInt(item.total_revenue) / 1000000)
      },
      {
        name: '平均预算(百万)',
        type: 'bar',
        yAxisIndex: 1,
        data: genreStats.value.map(item => parseFloat(item.avg_budget) / 1000000)
      }
    ]
  };

  chart.setOption(option);
};

// 获取数据
const fetchData = async () => {
  try {
    loading.value = true;
    const apiResponse = await visualizationApi.getGenresWithStats();
    if (apiResponse && Array.isArray(apiResponse.data)) {
      genreStats.value = apiResponse.data;
      updateChart();
    } else {
      console.error('获取类型统计数据失败: API返回的data格式不正确或不存在', apiResponse);
      genreStats.value = [];
      updateChart();
    }
  } catch (error) {
    console.error('获取类型统计数据失败:', error);
    genreStats.value = [];
    updateChart();
  } finally {
    loading.value = false;
  }
};

// 生命周期钩子
onMounted(() => {
  initChart();
  fetchData();
});
</script>

<style scoped>
.genre-stats-card {
  margin-bottom: 1rem;
}
</style>
