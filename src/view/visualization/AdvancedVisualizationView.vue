<template>
    <n-card class="container mx-auto px-6 py-8">
      <h1 class="text-2xl font-bold mb-6">高级电影数据分析</h1>

      <!-- 主要内容区域 -->
      <n-grid :cols="24" :x-gap="12" :y-gap="16">
        <!-- 语言分布图表 -->
        <n-gi :span="24">
          <LanguageDistributionChart />
        </n-gi>

        <!-- 导演分析图表 -->
        <n-gi :span="24">
          <DirectorAnalysisChart />
        </n-gi>

        <!-- 预算与票房分析 -->
        <n-gi :span="24">
          <BudgetRevenueChart />
        </n-gi>

        <!-- 跨职业创作者分析 -->
        <n-gi :span="24">
          <n-card title="跨职业电影创作者分析">
            <n-space vertical>
              <n-space>
                <n-select
                  v-model:value="crossRoleLimit"
                  :options="limitOptions"
                  placeholder="显示数量"
                  size="small"
                  style="width: 120px"
                />
                <n-button size="small" type="primary" @click="fetchCrossRoleData">
                  更新数据
                </n-button>
              </n-space>

              <div>
                <div v-if="crossRoleLoading">
                  <n-spin size="large" />
                </div>
                <div v-else-if="crossRoleError">
                  <n-alert type="error" :title="crossRoleError" />
                </div>
                <div v-else-if="!crossRoleData || crossRoleData.length === 0">
                  <n-empty description="暂无数据" />
                </div>
                <div v-else>
                  <n-data-table
                    size="small"
                    :columns="crossRoleColumns"
                    :data="crossRoleData"
                    :pagination="pagination"
                    :bordered="false"
                    striped
                  />
                </div>
              </div>
            </n-space>
          </n-card>
        </n-gi>

        <!-- 顶级摄影指导分析 -->
        <n-gi :span="12">
          <n-card title="顶级摄影指导分析">
            <n-space vertical>
              <n-space>
                <n-select
                  v-model:value="cinematographerLimit"
                  :options="limitOptions"
                  placeholder="显示数量"
                  size="small"
                  style="width: 120px"
                />
                <n-button size="small" type="primary" @click="fetchCinematographerData">
                  更新数据
                </n-button>
              </n-space>

              <div>
                <div v-if="cinematographerLoading">
                  <n-spin size="large" />
                </div>
                <div v-else-if="cinematographerError">
                  <n-alert type="error" :title="cinematographerError" />
                </div>
                <div v-else-if="!cinematographerData || cinematographerData.length === 0">
                  <n-empty description="暂无数据" />
                </div>
                <div v-else>
                  <n-data-table
                    size="small"
                    :columns="cinematographerColumns"
                    :data="cinematographerData"
                    :pagination="pagination"
                    :bordered="false"
                    striped
                  />
                </div>
              </div>
            </n-space>
          </n-card>
        </n-gi>

        <!-- 顶级音乐作曲家分析 -->
        <n-gi :span="12">
          <n-card title="顶级音乐作曲家分析">
            <n-space vertical>
              <n-space>
                <n-select
                  v-model:value="composerLimit"
                  :options="limitOptions"
                  placeholder="显示数量"
                  size="small"
                  style="width: 120px"
                />
                <n-button size="small" type="primary" @click="fetchComposerData">
                  更新数据
                </n-button>
              </n-space>

              <div>
                <div v-if="composerLoading">
                  <n-spin size="large" />
                </div>
                <div v-else-if="composerError">
                  <n-alert type="error" :title="composerError" />
                </div>
                <div v-else-if="!composerData || composerData.length === 0">
                  <n-empty description="暂无数据" />
                </div>
                <div v-else>
                  <n-data-table
                    size="small"
                    :columns="composerColumns"
                    :data="composerData"
                    :pagination="pagination"
                    :bordered="false"
                    striped
                  />
                </div>
              </div>
            </n-space>
          </n-card>
        </n-gi>
      </n-grid>
    </n-card>
</template>

<script setup lang="ts">
import {computed, h, onMounted, ref} from 'vue';
import type {DataTableColumns} from 'naive-ui';
import {NAlert, NButton, NCard, NDataTable, NEmpty, NGi, NGrid, NRate, NSelect, NSpace, NSpin} from 'naive-ui';
import LanguageDistributionChart from '@/components/LanguageDistributionChart.vue';
import DirectorAnalysisChart from '@/components/DirectorAnalysisChart.vue';
import BudgetRevenueChart from '@/components/BudgetRevenueChart.vue';
import {visualizationApi} from '@/lib/api';

