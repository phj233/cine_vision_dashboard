<template>
  <n-card title="年度票房趋势" size="small" hoverable class="revenue-chart-card">
    <template #header-extra>
      <n-space align="center">
        <!-- 年份筛选 -->
        <n-popselect v-model:value="selectedYearRange" :options="yearRangeOptions" size="small">
          <n-button size="small" quaternary>
            {{ getSelectedRangeText() }}
            <template #icon>
              <n-icon size="small">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </n-icon>
            </template>
          </n-button>
        </n-popselect>

        <n-tooltip trigger="hover" placement="top">
          <template #trigger>
            <n-icon size="18" class="text-blue-500">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            </n-icon>
          </template>
          显示电影年度总票房和平均票房变化趋势
        </n-tooltip>
      </n-space>
    </template>
    <div class="h-120">
      <div v-if="hasNoData" class="w-full h-full flex flex-col items-center justify-center">
        <n-icon size="48" class="text-gray-300 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"></path><path d="M9 10h.01"></path><path d="M15 10h.01"></path><path d="M9.5 15a3.5 3.5 0 0 0 5 0"></path></svg>
        </n-icon>
        <p class="text-gray-500">所选时间段内没有票房数据</p>
        <n-button size="small" class="mt-4" @click="selectedYearRange = 'all'">
          显示全部数据
        </n-button>
      </div>
      <v-chart v-else class="w-full h-full" :option="revenueChartOption" autoresize />
    </div>
  </n-card>
</template>

