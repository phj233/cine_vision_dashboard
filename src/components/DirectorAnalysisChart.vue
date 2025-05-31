<template>
  <div>
    <n-card title="顶级导演分析">
      <n-space vertical>
        <n-space>
          <n-select
            v-model:value="minMovies"
            :options="minMoviesOptions"
            placeholder="最少电影数"
            size="small"
            style="width: 120px"
          />
          <n-select
            v-model:value="sortBy"
            :options="sortOptions"
            placeholder="排序方式"
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
          <div v-if="loading" style="display: flex; justify-content: center; align-items: center; height: 300px;">
            <n-spin size="large" />
          </div>
          <div v-else-if="error" style="display: flex; justify-content: center; align-items: center; height: 300px;">
            <n-alert type="error" :title="error" />
          </div>
          <div v-else-if="!chartData || chartData.length === 0" style="display: flex; justify-content: center; align-items: center; height: 300px;">
            <n-empty description="暂无数据" />
          </div>
          <div v-else>
            <v-chart style="height: 400px; width: 100%;" :option="chartOption" :autoresize="true"></v-chart>

            <div style="margin-top: 2rem;">
              <n-collapse>
                <n-collapse-item
                  v-for="(director, index) in chartData"
                  :key="index"
                  :title="director?.director_name || '未知导演'"
                  :name="index"
                >
                  <n-space vertical>
                    <n-descriptions bordered size="small" :column="2">
                      <n-descriptions-item label="电影数量">
                        {{ director?.movie_count || 0 }}
                      </n-descriptions-item>
                      <n-descriptions-item label="平均评分">
                        <n-rate
                          readonly
                          size="small"
                          :value="parseFloat(String(director?.avg_rating || 0)) / 2"
                          allow-half
                        />
                        {{ director?.avg_rating || '0' }}
                      </n-descriptions-item>
                      <n-descriptions-item label="总票房">
                        {{ formatCurrency(director?.total_revenue || 0) }}
                      </n-descriptions-item>
                    </n-descriptions>

                    <n-divider title-placement="left">代表作品</n-divider>

                    <n-list hoverable clickable>
                      <n-list-item v-for="(movie, mIndex) in (director?.top_movies || [])" :key="mIndex">
                        <n-thing>
                          <template #header>
                            <n-space align="center">
                              {{ movie?.title || '未知电影' }}
                              <n-tag type="success" size="small">{{ movie?.release_date || '未知日期' }}</n-tag>
                            </n-space>
                          </template>
                          <template #description>
                            <n-space align="center">
                              <n-rate
                                readonly
                                size="small"
                                :value="parseFloat(String(movie?.vote_average || 0)) / 2"
                                allow-half
                              />
                              {{ movie?.vote_average || '0' }}
                            </n-space>
                          </template>
                        </n-thing>
                      </n-list-item>
                    </n-list>
                  </n-space>
                </n-collapse-item>
              </n-collapse>
            </div>
          </div>
        </div>
      </n-space>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, ref} from 'vue';
import {
  NAlert,
  NButton,
  NCard,
  NCollapse,
  NCollapseItem,
  NDescriptions,
  NDescriptionsItem,
  NDivider,
  NEmpty,
  NList,
  NListItem,
  NRate,
  NSelect,
  NSpace,
  NSpin,
  NTag,
  NThing
} from 'naive-ui';
import {use} from "echarts/core";
import {CanvasRenderer} from "echarts/renderers";
import {BarChart} from "echarts/charts";
import {
  DataZoomComponent,
  GridComponent,
  LegendComponent,
  TitleComponent,
  ToolboxComponent,
  TooltipComponent
} from "echarts/components";
import VChart from "vue-echarts";
import {useTheme} from '@/composables/useTheme';
import {visualizationApi} from '@/lib/api';

// 注册 ECharts 组件
use([
  CanvasRenderer,
  BarChart,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  TitleComponent,
  ToolboxComponent,
  DataZoomComponent
]);

// 获取主题
const { isDark } = useTheme();

// 加载状态和错误信息
const loading = ref(false);
const error = ref('');

// 筛选选项
const minMovies = ref(3);
const limitCount = ref(20);
const sortBy = ref('movie_count');

// 选项配置
const minMoviesOptions = [
  { label: '至少 2 部', value: 2 },
  { label: '至少 3 部', value: 3 },
  { label: '至少 5 部', value: 5 },
  { label: '至少 10 部', value: 10 }
];

const limitOptions = [
  { label: '显示 10 位', value: 10 },
  { label: '显示 20 位', value: 20 },
  { label: '显示 30 位', value: 30 }
];