// 定义数据类型
interface CrossRolePersonData {
  person_name?: string;
  movie_count?: number;
  roles?: string[];
  role_count?: number;
  avg_rating?: string;
  movies?: {
    title?: string;
    release_date?: string;
    vote_average?: string;
  }[];
}

interface FilmCreatorData {
  person_name?: string;
  cinematographer_name?: string;
  composer_name?: string;
  movie_count?: number;
  avg_rating?: string;
  top_movies?: {
    title?: string;
    release_date?: string;
    vote_average?: string;
  }[];
}

// 跨职业创作者数据
const crossRoleData = ref<CrossRolePersonData[]>([]);
const crossRoleLoading = ref(false);
const crossRoleError = ref('');
const crossRoleLimit = ref(15);

// 摄影指导数据
const cinematographerData = ref<FilmCreatorData[]>([]);
const cinematographerLoading = ref(false);
const cinematographerError = ref('');
const cinematographerLimit = ref(15);

// 音乐作曲家数据
const composerData = ref<FilmCreatorData[]>([]);
const composerLoading = ref(false);
const composerError = ref('');
const composerLimit = ref(15);

// 选项配置
const limitOptions = [
  { label: '显示 10 位', value: 10 },
  { label: '显示 15 位', value: 15 },
  { label: '显示 20 位', value: 20 }
];

// 分页配置
const pagination = ref({
  page: 1,
  pageSize: 10,
  showSizePicker: true,
  pageSizes: [10, 20, 50]
});

// 跨职业创作者表格列
const crossRoleColumns = computed<DataTableColumns>(() => [
  {
    title: '姓名',
    key: 'person_name',
    width: 150,
    render(row: any) {
      return row?.person_name || '未知';
    }
  },
  {
    title: '电影数量',
    key: 'movie_count',
    width: 100,
    sorter: 'default',
    sortOrder: 'descend',
    render(row: any) {
      return row?.movie_count || 0;
    }
  },
  {
    title: '担任角色',
    key: 'roles',
    width: 200,
    render(row: any) {
      return row?.roles && Array.isArray(row.roles) ? row.roles.join(', ') : '';
    }
  },
  {
    title: '角色数量',
    key: 'role_count',
    width: 100,
    render(row: any) {
      return row?.role_count || 0;
    }
  },
  {
    title: '平均评分',
    key: 'avg_rating',
    width: 180,
    render(row: any) {
      const ratingValue = parseFloat(String(row?.avg_rating || '0')) / 2;
      const ratingText = row?.avg_rating?.toString() || '0';

      return h('div', { class: 'flex items-center' }, [
        h(NRate, {
          readonly: true,
          size: 'small',
          value: ratingValue,
          allowHalf: true
        }),
        h('span', { class: 'ml-2' }, ratingText)
      ]);
    }
  },
  {
    title: '代表作品',
    key: 'movies',
    render(row: any) {
      if (!row?.movies || !Array.isArray(row.movies) || row.movies.length === 0) {
        return '暂无数据';
      }

      return row.movies.map((movie: any) => movie?.title || '未知电影').join(', ');
    }
  }
]);

// 摄影指导表格列
const cinematographerColumns = computed<DataTableColumns>(() => [
  {
    title: '摄影指导',
    key: 'cinematographer_name',
    width: 120,
    render(row: any) {
      return row?.cinematographer_name || '未知';
    }
  },
  {
    title: '电影数量',
    key: 'movie_count',
    width: 100,
    sorter: 'default',
    sortOrder: 'descend',
    render(row: any) {
      return row?.movie_count || 0;
    }
  },
  {
    title: '平均评分',
    key: 'avg_rating',
    width: 160,
    render(row: any) {
      const ratingValue = parseFloat(String(row?.avg_rating || '0')) / 2;
      const ratingText = row?.avg_rating?.toString() || '0';

      return h('div', { style: 'display: flex; align-items: center;' }, [
        h(NRate, {
          readonly: true,
          size: 'small',
          value: ratingValue,
          allowHalf: true
        }),
        h('span', { style: 'margin-left: 8px;' }, ratingText)
      ]);
    }
  },
  {
    title: '代表作品',
    key: 'top_movies',
    render(row: any) {
      if (!row?.top_movies || !Array.isArray(row.top_movies) || row.top_movies.length === 0) {
        return '暂无数据';
      }

      return row.top_movies.map((movie: any) => movie?.title || '未知电影').join(', ');
    }
  }
]);

