<template>
  <div>
    <n-card title="预算与票房关系分析">
      <n-space vertical>
        <n-space>
          <n-date-picker
              v-model:value="yearRange"
              type="daterange"
              clearable
              size="small"
              :is-date-disabled="disableFutureDate"
              :actions="['clear', 'confirm']"
              style="width: 240px"
          />
          <n-select
              v-model:value="minVotes"
              :options="votesOptions"
              placeholder="最少评分数"
              size="small"
              style="width: 120px"
          />
          <n-select
              v-model:value="bucketSize"
              :options="bucketOptions"
              placeholder="预算区间"
              size="small"
              style="width: 120px"
          />
          <n-button size="small" type="primary" @click="fetchData">
            更新数据
          </n-button>
        </n-space>

        <div>
          <div v-if="loading" style="display: flex; justify-content: center; align-items: center; height: 300px;">
            <n-spin size="large"/>
          </div>
          <div v-else-if="error" style="display: flex; justify-content: center; align-items: center; height: 300px;">
            <n-alert type="error" :title="error"/>
          </div>
          <div v-else-if="!chartData.buckets || chartData.buckets.length === 0"
               style="display: flex; justify-content: center; align-items: center; height: 300px;">
            <n-empty description="暂无数据"/>
          </div>
          <div v-else>
            <v-chart style="height: 450px; width: 100%;" :option="chartOption" :autoresize="true"></v-chart>

            <n-divider>总体统计</n-divider>

            <n-grid :cols="4" :x-gap="12">
              <n-gi>
                <n-statistic
                    label="平均投资回报率"
                    :value="parseFloat(String(chartData.overall?.avg_roi || 0))"
                    :precision="2"
                >
                  <template #suffix>
                    <span>倍</span>
                  </template>
                </n-statistic>
              </n-gi>
              <n-gi>
                <n-statistic
                    label="平均预算"
                    :value="formatCurrency(chartData.overall?.avg_budget)"
                />
              </n-gi>
              <n-gi>
                <n-statistic
                    label="平均票房"
                    :value="formatCurrency(chartData.overall?.avg_revenue)"
                />
              </n-gi>
              <n-gi>
                <n-statistic
                    label="样本电影数量"
                    :value="chartData.overall?.total_movies || 0"
                />
              </n-gi>
            </n-grid>

            <n-divider>详细数据</n-divider>

            <n-data-table
                size="small"
                :columns="columns"
                :data="chartData.buckets"
                :pagination="pagination"
                :bordered="false"
                striped
            />
          </div>
        </div>
      </n-space>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import {computed, h, onMounted, ref} from 'vue';
import {
  DataTableColumns,
  NAlert,
  NButton,
  NCard,
  NDataTable,
  NDatePicker,
  NDivider,
  NEmpty,
  NGi,
  NGrid,
  NSelect,
  NSpace,
  NSpin,
  NStatistic
} from 'naive-ui';
import {use} from "echarts/core";
import {CanvasRenderer} from "echarts/renderers";
import {LineChart, ScatterChart} from "echarts/charts";
import {
  DataZoomComponent,
  GridComponent,
  LegendComponent,
  MarkLineComponent,
  MarkPointComponent,
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
  ScatterChart,
  LineChart,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  TitleComponent,
  ToolboxComponent,
  DataZoomComponent,
  MarkLineComponent,
  MarkPointComponent
]);

// 获取主题
const {isDark} = useTheme();

// 加载状态和错误信息
const loading = ref(false);
const error = ref('');

// 图表数据
const chartData = ref<{
  buckets: any[];
  overall: any;
}>({
  buckets: [],
  overall: null
});

// 筛选选项
const currentYear = new Date().getFullYear();
// 使用时间戳数组而非Date对象数组，兼容NDatePicker的daterange类型
const yearRange = ref<[number, number] | null>([
  new Date(1990, 0, 1).getTime(),
  new Date(currentYear, 11, 31).getTime()
]);
const minVotes = ref(10);
const bucketSize = ref(10000000);