const sortOptions = [
  { label: '按电影数量', value: 'movie_count' },
  { label: '按平均评分', value: 'avg_rating' },
  { label: '按总票房', value: 'total_revenue' }
];

// 图表数据
interface DirectorData {
  director_name?: string;
  movie_count?: number;
  avg_rating?: string;
  total_revenue?: number | string;
  top_movies?: {
    title?: string;
    release_date?: string;
    vote_average?: string;
  }[];
}

const chartData = ref<DirectorData[]>([]);

// 格式化货币数值
const formatCurrency = (value: string | number) => {
  if (!value) return '¥0';

  const number = typeof value === 'string' ? parseFloat(value) : value;

  if (number >= 1000000000) {
    return `¥${(number / 1000000000).toFixed(2)}B`;
  } else if (number >= 1000000) {
    return `¥${(number / 1000000).toFixed(2)}M`;
  } else if (number >= 1000) {
    return `¥${(number / 1000).toFixed(0)}K`;
  }

  return `¥${number}`;
};

// 获取图表指标数据
const getMetricValue = (item: DirectorData) => {
  if (!item) return 0;

  if (sortBy.value === 'avg_rating') {
    return parseFloat(item.avg_rating || '0');
  } else if (sortBy.value === 'total_revenue') {
    const revenue = typeof item.total_revenue === 'string'
      ? parseFloat(item.total_revenue || '0')
      : (item.total_revenue || 0);
    return revenue / 1000000; // 转换为百万
  } else {
    return item.movie_count || 0;
  }
};

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

  // 限制显示的数据量
  const displayData = chartData.value.slice(0, limitCount.value);

  // 提取导演姓名和排序指标
  const directorNames = displayData.map(item => item?.director_name || '未知导演');
  const metricValues = displayData.map(getMetricValue);

  // 生成指标名称
  let metricName = '电影数量';
  let formatter = '{value}';

  if (sortBy.value === 'avg_rating') {
    metricName = '平均评分';
    formatter = '{value} 分';
  } else if (sortBy.value === 'total_revenue') {
    metricName = '总票房 (百万)';
    formatter = '¥{value}M';
  }

  return {
    backgroundColor: 'transparent',
    title: {
      text: '顶级导演分析',
      subtext: `按${metricName}排序`,
      textStyle: {
        color: isDark.value ? '#eee' : '#333'
      },
      subtextStyle: {
        color: isDark.value ? '#999' : '#666'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      axisLabel: {
        formatter,
        color: isDark.value ? '#ddd' : '#666'
      },
      axisLine: {
        lineStyle: {
          color: isDark.value ? '#555' : '#ccc'
        }
      }
    },
    yAxis: {
      type: 'category',
      data: directorNames,
      axisLabel: {
        color: isDark.value ? '#ddd' : '#666'
      },
      axisLine: {
        lineStyle: {
          color: isDark.value ? '#555' : '#ccc'
        }
      }
    },
    series: [
      {
        name: metricName,
        type: 'bar',
        data: metricValues,
        label: {
          show: true,
          position: 'right',
          formatter: formatter === '{value}'
            ? '{c}'
            : formatter.replace('{value}', '{c}')
        },
        itemStyle: {
          color: function(params:  any) {
            // 自定义颜色渐变
            const colorList = [
              '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de',
              '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'
            ];
            return colorList[params.dataIndex % colorList.length];
          },
          borderRadius: [0, 4, 4, 0]
        }
      }
    ],
    toolbox: {
      feature: {
        saveAsImage: {}
      }
    },
    dataZoom: [
      {
        type: 'inside',
        orient: 'vertical',
        start: 0,
        end: 100
      }
    ]
  };
});

// 获取导演分析数据
const fetchData = async () => {
  loading.value = true;
  error.value = '';
  chartData.value = []; // 清空现有数据，避免显示旧数据

  try {
    const response = await visualizationApi.getTopDirectors(
      limitCount.value,
      minMovies.value,
      sortBy.value
    );

    if (response && response.data) {
      // 验证响应数据格式
      if (Array.isArray(response.data)) {
        chartData.value = response.data;
      } else {
        chartData.value = [];
        error.value = '返回数据格式不正确，期望数组';
      }
    } else {
      chartData.value = [];
      error.value = '返回数据格式不正确';
    }
  } catch (err: any) {
    console.error('获取导演分析数据失败:', err);
    chartData.value = [];
    error.value = err?.message || '获取数据失败，请稍后重试';
  } finally {
    loading.value = false;
  }
};

// 组件挂载时加载数据
onMounted(fetchData);
</script>
