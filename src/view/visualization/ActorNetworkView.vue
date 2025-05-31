<template>
  <n-card>
    <main class="container mx-auto px-6 py-8">
      <h1 class="text-2xl font-bold mb-6">演员合作网络分析</h1>

      <!-- 搜索栏 -->
      <n-card style="margin-bottom: 1.5rem;" embedded>
        <n-form>
          <n-grid :cols="24" :x-gap="12" :y-gap="12">
            <n-gi :span="12">
              <n-form-item label="演员名称">
                <n-input
                  v-model:value="actorName"
                  placeholder="输入演员姓名，例如：Tom Hanks"
                />
              </n-form-item>
            </n-gi>

            <n-gi :span="4">
              <n-form-item label="最小合作次数">
                <n-select
                  v-model:value="minCollaborations"
                  :options="[
                    { label: '2', value: 2 },
                    { label: '3', value: 3 },
                    { label: '1', value: 1 }
                  ]"
                />
              </n-form-item>
            </n-gi>

            <n-gi :span="4">
              <n-form-item label="显示演员数量">
                <n-select
                  v-model:value="limit"
                  :options="[
                    { label: '20', value: 20 },
                    { label: '10', value: 10 },
                    { label: '30', value: 30 }
                  ]"
                />
              </n-form-item>
            </n-gi>

            <n-gi :span="4" style="display: flex; align-items: flex-end;">
              <n-form-item>
                <n-button
                  @click="searchActor"
                  type="primary"
                  style="width: 100%;">
                  查找
                </n-button>
              </n-form-item>
            </n-gi>
          </n-grid>
        </n-form>
      </n-card>

      <!-- 加载中提示 -->
      <div v-if="loading" style="display: flex; justify-content: center; align-items: center; height: 300px;">
        <n-spin size="large" />
      </div>

      <!-- 主要内容区域 -->
      <div v-else-if="actorData && actorData.actor" style="display: flex; flex-direction: column; gap: 1.5rem;">
        <!-- 合作关系网络图 -->
        <n-card>
          <template #header>
            <div style="font-size: 1.25rem; font-weight: 600;">{{ actorData.actor }}的合作关系网络</div>
          </template>

          <div v-if="actorData.collaborations && actorData.collaborations.length > 0" style="height: 500px;">
            <v-chart style="width: 100%; height: 100%;" :option="networkChartOption" :autoresize="true"></v-chart>
          </div>
          <n-empty
            v-else
            description="未找到合作关系数据"
            style="height: 300px; display: flex; flex-direction: column; justify-content: center;" />
        </n-card>

        <!-- 电影列表 -->
        <n-card>
          <template #header>
            <div style="font-size: 1.25rem; font-weight: 600;">{{ actorData.actor }}参演的电影</div>
          </template>

          <div v-if="actorData.movies && actorData.movies.length > 0">
            <n-grid :cols="3" :x-gap="12" :y-gap="12" responsive="screen">
              <n-gi v-for="movie in actorData.movies" :key="movie.id">
                <n-card embedded>
                  <template #header>
                    <div style="font-weight: bold;">{{ movie.title }}</div>
                  </template>
                  <template #header-extra>{{ movie.release_date }}</template>
                  <n-space>
                    <n-tag
                      v-for="(actor, idx) in displayActors(movie.cast)"
                      :key="idx"
                      type="info"
                      size="small"
                    >
                      {{ actor }}
                    </n-tag>
                  </n-space>
                </n-card>
              </n-gi>
            </n-grid>
          </div>
          <n-empty
            v-else
            description="未找到电影数据"
            style="height: 200px; display: flex; flex-direction: column; justify-content: center;" />
        </n-card>

        <!-- 合作演员表格 -->
        <n-card>
          <template #header>
            <div style="font-size: 1.25rem; font-weight: 600;">合作演员统计</div>
          </template>

          <div v-if="actorData.collaborations && actorData.collaborations.length > 0">
            <n-data-table
              :columns="[
                { title: '演员', key: 'co_actor' },
                { title: '合作电影数', key: 'collaboration_count', align: 'right' }
              ]"
              :data="actorData.collaborations"
              :bordered="false"
              :pagination="{ pageSize: 10 }"
              striped
            />
          </div>
          <n-empty
            v-else
            description="未找到合作数据"
            style="height: 200px; display: flex; flex-direction: column; justify-content: center;" />
        </n-card>
      </div>

      <!-- 无数据提示 -->
      <n-card v-else-if="searched && !loading">
        <div style="height: 300px; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
          <n-empty
            description="未找到数据"
            style="margin-bottom: 1rem;">
            <template #extra>
              <div>未找到"{{ lastSearchedActor }}"的数据</div>
              <div style="font-size: 0.875rem; color: #9e9e9e; margin-top: 0.5rem;">请尝试搜索其他演员，例如：Tom Hanks, Brad Pitt, Leonardo DiCaprio</div>
            </template>
          </n-empty>
        </div>
      </n-card>

      <!-- 初始提示 -->
      <n-card v-else>
        <div style="height: 300px; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
          <n-empty description="请在上方输入演员姓名进行搜索">
            <template #extra>
              <div style="font-size: 0.875rem; color: #9e9e9e; margin-top: 0.5rem;">例如：Tom Hanks, Brad Pitt, Leonardo DiCaprio</div>
            </template>
          </n-empty>
        </div>
      </n-card>
    </main>
  </n-card>
</template>