// 选项配置
const votesOptions = [
  {label: '最少 10 票', value: 10},
  {label: '最少 50 票', value: 50},
  {label: '最少 100 票', value: 100},
  {label: '最少 200 票', value: 200}
];

const bucketOptions = [
  {label: '1百万', value: 1000000},
  {label: '5百万', value: 5000000},
  {label: '1千万', value: 10000000},
  {label: '2千万', value: 20000000}
];

// 禁用未来日期
const disableFutureDate = (ts: number) => {
  return ts > Date.now();
};

// 分页配置
const pagination = ref({
  page: 1,
  pageSize: 10,
  showSizePicker: true,
  pageSizes: [10, 20, 50]
});

// 格式化货币数值
const formatCurrency = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined) return '¥0';
  const number = typeof value === 'string' ? parseFloat(value) : value;
  if (number >= 1000000000) {
    return `¥${(number / 1000000000).toFixed(2)}B`;
  } else if (number >= 1000000) {
    return `¥${(number / 1000000).toFixed(1)}M`;
  } else if (number >= 1000) {
    return `¥${(number / 1000).toFixed(0)}K`;
  }

  return `¥${number}`;
};

// 数据表格列配置
const columns = computed(() => {
  const tableColumns: DataTableColumns = [
    {
      title: '预算区间',
      key: 'budget_range',
      width: 180,
      render(row) {
        const budget = Number(row?.budget_bucket || 0);
        return `${formatCurrency(budget)} - ${formatCurrency(budget + bucketSize.value)}`;
      }
    },
    {
      title: '电影数量',
      key: 'movie_count',
      width: 100,
      render(row) {
        const movie_count = row?.movie_count ?? 'N/A';
        return `${movie_count}`
      }
    },
    {
      title: '平均票房',
      key: 'avg_revenue',
      width: 130,
      render(row) {
        const avg_revenue = Number(row?.avg_revenue || 0);
        return `${avg_revenue}`
      }
    },
    {
      title: '平均回报率',
      key: 'avg_roi',
      width: 120,
      render(row) {
        const roi = parseFloat(String(row?.avg_roi || '0'));
        return h('span', {}, `${roi.toFixed(2)}倍`);
      }
    }
  ];
  return tableColumns;
});