<script setup lang="ts">
import {computed, ref, watch} from 'vue';
import {NButton, NCard, NIcon, NPopselect, NSpace, NTooltip} from 'naive-ui';
import {use} from 'echarts/core';
import {CanvasRenderer} from 'echarts/renderers';
import {LineChart} from 'echarts/charts';
import {
  DataZoomComponent,
  GridComponent,
  LegendComponent,
  MarkLineComponent,
  MarkPointComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components';
import VChart from 'vue-echarts';

// 注册 ECharts 组件
use([
  CanvasRenderer,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
  MarkLineComponent,
  MarkPointComponent
]);

// 定义Props
const props = defineProps<{
  movies: any[];
}>();

// 年份范围选项
const yearRangeOptions = [
  { label: '全部年份', value: 'all' },
  { label: '最近5年', value: 'last5' },
  { label: '最近10年', value: 'last10' },
  { label: '最近20年', value: 'last20' },
  { label: '2000年后', value: 'after2000' },
  { label: '1990年后', value: 'after1990' },
  { label: '1980年后', value: 'after1980' }
];

// 默认选择全部年份
const selectedYearRange = ref('all');

// 获取所选范围的文本描述
const getSelectedRangeText = () => {
  const option = yearRangeOptions.find(opt => opt.value === selectedYearRange.value);
  return option ? option.label : '全部年份';
};

// 获取当前年份
const currentYear = new Date().getFullYear();

// 监听筛选条件变化
watch(selectedYearRange, () => {
  // 当选择改变时，这里不需要做额外操作
  // computed属性会自动重新计算
  console.log('年份范围已更改为:', getSelectedRangeText());
});

// 根据选择过滤年份
const filterYearsByRange = (years: number[]) => {
  switch(selectedYearRange.value) {
    case 'last5':
      return years.filter(year => year >= currentYear - 5);
    case 'last10':
      return years.filter(year => year >= currentYear - 10);
    case 'last20':
      return years.filter(year => year >= currentYear - 20);
    case 'after2000':
      return years.filter(year => year >= 2000);
    case 'after1990':
      return years.filter(year => year >= 1990);
    case 'after1980':
      return years.filter(year => year >= 1980);
    case 'all':
    default:
      return years;
  }
};

// 年度票房趋势图表数据
const revenueChartOption = computed(() => {
  const yearlyRevenue: Record<number, number> = {};
  const yearlyCount: Record<number, number> = {};

  props.movies.forEach((movie) => {
    if (!movie.release_date) return;

    const year = new Date(movie.release_date).getFullYear();
    if (movie.revenue > 0) {
      yearlyRevenue[year] = (yearlyRevenue[year] || 0) + parseFloat(movie.revenue);
      yearlyCount[year] = (yearlyCount[year] || 0) + 1;
    }
  });

  // 获取所有年份并排序
  let years = Object.keys(yearlyRevenue)
    .map(Number)
    .sort((a, b) => a - b);

  // 根据筛选条件过滤年份
  const filteredYears = filterYearsByRange(years);

  // 如果筛选后没有数据，使用所有年份
  years = filteredYears.length > 0 ? filteredYears : years;

  // 根据数据量级确定合适的单位
  const filteredRevenues = years.map(year => yearlyRevenue[year]);
  const maxRevenue = Math.max(...filteredRevenues);

  // 确定是否使用百万或十亿作为单位
  const useBillion = maxRevenue > 10000000000; // 100亿以上使用十亿为单位
  const divisor = useBillion ? 1000000000 : 1000000;
  const unitLabel = useBillion ? '十亿' : '百万';

  const revenues = years.map((year) => {
    const value = yearlyRevenue[year] / divisor;
    return parseFloat(value.toFixed(2));
  });

  const avgRevenues = years.map((year) => {
    const value = yearlyRevenue[year] / yearlyCount[year] / 1000000; // 平均票房始终使用百万作为单位
    return parseFloat(value.toFixed(2));
  });

  // 确定合适的数据缩放范围
  // 当数据点较少时显示全部，数据点较多时显示后半部分
  const zoomStart = years.length <= 15 ? 0 : Math.max(0, 100 - (1500 / years.length));

  return {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      },
      formatter: function (params: any) {
        const year = params[0].axisValue;
        let totalRevenueStr;

        // 根据总票房金额选择合适的单位
        const totalRevenue = yearlyRevenue[year];
        if (totalRevenue >= 1000000000) {
          totalRevenueStr = `${(totalRevenue / 1000000000).toFixed(2)}十亿美元`;
        } else {
          totalRevenueStr = `${(totalRevenue / 1000000).toFixed(2)}百万美元`;
        }

        const avgRevenue = (yearlyRevenue[year] / yearlyCount[year] / 1000000).toFixed(2);
        const count = yearlyCount[year];

        return `<div class="chart-tooltip">
          <div class="tooltip-title">${year}年</div>
          <div class="tooltip-item"><span class="dot blue"></span>总票房: ${totalRevenueStr}</div>
          <div class="tooltip-item"><span class="dot red"></span>平均票房: ${avgRevenue}百万美元</div>
          <div class="tooltip-item"><span class="dot gray"></span>电影数量: ${count}部</div>
        </div>`;
      },
      extraCssText: 'box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15); border-radius: 6px; padding: 10px;'
    },
    legend: {
      data: ["总票房", "平均票房"],
      top: 10,
      textStyle: {
        color: '#606266'
      },
      itemStyle: {
        borderWidth: 0
      },
      icon: 'circle'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '14%',
      top: '14%',
      containLabel: true,
    },
    dataZoom: [
      {
        type: 'inside',
        start: zoomStart,
        end: 100,
        zoomLock: false,
        throttle: 100
      },
      {
        type: 'slider',
        start: zoomStart,
        end: 100,
        height: 20,
        bottom: 0,
        borderColor: 'transparent',
        backgroundColor: 'rgba(47, 69, 84, 0.1)',
        dataBackground: {
          lineStyle: {
            color: 'rgba(47, 69, 84, 0.3)'
          },
          areaStyle: {
            color: 'rgba(47, 69, 84, 0.3)'
          }
        },
        fillerColor: 'rgba(167, 183, 204, 0.2)',
        handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
        handleSize: '80%',
        handleStyle: {
          color: '#fff',
          shadowBlur: 3,
          shadowColor: 'rgba(0, 0, 0, 0.25)',
          shadowOffsetX: 1,
          shadowOffsetY: 1
        },
        emphasis: {
          handleStyle: {
            color: '#3498db'
          }
        }
      }
    ],
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: years,
      axisLabel: {
        interval: Math.ceil(years.length / 15), // 根据数据量调整显示间隔
        formatter: '{value}年',
        color: '#606266',
        fontSize: 12
      },
      axisLine: {
        lineStyle: {
          color: '#E4E7ED'
        }
      },
      axisTick: {
        show: false
      },
      splitLine: {
        show: false
      }
    },
    yAxis: [
      {
        type: "value",
        name: `总票房(${unitLabel}美元)`,
        nameTextStyle: {
          color: '#3498db',
          fontSize: 13,
          padding: [0, 0, 0, -30]
        },
        position: "left",
        axisLine: {
          show: true,
          lineStyle: {
            color: "#3498db"
          }
        },
        axisTick: {
          show: false
        },
        splitLine: {
          lineStyle: {
            type: 'dashed',
            color: '#E4E7ED'
          }
        },
        axisLabel: {
          formatter: `{value}`,
          color: '#3498db'
        }
      },
      {
        type: "value",
        name: "平均票房(百万美元)",
        nameTextStyle: {
          color: '#e74c3c',
          fontSize: 13,
          padding: [0, -30, 0, 0]
        },
        position: "right",
        axisLine: {
          show: true,
          lineStyle: {
            color: "#e74c3c"
          }
        },
        axisTick: {
          show: false
        },
        splitLine: {
          show: false
        },
        axisLabel: {
          formatter: `{value}`,
          color: '#e74c3c'
        }
      },
    ],
    series: [
      {
        name: "总票房",
        type: "line",
        data: revenues,
        smooth: true,
        symbol: 'emptyCircle',
        symbolSize: 6,
        lineStyle: {
          width: 3,
          color: "#3498db",
          shadowColor: 'rgba(52, 152, 219, 0.3)',
          shadowBlur: 10
        },
        itemStyle: {
          color: "#3498db",
          borderWidth: 2
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0, color: 'rgba(52, 152, 219, 0.3)'
            }, {
              offset: 1, color: 'rgba(52, 152, 219, 0.05)'
            }]
          }
        },
        markPoint: {
          data: [
            { type: 'max', name: '最高点' }
          ],
          symbol: 'pin',
          symbolSize: 40,
          label: {
            formatter: '{c}'
          }
        }
      },
      {
        name: "平均票房",
        type: "line",
        yAxisIndex: 1,
        data: avgRevenues,
        smooth: true,
        symbol: 'emptyCircle',
        symbolSize: 6,
        lineStyle: {
          width: 3,
          color: "#e74c3c",
          shadowColor: 'rgba(231, 76, 60, 0.3)',
          shadowBlur: 10
        },
        itemStyle: {
          color: "#e74c3c",
          borderWidth: 2
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0, color: 'rgba(231, 76, 60, 0.3)'
            }, {
              offset: 1, color: 'rgba(231, 76, 60, 0.05)'
            }]
          }
        },
        markPoint: {
          data: [
            { type: 'max', name: '最高点' }
          ],
          symbol: 'pin',
          symbolSize: 40,
          label: {
            formatter: '{c}'
          }
        }
      },
    ],
  };
});

