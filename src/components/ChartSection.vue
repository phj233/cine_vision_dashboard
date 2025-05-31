<template>
  <n-grid :cols="2" :x-gap="12" :y-gap="12" responsive="screen">
    <!-- 电影评分分布 -->
    <n-gi :span="1">
      <n-card title="评分分布" size="small" hoverable :bordered="false">
        <div class="h-72">
          <v-chart class="w-full h-full" :option="ratingChartOption" :theme="currentChartTheme" :autoresize="true"></v-chart>
        </div>
      </n-card>
    </n-gi>

    <!-- 电影类型分布 -->
    <n-gi :span="1">
      <n-card title="电影类型分布" size="small" hoverable :bordered="false">
        <div class="h-72">
          <v-chart class="w-full h-full" :option="genreChartOption" :theme="currentChartTheme" :autoresize="true"></v-chart>
        </div>
      </n-card>
    </n-gi>
  </n-grid>
</template>

<script setup lang="ts">
import {computed, ref, watch} from 'vue';
import {NCard, NGi, NGrid} from 'naive-ui';
import {use} from 'echarts/core';
import {CanvasRenderer} from 'echarts/renderers';
import {BarChart, LineChart, PieChart} from 'echarts/charts';
import {DataZoomComponent, GridComponent, LegendComponent, TitleComponent, TooltipComponent,} from 'echarts/components';
import VChart from 'vue-echarts';
import {useTheme} from '@/composables/useTheme';
import {getChartTheme} from '@/lib/theme';

// 注册 ECharts 组件
use([
  CanvasRenderer,
  BarChart,
  LineChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent
]);

// 获取主题
const { isDark} = useTheme();
const currentChartTheme = ref(getChartTheme(isDark.value));

// 监听主题变化
watch(isDark, (newIsDark) => {
  currentChartTheme.value = getChartTheme(newIsDark);
});

// 定义Props
const props = defineProps<{
  movies: any[];
}>();

// 应用主题
const getEchartTheme = computed(() => {
  return getChartTheme(isDark.value);
});

// 评分分布图表数据
const ratingChartOption = computed(() => {
  // 统计评分分布
  const ratingGroups: Record<string, number> = {
    "9-10": 0,
    "8-9": 0,
    "7-8": 0,
    "6-7": 0,
    "5-6": 0,
    "<5": 0,
  };

  props.movies.forEach((movie) => {
    const rating = movie.vote_average;
    if (rating >= 9) {
      ratingGroups["9-10"]++;
    } else if (rating >= 8) {
      ratingGroups["8-9"]++;
    } else if (rating >= 7) {
      ratingGroups["7-8"]++;
    } else if (rating >= 6) {
      ratingGroups["6-7"]++;
    } else if (rating >= 5) {
      ratingGroups["5-6"]++;
    } else {
      ratingGroups["<5"]++;
    }
  });

  const data = Object.entries(ratingGroups).map(([name, value]) => ({
    name,
    value,
  }));

  // 根据主题设置对应的颜色
  const chartColors = isDark.value
    ? ['#F43F5E', '#FB7185', '#FDBA74', '#FCD34D', '#A3E635', '#4ADE80']
    : ['#DC2626', '#F87171', '#FB923C', '#FBBF24', '#84CC16', '#22C55E'];

  return {
    ...getEchartTheme.value,
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c} ({d}%)",
    },
    legend: {
      type: 'scroll',
      orient: "vertical",
      left: 0,
      top: 'center',
      data: Object.keys(ratingGroups),
    },
    series: [
      {
        name: "评分分布",
        type: "pie",
        radius: ['40%', '70%'],
        center: ["60%", "50%"],
        itemStyle: {
          borderRadius: 4,
          borderColor: isDark.value ? '#1e293b' : '#ffffff',
          borderWidth: 1
        },
        label: {
          formatter: "{b}: {d}%",
        },
        labelLine: {
          length: 10,
          length2: 10,
          smooth: true
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
        data: data,
      },
    ],
    color: chartColors
  };
});

// 类型分布图表数据
const genreChartOption = computed(() => {
  const genreCounts: Record<string, number> = {};

  props.movies.forEach((movie) => {
    if (!movie.genres) return;

    // 确保genres是数组或字符串
    const genres = Array.isArray(movie.genres)
      ? movie.genres
      : typeof movie.genres === 'string'
        ? movie.genres.split(", ")
        : [];

    genres.forEach((genre: string) => {
      if (!genre) return;
      genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    });
  });

  // 确保有数据，不然显示示例数据
  if (Object.keys(genreCounts).length === 0) {
    const defaultGenres = {
      'Drama': 1254,
      'Comedy': 854,
      'Action': 745,
      'Thriller': 612,
      'Romance': 436,
      'Adventure': 387,
      'Science Fiction': 294,
      'Horror': 253
    };
    Object.assign(genreCounts, defaultGenres);
  }

  const sortedGenres = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  // 根据主题设置对应的颜色
  const colorList = isDark.value
    ? ["#60A5FA", "#34D399", "#A78BFA", "#FBBF24", "#F87171", "#C084FC", "#2DD4BF", "#64748B"]
    : ["#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444", "#A855F7", "#14B8A6", "#475569"];

  return {
    ...getEchartTheme.value,
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: "value",
      boundaryGap: [0, 0.01],
    },
    yAxis: {
      type: "category",
      data: sortedGenres.map((item) => item[0]),
      axisLabel: {
        interval: 0,
        width: 80,
        overflow: 'break'
      },
    },
    series: [
      {
        name: "电影数量",
        type: "bar",
        data: sortedGenres.map((item) => item[1]),
        itemStyle: {
          color: function (params: any) {
            return colorList[params.dataIndex % colorList.length];
          },
        },
      },
    ],
  };
});
</script>

<style scoped>
.h-72 {
  height: 18rem;
}
.w-full {
  width: 100%;
}
.h-full {
  height: 100%;
}
</style>
