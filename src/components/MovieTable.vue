<template>
  <div class="mt-6">
    <n-card title="电影详细数据" :bordered="false" size="small" class="movie-table-card">
      <!-- 表格过滤功能 -->
      <div class="mb-4">
        <n-space vertical :size="12">
          <n-input
            v-model:value="searchValue"
            placeholder="搜索电影标题..."
            clearable
            @update:value="handleSearch"
          >
            <template #prefix>
              <Icon icon="material-symbols:search" />
            </template>
          </n-input>

          <n-space>
            <n-select
              v-model:value="selectedGenre"
              :options="genreOptions"
              placeholder="按类型筛选"
              clearable
              @update:value="filterByGenre"
              style="width: 180px"
            />

            <n-select
              v-model:value="ratingFilter"
              :options="ratingOptions"
              placeholder="按评分筛选"
              clearable
              @update:value="filterByRating"
              style="width: 180px"
            />

            <n-button type="primary" @click="resetFilters" size="small">
              重置筛选
            </n-button>
          </n-space>
        </n-space>
      </div>

      <n-data-table
        :columns="columns"
        :data="filteredMovies"
        :pagination="pagination"
        :row-key="rowKey"
        striped
        :loading="loading"
        @update:page="handlePageChange"
      />
    </n-card>
  </div>
</template>

<script setup lang="ts">
import {computed, h, ref, watch} from 'vue';
import type {DataTableColumns, PaginationProps} from 'naive-ui';
import {NButton, NCard, NDataTable, NImage, NInput, NRate, NSelect, NSpace, NTag, NText} from 'naive-ui';
import {useTheme} from '@/composables/useTheme';
import {Icon} from '@iconify/vue';

// 获取主题变量
const { themeVars, isDark } = useTheme();

// 定义Props
const props = defineProps<{
  movies: any[];
}>();

// 表格加载状态
const loading = ref(false);

// 本地搜索和筛选
const searchValue = ref('');
const selectedGenre = ref(null);
const ratingFilter = ref(null);

// 评分筛选选项
const ratingOptions = [
  { label: '优秀 (8分以上)', value: 'excellent' },
  { label: '良好 (7-8分)', value: 'good' },
  { label: '一般 (5-7分)', value: 'average' },
  { label: '较差 (5分以下)', value: 'poor' }
];

// 动态生成类型选项
const genreOptions = computed(() => {
  if (!props.movies || props.movies.length === 0) return [];

  // 收集所有电影类型
  const genres = new Set<string>();
  props.movies.forEach(movie => {
    if (movie.genres && Array.isArray(movie.genres)) {
      movie.genres.forEach((genre: string) => {
        genres.add(genre);
      });
    } else if (movie.genres && typeof movie.genres === 'string') {
      movie.genres.split(', ').forEach((genre: string) => {
        if (genre) genres.add(genre);
      });
    }
  });

  // 转换为选项格式
  return Array.from(genres).sort().map(genre => ({
    label: genre,
    value: genre
  }));
});

// 格式化电影数据，确保字段统一
const formattedMovies = computed(() => {
  if (!props.movies || props.movies.length === 0) return [];

  return props.movies.map(movie => {
    // 确保基本字段存在
    const formatted = { ...movie };

    // 确保id是有效的
    if (!formatted.id) {
      formatted.id = formatted.tmdb_id || formatted._id || Math.random().toString(36).substring(2);
    }

    // 格式化genres字段
    if (formatted.genres) {
      if (typeof formatted.genres === 'string') {
        formatted.genres = formatted.genres.split(', ').filter(Boolean);
      } else if (!Array.isArray(formatted.genres)) {
        formatted.genres = [];
      }
    } else {
      formatted.genres = [];
    }

    // 格式化imdb_id字段
    if (formatted.imdb_id && typeof formatted.imdb_id === 'string') {
      if (!formatted.imdb_id.startsWith('tt')) {
        formatted.imdb_id = `tt${formatted.imdb_id}`;
      }
    }

    return formatted;
  });
});