// 图表配置
const chartOption = computed(() => {
  if (!chartData.value || !chartData.value.buckets || chartData.value.buckets.length === 0) {
    return {
      title: {
        text: '暂无数据',
        textStyle: {
          color: isDark.value ? '#eee' : '#333',
        }
      }
    };
  }

  // 提取散点图数据
  const scatterData = chartData.value.buckets.map(bucket => {
    const budgetBucket = parseFloat(bucket?.budget_bucket || '0');
    const budgetBucketEnd = parseFloat(bucket?.budget_bucket_end || '0');
    const avgRevenue = parseFloat(bucket?.avg_revenue || '0');
    const movieCount = bucket?.movie_count || 0;

    const budgetMidpoint = (budgetBucket + budgetBucketEnd) / 2;
    return [
      budgetMidpoint / 1000000, // 转为百万
      avgRevenue / 1000000, // 转为百万
      movieCount // 气泡大小
    ];
  });

  // 计算整体平均ROI值
  const avgRoi = chartData.value.overall ? parseFloat(chartData.value.overall.avg_roi || '1') : 1;

  // 生成参考线数据
  const xMin = scatterData.length > 0 ? Math.min(...scatterData.map(item => item[0])) * 0.8 : 0;
  const xMax = scatterData.length > 0 ? Math.max(...scatterData.map(item => item[0])) * 1.2 : 100;

  // 投资回报率参考线数据
  const baseFunctionData = [];
  for (let x = xMin; x <= xMax; x += (xMax - xMin) / 20) {
    baseFunctionData.push([x, x]);
  }

  // 生成各种ROI参考线
  const generateRoiLine = (roi: number) => {
    const data = [];
    for (let x = xMin; x <= xMax; x += (xMax - xMin) / 20) {
      data.push([x, x * roi]);
    }
    return data;
  };

  const roiLine1 = generateRoiLine(2);
  const roiLine2 = generateRoiLine(5);
  const roiLine3 = generateRoiLine(10);
  // 添加平均ROI参考线
  const avgRoiLine = generateRoiLine(avgRoi);

  return {
    backgroundColor: 'transparent',
    title: {
      text: '预算与票房关系分析',
      subtext: getYearRangeText(),
      textStyle: {
        color: isDark.value ? '#eee' : '#333'
      },
      subtextStyle: {
        color: isDark.value ? '#999' : '#666'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: function (params: any) {
        if (params.seriesIndex === 0) {
          return `预算: ${formatCurrency(params.value[0] * 1000000)}<br />` +
              `平均票房: ${formatCurrency(params.value[1] * 1000000)}<br />` +
              `电影数量: ${params.value[2]}`;
        } else {
          let roiValue;
          switch (params.seriesIndex) {
            case 1:
              roiValue = "收支平衡";
              break;
            case 2:
              roiValue = "2倍回报";
              break;
            case 3:
              roiValue = "5倍回报";
              break;
            case 4:
              roiValue = "10倍回报";
              break;
            default:
              roiValue = "";
          }
          return roiValue;
        }
      }
    },
    legend: {
      right: '10%',
      top: '5%',
      data: ['电影分布', '收支平衡线', '2倍回报线', '5倍回报线', '10倍回报线', `平均回报线(${avgRoi.toFixed(2)}倍)`],
      textStyle: {
        color: isDark.value ? '#ddd' : '#666'
      }
    },
    grid: {
      left: '5%',
      right: '5%',
      bottom: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: '预算 (百万)',
      nameLocation: 'middle',
      nameGap: 30,
      nameTextStyle: {
        color: isDark.value ? '#ddd' : '#666'
      },
      axisLabel: {
        formatter: '{value}M',
        color: isDark.value ? '#ddd' : '#666'
      },
      axisLine: {
        lineStyle: {
          color: isDark.value ? '#555' : '#ccc'
        }
      },
      splitLine: {
        lineStyle: {
          color: isDark.value ? '#333' : '#eee'
        }
      }
    },
    yAxis: {
      type: 'value',
      name: '平均票房 (百万)',
      nameLocation: 'middle',
      nameGap: 40,
      nameTextStyle: {
        color: isDark.value ? '#ddd' : '#666'
      },
      axisLabel: {
        formatter: '{value}M',
        color: isDark.value ? '#ddd' : '#666'
      },
      axisLine: {
        lineStyle: {
          color: isDark.value ? '#555' : '#ccc'
        }
      },
      splitLine: {
        lineStyle: {
          color: isDark.value ? '#333' : '#eee'
        }
      }
    },
    series: [
      {
        name: '电影分布',
        type: 'scatter',
        symbolSize: function (data: any) {
          return Math.sqrt(data[2]) * 3;
        },
        emphasis: {
          focus: 'series',
          label: {
            show: true,
            formatter: function (param: any) {
              return `ROI: ${(param.data[1] / param.data[0]).toFixed(2)}倍`;
            },
            position: 'top'
          }
        },
        itemStyle: {
          color: function (params: any) {
            // 根据回报率计算颜色
            const roi = params.data[1] / params.data[0];
            if (roi < 1) return '#ee6666'; // 亏损
            if (roi < 2) return '#fac858'; // 低回报
            if (roi < 5) return '#91cc75'; // 中回报
            return '#5470c6'; // 高回报
          },
          opacity: 0.8
        },
        data: scatterData
      },
      {
        name: '收支平衡线',
        type: 'line',
        symbol: 'none',
        smooth: true,
        lineStyle: {
          color: '#999',
          type: 'dashed'
        },
        data: baseFunctionData
      },
      {
        name: '2倍回报线',
        type: 'line',
        symbol: 'none',
        smooth: true,
        lineStyle: {
          color: '#fac858',
          type: 'dashed'
        },
        data: roiLine1
      },
      {
        name: '5倍回报线',
        type: 'line',
        symbol: 'none',
        smooth: true,
        lineStyle: {
          color: '#91cc75',
          type: 'dashed'
        },
        data: roiLine2
      },
      {
        name: '10倍回报线',
        type: 'line',
        symbol: 'none',
        smooth: true,
        lineStyle: {
          color: '#5470c6',
          type: 'dashed'
        },
        data: roiLine3
      },
      {
        name: `平均回报线(${avgRoi.toFixed(2)}倍)`,
        type: 'line',
        symbol: 'none',
        smooth: true,
        lineStyle: {
          color: '#67c23a',
          type: 'dotted',
          width: 2
        },
        data: avgRoiLine
      }
    ],
    toolbox: {
      feature: {
        dataZoom: {},
        saveAsImage: {}
      }
    },
    dataZoom: [
      {
        type: 'inside',
        xAxisIndex: 0,
        start: 0,
        end: 100
      },
      {
        type: 'inside',
        yAxisIndex: 0,
        start: 0,
        end: 100
      }
    ]
  };
});

// 获取年份范围文本
const getYearRangeText = (): string => {
  if (!yearRange.value || !Array.isArray(yearRange.value)) {
    return `1990-${currentYear}`;
  }

  const startYear = getYearFromValue(yearRange.value[0]);
  const endYear = getYearFromValue(yearRange.value[1]);

  return `${startYear}-${endYear}`;
};

// 从值中获取年份的辅助函数
const getYearFromValue = (value: any): number => {
  if (!value) return currentYear;

  // 如果是时间戳数字（NDatePicker返回的类型）
  if (typeof value === 'number') {
    return new Date(value).getFullYear();
  }

  // 如果是Date对象
  if (value instanceof Date && typeof value.getFullYear === 'function') {
    return value.getFullYear();
  }

  // 如果是字符串日期
  if (typeof value === 'string') {
    try {
      return new Date(value).getFullYear();
    } catch (e) {
      return currentYear;
    }
  }

  // 默认返回当前年份
  return currentYear;
};

// 获取预算与票房关系数据
const fetchData = async () => {
  loading.value = true;
  error.value = '';
  chartData.value = {buckets: [], overall: null}; // 清空现有数据

  // 处理yearRange可能为null的情况（用户清除了日期选择）
  let startYear = 1990;
  let endYear = currentYear;

  if (yearRange.value && Array.isArray(yearRange.value)) {
    startYear = getYearFromValue(yearRange.value[0]);
    endYear = getYearFromValue(yearRange.value[1]);
  }

  try {
    const response = await visualizationApi.getBudgetRevenueAnalysis(
        startYear,
        endYear,
        minVotes.value,
        bucketSize.value
    );

    if (response && response.data) {
      // 验证数据格式
      if (response.data.buckets && Array.isArray(response.data.buckets)) {
        chartData.value = {
          buckets: response.data.buckets || [],
          overall: response.data.overall || null
        };
      } else {
        chartData.value = {buckets: [], overall: null};
        error.value = '返回数据格式不正确，缺少buckets数组';
      }
    } else {
      chartData.value = {buckets: [], overall: null};
      error.value = '返回数据格式不正确';
    }
    pagination.value.page = 1;
  } catch (err: any) {
    console.error('获取预算与票房关系数据失败:', err);
    chartData.value = {buckets: [], overall: null};
    error.value = err?.message || '获取数据失败，请稍后重试';
  } finally {
    loading.value = false;
  }
};

// 组件挂载时加载数据
onMounted(fetchData);
</script>
