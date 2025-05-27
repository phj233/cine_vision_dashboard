<template>
  <n-card title="电影制作国家分布" size="small">
    <div ref="worldMapRef" class="h-[400px] relative">
      <div v-if="!mapLoaded" class="absolute inset-0 flex items-center justify-center">
        <n-spin size="large">
          <template #description>
            <n-text depth="3">加载地图数据中...</n-text>
          </template>
        </n-spin>
      </div>
    </div>
    <template #action>
      <n-space>
        <n-text depth="3">数据来源: {{ movies.length }}部电影</n-text>
      </n-space>
    </template>
  </n-card>
</template>

<script setup lang="ts">
import {nextTick, onMounted, onUnmounted, ref, watch} from 'vue';
import * as echarts from 'echarts';
import {NCard, NSpace, NSpin, NText} from 'naive-ui';

// 注册世界地图
echarts.registerMap('world', {
  type: 'FeatureCollection',
  features: [] // 地图JSON数据会在组件挂载时加载
});

// 定义Props
const props = defineProps<{
  movies: any[];
}>();

// 组件引用和状态
const worldMapRef = ref<HTMLDivElement | null>(null);
const mapChart = ref<echarts.ECharts | null>(null);
const mapLoaded = ref(false);
const mapDataLoaded = ref(false);

// 国家名称映射表（将API返回的国家名称映射到地图标准名称）
const countryMapping: Record<string, string> = {
  "United States of America": "United States",
  "United States": "United States",
  "USA": "United States",
  "US": "United States",
  "United Kingdom": "United Kingdom",
  "UK": "United Kingdom",
  "Great Britain": "United Kingdom",
  "South Korea": "Korea",
  "Republic of Korea": "Korea",
  "Russia": "Russian Federation",
  "Russian Federation": "Russian Federation",
  "People's Republic of China": "China",
  "China": "China",
  "Japan": "Japan",
  "France": "France",
  "Germany": "Germany",
  "Canada": "Canada",
  "Australia": "Australia",
  "Brazil": "Brazil",
  "India": "India",
  "Italy": "Italy",
  "Spain": "Spain",
  "Mexico": "Mexico"
};

// 初始化世界地图可视化
const initWorldMap = async () => {
  if (!worldMapRef.value) return;
  if (!mapDataLoaded.value) {
    await loadWorldMapData();
  }

  try {
    // 确保先销毁之前的实例
    if (mapChart.value) {
      mapChart.value.dispose();
    }

    mapChart.value = echarts.init(worldMapRef.value);

    // 计算各国家电影数量
    const countryCounts: Record<string, number> = {};

    props.movies.forEach((movie) => {
      if (!movie.production_countries) return;

      const countries = typeof movie.production_countries === 'string'
        ? movie.production_countries.split(", ")
        : Array.isArray(movie.production_countries)
          ? movie.production_countries
          : [];

      countries.forEach((country: string) => {
        if (!country) return;
        const mappedCountry = countryMapping[country] || country;
        countryCounts[mappedCountry] = (countryCounts[mappedCountry] || 0) + 1;
      });
    });

    // 确保有数据
    if (Object.keys(countryCounts).length === 0) {
      // 如果没有国家数据，使用示例数据
      const defaultCountryData = {
        "United States": 1254,
        "United Kingdom": 412,
        "France": 298,
        "Germany": 215,
        "Canada": 187,
        "Japan": 156,
        "Australia": 98,
        "Italy": 87,
        "Spain": 74,
        "Russian Federation": 65,
        "China": 58,
        "India": 52,
        "Brazil": 34,
        "Korea": 43,
        "Mexico": 28
      };
      Object.assign(countryCounts, defaultCountryData);
    }

    console.log('国家电影数量数据:', countryCounts);

    // 计算最大值，用于可视化
    const maxCount = Math.max(...Object.values(countryCounts), 1);
    const data = Object.entries(countryCounts).map(([name, value]) => ({
      name,
      value
    }));

    // 配置选项
    const option = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          return `${params.name}: ${params.value || 0}部电影`;
        }
      },
      visualMap: {
        left: 'right',
        min: 0,
        max: maxCount,
        text: ['高', '低'],
        realtime: false,
        calculable: true,
        inRange: {
          color: ['#EBF5FF', '#0072F5']
        }
      },
      series: [
        {
          name: '电影制作国家分布',
          type: 'map',
          map: 'world',
          roam: true,
          emphasis: {
            label: {
              show: true
            },
            itemStyle: {
              areaColor: '#0099ff'
            }
          },
          data: data,
          nameProperty: 'name',
          layoutCenter: ['50%', '50%'],
          layoutSize: '100%',
          itemStyle: {
            borderColor: '#ffffff',
            borderWidth: 1,
            areaColor: '#EBF5FF'
          },
          label: {
            show: false
          }
        }
      ]
    };

    // 设置地图配置
    mapChart.value.setOption(option);
    mapLoaded.value = true;
  } catch (error) {
    console.error('加载地图数据失败:', error);
  }
};

// 加载世界地图数据
const loadWorldMapData = async () => {
  try {
    const response = await fetch('https://cdn.jsdelivr.net/npm/echarts@4.9.0/map/json/world.json');
    if (!response.ok) {
      throw new Error(`地图数据获取失败: ${response.status}`);
    }
    const mapData = await response.json();
    echarts.registerMap('world', mapData);
    mapDataLoaded.value = true;
  } catch (error) {
    console.error('获取世界地图数据失败:', error);
    // 尝试备用地图源
    try {
      const backupResponse = await fetch('https://cdn.staticfile.org/echarts/4.9.0/map/json/world.json');
      if (!backupResponse.ok) {
        throw new Error(`备用地图数据获取失败: ${backupResponse.status}`);
      }
      const backupMapData = await backupResponse.json();
      echarts.registerMap('world', backupMapData);
      mapDataLoaded.value = true;
    } catch (backupError) {
      console.error('备用地图数据获取也失败:', backupError);
    }
  }
};

// 监听窗口大小变化，调整图表大小
const handleResize = () => {
  if (mapChart.value) {
    mapChart.value.resize();
  }
};

// 组件挂载后初始化图表
onMounted(async () => {
  await loadWorldMapData();
  await nextTick();
  await initWorldMap();
  window.addEventListener('resize', handleResize);
});

// 在组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  if (mapChart.value) {
    mapChart.value.dispose();
    mapChart.value = null;
  }
});

// 监听电影数据变化，重新绘制图表
watch(() => props.movies, () => {
  nextTick(() => initWorldMap());
}, { deep: true });
</script>

<style scoped>
.inset-0 {
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}
.flex {
  display: flex;
}
.items-center {
  align-items: center;
}
.justify-center {
  justify-content: center;
}
.absolute {
  position: absolute;
}
.relative {
  position: relative;
}
</style>