// 应用所有筛选条件后的电影数据
const filteredMovies = computed(() => {
  let result = formattedMovies.value;

  // 搜索标题
  if (searchValue.value) {
    const searchLower = searchValue.value.toLowerCase();
    result = result.filter(movie =>
      movie.title.toLowerCase().includes(searchLower) ||
      (movie.original_title && movie.original_title.toLowerCase().includes(searchLower))
    );
  }

  // 筛选类型
  if (selectedGenre.value) {
    result = result.filter(movie => {
      if (Array.isArray(movie.genres)) {
        return movie.genres.includes(selectedGenre.value);
      }
      return false;
    });
  }

  // 筛选评分
  if (ratingFilter.value) {
    switch (ratingFilter.value) {
      case 'excellent':
        result = result.filter(movie => parseFloat(movie.vote_average) >= 8);
        break;
      case 'good':
        result = result.filter(movie => parseFloat(movie.vote_average) >= 7 && parseFloat(movie.vote_average) < 8);
        break;
      case 'average':
        result = result.filter(movie => parseFloat(movie.vote_average) >= 5 && parseFloat(movie.vote_average) < 7);
        break;
      case 'poor':
        result = result.filter(movie => parseFloat(movie.vote_average) < 5);
        break;
    }
  }

  return result;
});

// 重置所有筛选条件
const resetFilters = () => {
  searchValue.value = '';
  selectedGenre.value = null;
  ratingFilter.value = null;
};

// 处理搜索
const handleSearch = (value: string) => {
  searchValue.value = value;
  pagination.value.page = 1;
};

// 按类型筛选
const filterByGenre = (value: string | null) => {
  selectedGenre.value = value;
  pagination.value.page = 1;
};

// 按评分筛选
const filterByRating = (value: string | null) => {
  ratingFilter.value = value;
  pagination.value.page = 1;
};

// 行键函数，使用id作为行的唯一标识
const rowKey = (row: any) => row.id;

// 分页配置
const pagination = ref<PaginationProps>({
  page: 1,
  pageSize: 10,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
  onChange: (page) => {
    pagination.value.page = page;
  },
  onUpdatePageSize: (pageSize) => {
    pagination.value.pageSize = pageSize;
    pagination.value.page = 1;
  }
});

// 处理页码变化
const handlePageChange = (currentPage: number) => {
  pagination.value.page = currentPage;
};

// 观察电影数据变化，重置分页并检查数据格式
watch(() => props.movies, (newMovies) => {
  pagination.value.page = 1;
  resetFilters();

  // 检查数据的正确性
  if (newMovies && newMovies.length > 0) {
    console.log('接收到的电影数据样本:', newMovies[0]);

    // 检查数据字段是否符合预期
    const sample = newMovies[0];
    const expectedFields = ['id', 'title', 'genres', 'release_date', 'vote_average',
                           'runtime', 'production_countries', 'revenue', 'imdb_id'];

    const missingFields = expectedFields.filter(field => !sample.hasOwnProperty(field));
    if (missingFields.length > 0) {
      console.warn('电影数据缺少以下字段:', missingFields);
    }
  }
}, { immediate: true });

