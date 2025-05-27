<template>
  <n-card class="mb-4" size="small" :bordered="false">
    <n-grid :cols="1" :item-responsive="true" :x-gap="8" :y-gap="8">
      <n-gi :span="1" :lg="1">
        <!-- 顶部统计卡片行 -->
        <n-grid :cols="3" :x-gap="8" :item-responsive="true">
    <!-- 总电影数量 -->
          <n-gi :span="1">
            <n-card :bordered="false" size="small" class="movie-count-card stat-card">
              <n-space vertical size="small">
                <n-space justify="space-between" align="center">
                  <span class="text-subtitle">总电影数量</span>
                  <n-icon size="20" :color="'#336cfb'" :depth="3">
                    <film-icon></film-icon>
                  </n-icon>
                </n-space>
                <span class="text-header">{{ stats.totalMovies }}</span>
                <div class="chart-container">
                  <v-chart class="w-full h-full" :option="movieCountChartOption" autoresize />
        </div>
              </n-space>
            </n-card>
          </n-gi>

    <!-- 平均评分 -->
          <n-gi :span="1">
            <n-card :bordered="false" size="small" class="rating-card stat-card">
              <n-space vertical size="small">
                <n-space justify="space-between" align="center">
                  <span class="text-subtitle">平均评分</span>
                  <n-icon size="20" color="#EFBD47" :depth="3">
                    <star-icon></star-icon>
                  </n-icon>
                </n-space>
                <span class="text-header">{{ parseFloat(stats.avgRating).toFixed(1) }}</span>
                <div class="chart-container">
                  <v-chart class="w-full h-full" :option="ratingGaugeOption" autoresize />
        </div>
              </n-space>
            </n-card>
          </n-gi>

          <!-- 最长电影 -->
          <n-gi :span="1">
            <n-card :bordered="false" size="small" class="runtime-card stat-card">
              <n-space vertical size="small">
                <n-space justify="space-between" align="center">
                  <span class="text-subtitle">最长电影</span>
                  <n-icon size="20" color="#8B5CF6" :depth="3">
                    <time-icon></time-icon>
                  </n-icon>
                </n-space>
                <span class="text-header">{{ formatRuntime(stats.longestMovie?.runtime) }}</span>
                <n-ellipsis :line-clamp="1" class="text-body">
                  {{ stats.longestMovie?.title }}
                </n-ellipsis>
              </n-space>
            </n-card>
          </n-gi>
        </n-grid>

        <!-- 详细电影信息行 -->
        <n-grid :cols="2" :x-gap="8" :y-gap="8" class="mt-4">
          <!-- 评分分布 -->
          <n-gi :span="1">
            <n-card :bordered="false" size="small" class="stat-card">
              <n-space vertical size="small">
      <div class="flex items-center justify-between">
                  <span class="font-medium">评分分布</span>
        </div>
                <div class="chart-container-rating">
                  <v-chart class="w-full h-full" :option="ratingDistributionOption" autoresize />
        </div>
              </n-space>
            </n-card>
          </n-gi>

          <!-- 电影信息 -->
          <n-gi :span="1">
            <n-card :bordered="false" hoverable size="small" class="stat-card">
              <n-space vertical size="small">
                <!-- 高评分电影 -->
                <n-space align="center" size="small">
                  <n-icon :color="'#18a058'" size="18">
                    <trophy-icon></trophy-icon>
                  </n-icon>
                  <span>
                    <n-text class="movie-item-title">{{ stats.highestRated?.title || '无数据' }}</n-text>
                    <span class="flex items-center text-xs space-x-2 mt-1">
                      <n-tag size="small" type="success" :bordered="false">
                        {{ stats.highestRated?.vote_average || '0' }}分
                      </n-tag>
                      <n-text depth="3" class="text-xs">{{ formatReleaseDate(stats.highestRated?.release_date) }}</n-text>
                    </span>
                  </span>
                </n-space>

                <!-- 最受欢迎电影 -->
                <n-space align="center" size="small" class="mt-2">
                  <n-icon :color="'#2080f0'" size="18">
                    <heart-icon></heart-icon>
                  </n-icon>
                  <span>
                    <n-text class="movie-item-title">{{ stats.mostPopular?.title || '无数据' }}</n-text>
                    <span class="flex items-center text-xs space-x-2 mt-1">
                      <n-tag size="small" type="info" :bordered="false">
                        {{ formatVoteCount(stats.mostPopular?.vote_count) }}人评价
                      </n-tag>
                      <n-text depth="3" class="text-xs">{{ formatReleaseDate(stats.mostPopular?.release_date) }}</n-text>
                    </span>
                  </span>
                </n-space>
              </n-space>
            </n-card>
          </n-gi>
        </n-grid>
      </n-gi>
    </n-grid>
  </n-card>
</template>

<script setup lang="ts">
import {computed} from 'vue';
import {use} from 'echarts/core';
import {CanvasRenderer} from 'echarts/renderers';
import {BarChart, GaugeChart, LineChart} from 'echarts/charts';
import {GridComponent, TitleComponent, TooltipComponent,} from 'echarts/components';
import VChart from 'vue-echarts';
import {
  FilmOutline as FilmIcon,
  HeartOutline as HeartIcon,
  StarOutline as StarIcon,
  TimeOutline as TimeIcon,
  TrophyOutline as TrophyIcon,
} from '@vicons/ionicons5';

// 注册 ECharts 组件
use([
  CanvasRenderer,
  BarChart,
  GaugeChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
]);