// 判断是否有数据
const hasNoData = computed(() => {
  // 计算过滤后的年份数据
  const allYears = Object.keys(props.movies.reduce((acc, movie) => {
    if (movie.release_date && movie.revenue > 0) {
      const year = new Date(movie.release_date).getFullYear();
      acc[year] = true;
    }
    return acc;
  }, {} as Record<number, boolean>)).map(Number).sort((a, b) => a - b);

  // 应用过滤
  const filteredYears = filterYearsByRange(allYears);

  // 如果过滤后没有数据，则显示空状态
  return filteredYears.length === 0;
});
</script>

<style scoped>
.h-120 {
  height: 30rem;
}
.w-full {
  width: 100%;
}
.h-full {
  height: 100%;
}
.revenue-chart-card {
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
}
.revenue-chart-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}
.text-blue-500 {
  color: #3498db;
}
.text-gray-300 {
  color: #d4d4d4;
}
.text-gray-500 {
  color: #6b7280;
}
.mb-4 {
  margin-bottom: 1rem;
}
.mt-4 {
  margin-top: 1rem;
}
.flex {
  display: flex;
}
.flex-col {
  flex-direction: column;
}
.items-center {
  align-items: center;
}
.justify-center {
  justify-content: center;
}
</style>

<style>
/* 全局样式，用于tooltip自定义 */
.chart-tooltip {
  font-family: "Inter", "Helvetica Neue", "Helvetica", "PingFang SC", "Microsoft YaHei", sans-serif;
}
.tooltip-title {
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 8px;
  color: #303133;
}
.tooltip-item {
  display: flex;
  align-items: center;
  margin: 6px 0;
  font-size: 13px;
  color: #606266;
}
.dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 8px;
}
.dot.blue {
  background-color: #3498db;
}
.dot.red {
  background-color: #e74c3c;
}
.dot.gray {
  background-color: #909399;
}
</style>