// 音乐作曲家表格列
const composerColumns = computed<DataTableColumns>(() => [
  {
    title: '音乐作曲家',
    key: 'composer_name',
    width: 120,
    render(row: any) {
      return row?.composer_name || '未知';
    }
  },
  {
    title: '电影数量',
    key: 'movie_count',
    width: 100,
    sorter: 'default',
    sortOrder: 'descend',
    render(row: any) {
      return row?.movie_count || 0;
    }
  },
  {
    title: '平均评分',
    key: 'avg_rating',
    width: 160,
    render(row: any) {
      const ratingValue = parseFloat(String(row?.avg_rating || '0')) / 2;
      const ratingText = row?.avg_rating?.toString() || '0';

      return h('div', { style: 'display: flex; align-items: center;' }, [
        h(NRate, {
          readonly: true,
          size: 'small',
          value: ratingValue,
          allowHalf: true
        }),
        h('span', { style: 'margin-left: 8px;' }, ratingText)
      ]);
    }
  },
  {
    title: '代表作品',
    key: 'top_movies',
    render(row: any) {
      if (!row?.top_movies || !Array.isArray(row.top_movies) || row.top_movies.length === 0) {
        return '暂无数据';
      }

      return row.top_movies.map((movie: any) => movie?.title || '未知电影').join(', ');
    }
  }
]);

// 获取跨职业创作者数据
const fetchCrossRoleData = async () => {
  crossRoleLoading.value = true;
  crossRoleError.value = '';
  crossRoleData.value = []; // 清空现有数据，避免显示旧数据

  try {
    const response = await visualizationApi.getCrossRoleTalents(crossRoleLimit.value);

    if (response && response.data) {
      if (Array.isArray(response.data)) {
        crossRoleData.value = response.data;
      } else {
        crossRoleData.value = [];
        crossRoleError.value = '返回数据格式不正确，期望数组';
      }
    } else {
      crossRoleData.value = [];
      crossRoleError.value = '返回数据格式不正确';
    }
  } catch (err: any) {
    console.error('获取跨职业创作者数据失败:', err);
    crossRoleData.value = [];
    crossRoleError.value = err?.message || '获取数据失败，请稍后重试';
  } finally {
    crossRoleLoading.value = false;
  }
};

// 获取摄影指导数据
const fetchCinematographerData = async () => {
  cinematographerLoading.value = true;
  cinematographerError.value = '';
  cinematographerData.value = []; // 清空现有数据，避免显示旧数据

  try {
    const response = await visualizationApi.getTopCinematographers(cinematographerLimit.value);

    if (response && response.data) {
      if (Array.isArray(response.data)) {
        cinematographerData.value = response.data;
      } else {
        cinematographerData.value = [];
        cinematographerError.value = '返回数据格式不正确，期望数组';
      }
    } else {
      cinematographerData.value = [];
      cinematographerError.value = '返回数据格式不正确';
    }
  } catch (err: any) {
    console.error('获取摄影指导数据失败:', err);
    cinematographerData.value = [];
    cinematographerError.value = err?.message || '获取数据失败，请稍后重试';
  } finally {
    cinematographerLoading.value = false;
  }
};

// 获取音乐作曲家数据
const fetchComposerData = async () => {
  composerLoading.value = true;
  composerError.value = '';
  composerData.value = []; // 清空现有数据，避免显示旧数据

  try {
    const response = await visualizationApi.getTopComposers(composerLimit.value);

    if (response && response.data) {
      if (Array.isArray(response.data)) {
        composerData.value = response.data;
      } else {
        composerData.value = [];
        composerError.value = '返回数据格式不正确，期望数组';
      }
    } else {
      composerData.value = [];
      composerError.value = '返回数据格式不正确';
    }
  } catch (err: any) {
    console.error('获取音乐作曲家数据失败:', err);
    composerData.value = [];
    composerError.value = err?.message || '获取数据失败，请稍后重试';
  } finally {
    composerLoading.value = false;
  }
};

// 组件挂载时初始化数据
onMounted(() => {
  fetchCrossRoleData();
  fetchCinematographerData();
  fetchComposerData();
});
</script>

<style scoped>
</style>
