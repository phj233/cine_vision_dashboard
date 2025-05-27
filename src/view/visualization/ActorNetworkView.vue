<template>
  <div class="min-h-screen bg-gray-50">
    <main class="container mx-auto px-6 py-8">
      <h1 class="text-2xl font-bold mb-6">演员合作网络分析</h1>

      <!-- 搜索栏 -->
      <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div class="flex flex-wrap gap-4">
          <div class="flex-grow">
            <label class="block text-sm font-medium text-gray-700 mb-1">演员名称</label>
            <input
              v-model="actorName"
              placeholder="输入演员姓名，例如：Tom Hanks"
              class="w-full border border-gray-300 rounded-md p-2" />
          </div>

          <div class="w-32">
            <label class="block text-sm font-medium text-gray-700 mb-1">最小合作次数</label>
            <select
              v-model="minCollaborations"
              class="w-full border border-gray-300 rounded-md p-2">
              <option :value="2">2</option>
              <option :value="3">3</option>
              <option :value="1">1</option>
            </select>
          </div>

          <div class="w-32">
            <label class="block text-sm font-medium text-gray-700 mb-1">显示演员数量</label>
            <select
              v-model="limit"
              class="w-full border border-gray-300 rounded-md p-2">
              <option :value="20">20</option>
              <option :value="10">10</option>
              <option :value="30">30</option>
            </select>
          </div>

          <div class="flex items-end">
            <button
              @click="searchActor"
              class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              查找
            </button>
          </div>
        </div>
      </div>

      <!-- 加载中提示 -->
      <div v-if="loading" class="flex justify-center items-center h-80">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>

      <!-- 主要内容区域 -->
      <div v-else-if="actorData && actorData.actor" class="flex flex-col gap-6">
        <!-- 合作关系网络图 -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-semibold mb-4">{{ actorData.actor }}的合作关系网络</h2>

          <div v-if="actorData.collaborations && actorData.collaborations.length > 0" class="h-[500px]">
            <v-chart class="w-full h-full" :option="networkChartOption" autoresize />
          </div>
          <div v-else class="flex justify-center items-center h-80">
            <p class="text-gray-500">未找到合作关系数据</p>
          </div>
        </div>

        <!-- 电影列表 -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-semibold mb-4">{{ actorData.actor }}参演的电影</h2>

          <div v-if="actorData.movies && actorData.movies.length > 0">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div
                v-for="movie in actorData.movies"
                :key="movie.id"
                class="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div class="p-4">
                  <h3 class="font-bold text-lg mb-1">{{ movie.title }}</h3>
                  <p class="text-gray-500 text-sm mb-2">{{ movie.release_date }}</p>
                  <div class="flex flex-wrap gap-1 mt-2">
                    <div v-for="(actor, idx) in displayActors(movie.cast)" :key="idx"
                      class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                      {{ actor }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="flex justify-center items-center h-40">
            <p class="text-gray-500">未找到电影数据</p>
          </div>
        </div>

        <!-- 合作演员表格 -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-semibold mb-4">合作演员统计</h2>

          <div v-if="actorData.collaborations && actorData.collaborations.length > 0">
            <table class="w-full border-collapse">
              <thead>
                <tr class="bg-gray-100">
                  <th class="p-2 text-left">演员</th>
                  <th class="p-2 text-right">合作电影数</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(collab, index) in actorData.collaborations"
                  :key="index"
                  class="border-b hover:bg-gray-50">
                  <td class="p-2">{{ collab.co_actor }}</td>
                  <td class="p-2 text-right">{{ collab.collaboration_count }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="flex justify-center items-center h-40">
            <p class="text-gray-500">未找到合作数据</p>
          </div>
        </div>
      </div>

      <!-- 无数据提示 -->
      <div v-else-if="searched && !loading" class="flex justify-center items-center h-80 bg-white rounded-lg shadow-sm">
        <div class="text-center">
          <p class="text-gray-500 mb-4">未找到"{{ lastSearchedActor }}"的数据</p>
          <p class="text-gray-400 text-sm">请尝试搜索其他演员，例如：Tom Hanks, Brad Pitt, Leonardo DiCaprio</p>
        </div>
      </div>

      <!-- 初始提示 -->
      <div v-else class="flex justify-center items-center h-80 bg-white rounded-lg shadow-sm">
        <div class="text-center">
          <p class="text-gray-500 mb-4">请在上方输入演员姓名进行搜索</p>
          <p class="text-gray-400 text-sm">例如：Tom Hanks, Brad Pitt, Leonardo DiCaprio</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, ref} from 'vue';
import {visualizationApi} from '@/lib/api';
import {use} from 'echarts/core';
import {CanvasRenderer} from 'echarts/renderers';
import {GraphChart} from 'echarts/charts';
import {GridComponent, LegendComponent, TitleComponent, TooltipComponent,} from 'echarts/components';
import VChart from 'vue-echarts';

// 注册 ECharts 组件
use([
  CanvasRenderer,
  GraphChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
]);

// 状态变量
const loading = ref(false);
const actorName = ref('');
const minCollaborations = ref(2);
const limit = ref(20);
const actorData = ref<any>(null);
const searched = ref(false);
const lastSearchedActor = ref('');

// 从URL参数中获取演员名称（如果有）
onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const actor = urlParams.get('actor');
  if (actor) {
    actorName.value = actor;
    searchActor();
  }
});

