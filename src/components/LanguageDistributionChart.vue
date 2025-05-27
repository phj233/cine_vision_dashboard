<template>
  <div class="chart-container">
    <n-card title="电影语言分布" class="chart-card">
      <n-space vertical>
        <n-space class="filter-container">
          <n-select
            v-model:value="minMovies"
            :options="minMoviesOptions"
            placeholder="最少电影数"
            size="small"
            style="width: 120px"
          />
          <n-select
            v-model:value="limitCount"
            :options="limitOptions"
            placeholder="显示数量"
            size="small"
            style="width: 120px"
          />
          <n-button size="small" type="primary" @click="fetchData">
            更新数据
          </n-button>
        </n-space>

        <div>
          <div v-if="loading" class="loading-container">
            <n-spin size="large" />
          </div>
          <div v-else-if="error" class="error-container">
            <n-alert type="error" :title="error" />
          </div>
          <div v-else-if="!chartData || chartData.length === 0" class="empty-container">
            <n-empty description="暂无数据" />
          </div>
          <div v-else class="chart-wrapper">
            <v-chart class="chart" :option="chartOption" autoresize />

            <div class="data-table-container">
              <n-data-table
                size="small"
                :columns="columns"
                :data="chartData"
                :pagination="pagination"
                :bordered="false"
                striped
              />
            </div>
          </div>
        </div>
      </n-space>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, ref} from 'vue';
import type {DataTableColumns} from 'naive-ui';
import {NAlert, NButton, NCard, NDataTable, NEmpty, NSelect, NSpace, NSpin} from 'naive-ui';
import {use} from "echarts/core";
import {CanvasRenderer} from "echarts/renderers";
import {PieChart} from "echarts/charts";
import {LegendComponent, TitleComponent, ToolboxComponent, TooltipComponent} from "echarts/components";
import VChart from "vue-echarts";
import {useTheme} from '@/composables/useTheme';
import {visualizationApi} from '@/lib/api';

// 注册 ECharts 组件
use([
  CanvasRenderer,
  PieChart,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  ToolboxComponent
]);

// 获取主题
const { isDark } = useTheme();

// 加载状态和错误信息
const loading = ref(false);
const error = ref('');

// 筛选选项
const minMovies = ref(5);
const limitCount = ref(20);

// 选项配置
const minMoviesOptions = [
  { label: '至少 5 部', value: 5 },
  { label: '至少 10 部', value: 10 },
  { label: '至少 20 部', value: 20 },
  { label: '至少 50 部', value: 50 }
];

const limitOptions = [
  { label: '显示 10 种', value: 10 },
  { label: '显示 20 种', value: 20 },
  { label: '显示 30 种', value: 30 }
];

// 图表数据
const chartData = ref<any[]>([]);

// 分页配置
const pagination = ref({
  page: 1,
  pageSize: 10,
  showSizePicker: true,
  pageSizes: [10, 20, 50]
});

// 数据表格列配置
const columns = computed<DataTableColumns>(() => [
  {
    title: '语言',
    key: 'original_language',
    width: 100
  },
  {
    title: '电影数量',
    key: 'movie_count',
    width: 100,
    sorter: 'default',
    sortOrder: 'descend'
  },
  {
    title: '平均评分',
    key: 'avg_rating',
    width: 100
  },
  {
    title: '占比',
    key: 'percentage',
    width: 100,
    render(row) {
      return `${row.percentage || '0'}%`;
    }
  },
  {
    title: '最早电影',
    key: 'earliest_film',
    width: 120
  },
  {
    title: '最新电影',
    key: 'latest_film',
    width: 120
  }
]);

// 图表配置
const chartOption = computed(() => {
  if (!chartData.value || chartData.value.length === 0) {
    return {
      title: {
        text: '暂无数据',
        textStyle: {
          color: isDark.value ? '#eee' : '#333',
        }
      }
    };
  }

  // 准备数据
  const pieData = chartData.value.map(item => ({
    name: getLanguageName(item.original_language || ''),
    value: Number(item.movie_count) || 0
  }));

  // 顶部十种语言，其他归为"其他"
  const topLanguages = pieData.slice(0, 10);

  if (pieData.length > 10) {
    const otherCount = pieData.slice(10).reduce(
      (sum, item) => sum + (Number(item.value) || 0),
      0
    );
    topLanguages.push({
      name: '其他',
      value: otherCount
    });
  }

  return {
    backgroundColor: 'transparent',
    title: {
      text: '电影语言分布',
      textStyle: {
        color: isDark.value ? '#eee' : '#333',
        fontWeight: 'normal'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      textStyle: {
        color: isDark.value ? '#ddd' : '#666'
      }
    },
    toolbox: {
      show: true,
      feature: {
        saveAsImage: { show: true, title: '保存图片' }
      }
    },
    series: [
      {
        name: '语言分布',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: isDark.value ? '#222' : '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: topLanguages
      }
    ],
    color: [
      '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de',
      '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc', '#1d953f'
    ]
  };
});

// 从ISO 639-1代码获取语言名称
const getLanguageName = (code: string) => {
  const languageMap: Record<string, string> = {
    'en': '英语',
    'es': '西班牙语',
    'fr': '法语',
    'de': '德语',
    'it': '意大利语',
    'ja': '日语',
    'ko': '韩语',
    'zh': '中文',
    'ru': '俄语',
    'pt': '葡萄牙语',
    'hi': '印地语',
    'nl': '荷兰语',
    'sv': '瑞典语',
    'pl': '波兰语',
    'da': '丹麦语',
    'no': '挪威语',
    'fi': '芬兰语',
    'tr': '土耳其语',
    'ar': '阿拉伯语',
    'th': '泰语',
    'cs': '捷克语',
    'hu': '匈牙利语',
    'el': '希腊语',
    'he': '希伯来语',
    'id': '印尼语',
    'fa': '波斯语',
    'vi': '越南语'
  };

  return languageMap[code] || code;
};

// 获取语言分布数据
const fetchData = async () => {
  loading.value = true;
  error.value = '';

  try {
    const response = await visualizationApi.getLanguageDistribution(minMovies.value, limitCount.value);

    if (response && response.data) {
      chartData.value = response.data || [];
    } else {
      chartData.value = [];
      error.value = '返回数据格式不正确';
    }
    pagination.value.page = 1;
  } catch (err: any) {
    console.error('获取语言分布数据失败:', err);
    chartData.value = [];
    error.value = err?.message || '获取数据失败，请稍后重试';
  } finally {
    loading.value = false;
  }
};

// 组件挂载时加载数据
onMounted(fetchData);
</script>

<style scoped>
.chart-container {
  margin-bottom: 1.5rem;
}

.chart-card {
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

.chart-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.filter-container {
  margin-bottom: 1rem;
}

.loading-container, .error-container, .empty-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
}

.chart-wrapper {
  display: flex;
  flex-direction: column;
}

.chart {
  height: 400px;
  width: 100%;
}

.data-table-container {
  margin-top: 1.5rem;
}
</style>