<script setup lang="ts">
import {computed, onMounted, ref} from 'vue';
import {visualizationApi} from '@/lib/api';
import * as echarts from 'echarts/core';
import {use} from 'echarts/core';
import {CanvasRenderer} from 'echarts/renderers';
import {GraphChart} from 'echarts/charts';
import {GridComponent, LegendComponent, TitleComponent, TooltipComponent,} from 'echarts/components';
import VChart from 'vue-echarts';
import type {ECBasicOption} from 'echarts/types/dist/shared';
import {
  NButton,
  NCard,
  NDataTable,
  NEmpty,
  NForm,
  NFormItem,
  NGi,
  NGrid,
  NInput,
  NSelect,
  NSpace,
  NSpin,
  NTag
} from 'naive-ui';

// 定义API返回的数据结构
interface Movie {
  id: string;
  title: string;
  release_date: string;
  cast: string[];
}

interface Collaboration {
  co_actor: string;
  collaboration_count: number;
}

interface ActorNetworkData {
  actor: string;
  collaborations: Collaboration[];
  movies: Movie[];
}

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
const actorData = ref<ActorNetworkData | null>(null);
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
    const result = await visualizationApi.getActorNetwork(
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
const displayActors = (castString: string | string[]) => {
  if (!castString) return [];

  let actors: string[] = [];
  if (typeof castString === 'string') {
    actors = castString.split(',').map(a => a.trim());
  } else if (Array.isArray(castString)) {
    actors = castString;
  }

  // 最多显示5个演员
  return actors.slice(0, 5);
};

// 计算合作关系网络图配置
const networkChartOption = computed<ECBasicOption>(() => {
  if (!actorData.value || !actorData.value.collaborations || actorData.value.collaborations.length === 0) {
    return {
      title: {
        text: '无合作数据',
        left: 'center',
        textStyle: {
          fontSize: 18,
          fontWeight: 'bold'
        }
      }
    };
  }

  const { actor, collaborations } = actorData.value;

  // 准备节点数据
  const nodes = [
    {
      id: actor,
      name: actor,
      symbolSize: 60,
      itemStyle: {
        color: '#f78fb3',
        borderColor: '#f8a5c2',
        borderWidth: 4,
        shadowBlur: 10,
        shadowColor: 'rgba(247, 143, 179, 0.5)'
      },
      label: {
        show: true,
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        position: 'right',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        padding: [4, 8],
        borderRadius: 4
      }
    }
  ];

  collaborations.forEach((collab: Collaboration) => {
    const size = Math.max(25, Math.min(45, collab.collaboration_count * 10));
    nodes.push({
      id: collab.co_actor,
      name: collab.co_actor,
      symbolSize: size,
      itemStyle: {
        color: '#18dcff',
        borderColor: '#32ccfe',
        borderWidth: 2,
        shadowBlur: 5,
        shadowColor: 'rgba(24, 220, 255, 0.3)'
      },
      label: {
        show: collab.collaboration_count > Math.max(2, minCollaborations.value),
        fontSize: 12,
        fontWeight: 'normal',
        color: '#333',
        position: 'right',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        padding: [3, 6],
        borderRadius: 3
      }
    });
  });

  // 准备边数据
  const links = collaborations.map((collab: Collaboration) => ({
    source: actor,
    target: collab.co_actor,
    value: collab.collaboration_count,
    symbolSize: [5, 10],
    lineStyle: {
      width: Math.log(collab.collaboration_count) * 2 + 1.5,
      color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: '#f78fb3' },
        { offset: 1, color: '#18dcff' }
      ]),
      opacity: 0.7,
      curveness: 0.3,
      shadowBlur: 3,
      shadowColor: 'rgba(0, 0, 0, 0.2)'
    },
    label: {
      show: collab.collaboration_count > 3,
      formatter: `${collab.collaboration_count}部`,
      fontSize: 12,
      color: '#555',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      padding: [2, 5],
      borderRadius: 3
    }
  }));

  return {
    title: {
      text: `${actor}的合作关系网络`,
      left: 'center',
      textStyle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333'
      },
      subtextStyle: {
        color: '#666'
      }
    },
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderColor: '#eee',
      borderWidth: 1,
      textStyle: {
        color: '#333'
      },
      formatter: function(params: any) {
        if (params.dataType === 'node') {
          return `<div style="font-weight:bold;margin-bottom:5px;">${params.data.name}</div>`;
        }
        const collabCount = collaborations.find((c: Collaboration) => c.co_actor === params.data.target)?.collaboration_count || 0;
        return `<div style="font-weight:bold;margin-bottom:5px;">${params.data.source} 与 ${params.data.target}</div>
                <div>合作 <span style="color:#f78fb3;font-weight:bold;">${collabCount}</span> 部电影</div>`;
      }
    },
    animationDuration: 1500,
    animationEasingUpdate: 'quinticInOut' as const,
    series: [
      {
        name: '演员合作关系',
        type: 'graph',
        layout: 'force',
        data: nodes,
        links: links,
        roam: true,
        zoom: 1.2,
        edgeSymbol: ['none', 'arrow'],
        edgeSymbolSize: [0, 7],
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
          },
          scale: true,
          scaleSize: 5,
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.3)'
          }
        },
        force: {
          repulsion: 200,
          gravity: 0.1,
          edgeLength: [80, 150],
          friction: 0.2,
          layoutAnimation: true
        },
        draggable: true,
        animation: true
      }
    ]
  };
});
</script>

<style scoped>
/* 如果需要可以添加更多样式 */
</style>