// 搜索演员
const searchActor = async () => {
  if (!actorName.value.trim()) return;

  loading.value = true;
  searched.value = true;
  lastSearchedActor.value = actorName.value;

  try {
    const result = await visualizationApi.getActorCollaborations(
      actorName.value,
      minCollaborations.value,
      limit.value
    );
    actorData.value = result.data;

    // 更新URL参数，方便分享
    const url = new URL(window.location.href);
    url.searchParams.set('actor', actorName.value);
    window.history.pushState({}, '', url);
  } catch (error) {
    console.error('获取演员合作网络数据失败:', error);
    actorData.value = null;
  } finally {
    loading.value = false;
  }
};

// 处理显示的演员列表，限制数量
const displayActors = (castString: string) => {
  if (!castString) return [];
  const actors = castString.split(',').map(a => a.trim());
  // 最多显示5个演员
  return actors.slice(0, 5);
};

// 计算合作关系网络图配置
const networkChartOption = computed(() => {
  if (!actorData.value || !actorData.value.collaborations) {
    return {};
  }

  const { actor, collaborations } = actorData.value;

  // 准备节点数据
  const nodes = [
    {
      id: actor,
      name: actor,
      symbolSize: 50,
      itemStyle: {
        color: '#f78fb3',
      },
      label: {
        show: true
      }
    }
  ];

  collaborations.forEach((collab: any) => {
    const size = Math.max(20, Math.min(40, collab.collaboration_count * 10));
    nodes.push({
      id: collab.co_actor,
      name: collab.co_actor,
      symbolSize: size,
      itemStyle: {
        color: '#18dcff',
      },
      label: {
        show: collab.collaboration_count > Math.max(2, minCollaborations.value)
      }
    });
  });

  // 准备边数据
  const links = collaborations.map((collab: any) => ({
    source: actor,
    target: collab.co_actor,
    lineStyle: {
      width: Math.log(collab.collaboration_count) * 2 + 1,
      color: '#808e9b'
    },
    label: {
      show: collab.collaboration_count > 3,
      formatter: `${collab.collaboration_count}部`
    }
  }));

  return {
    title: {
      text: `${actor}的合作关系网络`,
      left: 'center'
    },
    tooltip: {
      formatter: function(params: any) {
        if (params.dataType === 'node') {
          return params.data.name;
        }
        return `${params.data.source} 与 ${params.data.target} 合作 ${
          collaborations.find((c: any) => c.co_actor === params.data.target).collaboration_count
        } 部电影`;
      }
    },
    animationDuration: 1500,
    animationEasingUpdate: 'quinticInOut',
    series: [
      {
        name: '演员合作关系',
        type: 'graph',
        layout: 'force',
        data: nodes,
        links: links,
        roam: true,
        label: {
          position: 'right'
        },
        lineStyle: {
          color: 'source',
          curveness: 0.3
        },
        emphasis: {
          focus: 'adjacency',
          lineStyle: {
            width: 10
          }
        },
        force: {
          repulsion: 100,
          gravity: 0.1,
          edgeLength: 100
        }
      }
    ]
  };
});
</script>

<style scoped>
/* 如果需要可以添加更多样式 */
</style>