interface Movie {
  id: string;
  title: string;
  vote_average?: string;
  vote_count?: string;
  release_date?: string;
  runtime?: string;
}

interface Stats {
  totalMovies: number;
  avgRating: string;
  highestRated?: Movie;
  mostPopular?: Movie;
  longestMovie?: Movie;
}

const props = defineProps<{
  stats: Stats;
}>();

// 格式化评分人数
const formatVoteCount = (count?: string): string => {
  if (!count) return "0";
  const num = parseInt(count);
  return num > 999 ? (num / 1000).toFixed(1) + 'K' : num.toString();
};

// 格式化电影时长
const formatRuntime = (runtime?: string): string => {
  if (!runtime) return "0分钟";
  const minutes = parseInt(runtime);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h${mins}m` : `${mins}分钟`;
};

// 格式化发行日期
const formatReleaseDate = (date?: string): string => {
  if (!date) return "";
  const releaseDate = new Date(date);
  return releaseDate.getFullYear() + '年';
};

// 电影数量图表配置
const movieCountChartOption = computed(() => ({
  grid: {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  },
  xAxis: {
    type: 'category',
    data: Array.from({length: 12}, (_, i) => i+1),
    show: false
  },
  yAxis: {
    type: 'value',
    show: false
  },
  series: [
    {
      data: [650, 730, 800, 880, 920, 980, 1020, 1050, 1100, 1150, 1200, props.stats.totalMovies],
      type: 'line',
      smooth: true,
      symbol: 'none',
      lineStyle: {
        width: 2,
        color: '#336cfb'
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            {
              offset: 0,
              color: 'rgba(51, 108, 251, 0.3)'
            },
            {
              offset: 1,
              color: 'rgba(51, 108, 251, 0.05)'
            }
          ]
        }
      },
      animation: true,
      animationDuration: 1000,
      animationEasing: "elasticOut"
    }
  ],
  tooltip: {
    show: false
  }
}));

// 评分仪表盘配置
const ratingGaugeOption = computed(() => ({
  series: [
    {
      type: 'gauge',
      startAngle: 180,
      endAngle: 0,
      min: 0,
      max: 10,
      radius: '100%',
      center: ['50%', '75%'],
      progress: {
        show: true,
        width: 6,
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 1,
            y2: 0,
            colorStops: [
              {
                offset: 0,
                color: '#EFBD47'
              },
              {
                offset: 1,
                color: '#F8E71C'
              }
            ]
          }
        }
      },
      pointer: {
        show: false
      },
      axisLine: {
        lineStyle: {
          width: 6,
          color: [
            [1, '#e0e0e0']
          ]
        }
      },
      axisTick: {
        show: false
      },
      splitLine: {
        show: false
      },
      axisLabel: {
        show: false
      },
      detail: {
        show: false
      },
      data: [
        {
          value: parseFloat(props.stats.avgRating)
        }
      ],
      animation: true,
      animationDuration: 1000,
      animationEasing: "bounceOut"
    }
  ]
}));

// 评分分布图表配置
const ratingDistributionOption = computed(() => ({
  grid: {
    top: 5,
    right: 5,
    bottom: 5,
    left: 25
  },
  xAxis: {
    type: 'category',
    data: ['1-2', '2-3', '3-4', '4-5', '5-6', '6-7', '7-8', '8-9', '9-10'],
    axisLabel: {
      fontSize: 10,
      interval: 1
    }
  },
  yAxis: {
    type: 'value',
    axisLabel: {
      fontSize: 10,
      formatter: function (value: number) {
        if (value >= 1000) {
          return (value / 1000) + 'k';
        }
        return value;
      }
    }
  },
  series: [
    {
      data: [60, 180, 450, 680, 1200, 2500, 1800, 650, 80],
      type: 'bar',
      barWidth: '60%',
      itemStyle: {
        color: function(params: any) {
          const ratingColorMap = [
            '#ff4d4f',
            '#ff4d4f',
            '#faad14',
            '#faad14',
            '#faad14',
            '#52c41a',
            '#52c41a',
            '#1890ff',
            '#1890ff'
          ];
          return ratingColorMap[params.dataIndex];
        }
      },
      animation: true,
      animationDelay: function (idx: number) {
        return idx * 30;
      }
    }
  ],
  tooltip: {
    trigger: 'axis',
    formatter: '{b}分: {c}部电影'
  }
}));
</script>

<style scoped>
.stat-card {
  transition: all 0.2s;
}
.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
}
.chart-container {
  height: 40px;
  margin-top: 4px;
}
.chart-container-rating {
  height: 120px;
  width: 100%;
}
.movie-count-card {
  background-color: rgba(51, 108, 251, 0.08);
}
.rating-card {
  background-color: rgba(239, 189, 71, 0.08);
}
.runtime-card {
  background-color: rgba(139, 92, 246, 0.08);
}
.text-subtitle {
  font-size: 13px;
  color: rgba(0, 0, 0, 0.65);
}
.text-header {
  font-size: 20px;
  font-weight: 600;
}
.text-body {
  font-size: 13px;
  color: rgba(0, 0, 0, 0.45);
}
.movie-item-title {
  font-size: 14px;
  font-weight: 500;
  display: block;
}
.mt-2 {
  margin-top: 8px;
}
.mt-4 {
  margin-top: 12px;
}
.flex {
  display: flex;
}
.items-center {
  align-items: center;
}
.justify-between {
  justify-content: space-between;
}
.space-x-2 > * + * {
  margin-left: 8px;
}
.text-xs {
  font-size: 12px;
}
.font-medium {
  font-weight: 500;
}
</style>