// 表格列定义
const columns = computed<DataTableColumns>(() => [
  {
    title: '海报',
    key: 'poster_path',
    width: 80,
    render(row) {
      // 获取海报URL
      const getPosterUrl = (path) => {
        if (!path) return 'https://via.placeholder.com/60x90?text=无海报';

        // 处理不同格式的路径
        if (path.startsWith('/')) {
          // TMDB格式的路径，以斜杠开头
          return `https://image.tmdb.org/t/p/w185${path}`;
        } else if (path.startsWith('http')) {
          // 完整URL，直接返回
          return path;
        } else {
          // 其他格式，假设是Amazon格式
          return `https://m.media-amazon.com/images/${path}`;
        }
      };

      return h(NImage, {
        src: getPosterUrl(row.poster_path),
        width: 60,
        height: 90,
        objectFit: 'cover',
        fallbackSrc: 'https://via.placeholder.com/60x90?text=无海报',
        style: 'border-radius: 4px;'
      });
    }
  },
  {
    title: '片名',
    key: 'title',
    width: 200,
    ellipsis: {
      tooltip: true
    },
    render(row) {
      return h(
        'div',
        {
          class: 'flex flex-col'
        },
        [
          h(
            NText,
            {
              strong: true
            },
            { default: () => row.title }
          ),
          row.original_title && row.original_title !== row.title
            ? h(
                NText,
                {
                  depth: 3,
                  size: 'small'
                },
                { default: () => row.original_title }
              )
            : null
        ]
      );
    }
  },
  {
    title: '类型',
    key: 'genres',
    width: 220,
    render(row) {
      const genres = Array.isArray(row.genres)
        ? row.genres
        : typeof row.genres === 'string'
          ? row.genres.split(', ')
          : [];

      return h(
        NSpace,
        {
          size: 'small',
          wrap: true
        },
        {
          default: () =>
            genres.map((genre: string) =>
              h(
                NTag,
                {
                  size: 'small',
                  type: 'info'
                },
                { default: () => genre }
              )
            )
        }
      );
    }
  },
  {
    title: '上映日期',
    key: 'release_date',
    width: 120,
    sorter: 'default',
    sortOrder: 'descend',
    render(row) {
      const date = row.release_date ? new Date(row.release_date) : null;
      return date ? date.getFullYear() + '-' + (date.getMonth() + 1).toString().padStart(2, '0') + '-' + date.getDate().toString().padStart(2, '0') : '未知';
    }
  },
  {
    title: '评分',
    key: 'vote_average',
    width: 140,
    sorter(rowA, rowB) {
      return Number(rowA.vote_average) - Number(rowB.vote_average);
    },
    render(row) {
      const rating = parseFloat(row.vote_average);
      return h(
        'div',
        {
          class: 'flex items-center'
        },
        [
          h(NRate, {
            size: 'small',
            allowHalf: true,
            readonly: true,
            value: rating / 2,
            color: '#FFAC33'
          }),
          h(
            NText,
            {
              depth: 2,
              style: 'margin-left: 8px;'
            },
            { default: () => rating.toFixed(1) }
          )
        ]
      );
    }
  },
  {
    title: '时长',
    key: 'runtime',
    width: 80,
    render(row) {
      const runtime = parseInt(row.runtime);
      return runtime ? `${runtime}分钟` : '未知';
    }
  },
  {
    title: '制片国家',
    key: 'production_countries',
    width: 120,
    ellipsis: {
      tooltip: true
    },
    render(row) {
      return row.production_countries || '未知';
    }
  },
  {
    title: '票房',
    key: 'revenue',
    width: 120,
    sorter(rowA, rowB) {
      return Number(rowA.revenue) - Number(rowB.revenue);
    },
    render(row) {
      const revenue = parseInt(row.revenue);
      if (!revenue) return '未知';
      if (revenue >= 1000000000) return `${(revenue / 1000000000).toFixed(2)}B`;
      if (revenue >= 1000000) return `${(revenue / 1000000).toFixed(1)}M`;
      if (revenue >= 1000) return `${(revenue / 1000).toFixed(0)}K`;
      return revenue.toString();
    }
  },
  {
    title: '详情链接',
    key: 'links',
    width: 100,
    render(row) {
      return h(
        NSpace,
        {
          justify: 'center',
          align: 'center'
        },
        {
          default: () => [
            row.imdb_id
              ? h(
                  NButton,
                  {
                    quaternary: true,
                    circle: true,
                    size: 'small',
                    onClick: () => {
                      const imdbId = row.imdb_id.startsWith('tt') ? row.imdb_id : `tt${row.imdb_id}`;
                      window.open(`https://www.imdb.com/title/${imdbId}`, '_blank');
                    }
                  },
                  {
                    default: () => h(Icon, { icon: 'simple-icons:imdb', style: 'font-size: 20px; color: #F5C518;' })
                  }
                )
              : null,
            row.tmdb_id
              ? h(
                  NButton,
                  {
                    quaternary: true,
                    circle: true,
                    size: 'small',
                    onClick: () => {
                      window.open(`https://www.themoviedb.org/movie/${row.tmdb_id}`, '_blank');
                    }
                  },
                  {
                    default: () => h(Icon, { icon: 'simple-icons:themoviedatabase', style: 'font-size: 20px; color: #01B4E4;' })
                  }
                )
              : null
          ]
        }
      );
    }
  }
]);
</script>

<style scoped>
.mt-6 {
  margin-top: 1.5rem;
}
.mb-4 {
  margin-bottom: 1rem;
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
.movie-table-card {
  transition: all 0.3s ease;
}
.movie-table-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>
