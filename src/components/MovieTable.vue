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
              <Icon icon="material-symbols:search"/>
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
import {
  DataTableColumns,
  NButton,
  NCard,
  NDataTable,
  NEllipsis,
  NImage,
  NInput,
  NRate,
  NSelect,
  NSpace,
  NTag,
  NText,
  PaginationProps
} from 'naive-ui';
import {Icon} from '@iconify/vue';
import {Movie} from "@/types.ts";


// 定义Props
const props = defineProps<{
  movies: any[];
}>();

// 表格加载状态
const loading = ref(false);

// 本地搜索和筛选
const searchValue = ref('');
const selectedGenre = ref<string | null>(null);
const ratingFilter = ref<string | null>(null);

// 评分筛选选项
const ratingOptions = [
  {label: '优秀 (8分以上)', value: 'excellent'},
  {label: '良好 (7-8分)', value: 'good'},
  {label: '一般 (5-7分)', value: 'average'},
  {label: '较差 (5分以下)', value: 'poor'}
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
    const formatted = {...movie};

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

    // 确保release_date字段存在
    if (!formatted.hasOwnProperty('release_date')) {
      formatted.release_date = '';
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
    const expectedFields = ['id', 'title', 'genres', 'vote_average',
      'runtime', 'production_countries', 'revenue', 'imdb_id'];
    // release_date是可选字段，从必检查字段中移除

    const missingFields = expectedFields.filter(field => !sample.hasOwnProperty(field));
    if (missingFields.length > 0) {
      console.warn('电影数据缺少以下字段:', missingFields);
    }
  }
}, {immediate: true});

// 表格列定义
const columns = computed((): DataTableColumns<Movie> => [
  {
    title: '海报',
    key: 'poster_path',
    width: 100,
    render(row) {
      const getPosterUrl = (path?: string | null) => {
        if (!path) return 'https://via.placeholder.com/60x90?text=无海报';
        if (path.startsWith('/')) return `https://image.tmdb.org/t/p/w185${path}`;
        if (path.startsWith('http')) return path;
        return `https://m.media-amazon.com/images/${path}`;
      };
      return h(NImage, {
        src: getPosterUrl(row.poster_path),
        width: 80, height: 140, objectFit: 'cover',
        fallbackSrc: 'https://via.placeholder.com/60x90?text=无海报',
        style: 'border-radius: 4px;'
      });
    }
  },
  {
    title: '片名',
    key: 'title',
    width: 100,
    render(row) {
      const mainTitleNode = h(
        NEllipsis, {}, { default: () => row.title ?? '无标题' }
      );

      const children = [mainTitleNode];

      if (row.original_title && row.original_title !== row.title) {
        children.push(
          h(NText, { depth: 3, size: 'small', style: { marginTop: '2px', display: 'block' } },
            { default: () => row.original_title }
          )
        );
      }
      if (children.length > 1) {
        return h(NSpace, { vertical: true, size: 0, wrapItem: false }, { default: () => children });
      }
      return mainTitleNode;
    }
  },
  {
    title: '类型',
    key: 'genres',
    width: 180,
    render(row) {
      const validGenres = Array.isArray(row.genres) ? row.genres.filter(g => g && typeof g === 'string') : [];
      if (validGenres.length === 0) {
        return h(NText, { depth: 3 }, { default: () => '无类型' });
      }
      // 移除了 NMarquee，NSpace 添加 wrap: true
      return h(NSpace, { itemStyle: { marginRight: '4px', marginBottom: '4px' }, wrap: true, size: 'small' }, {
        default: () => validGenres.map((genre: string) =>
          h(NTag, { size: 'small', type: 'info', round: true }, { default: () => genre })
        )
      });
    }
  },
  {
    title: '上映日期',
    key: 'release_date',
    width: 120,
    sorter: 'default',
    sortOrder: 'descend',
    render(row) {
      if (!row.release_date) return '未知';
      try {
        const date = new Date(String(row.release_date));
        if (isNaN(date.getTime())) return '未知';
        return date.toLocaleDateString();
      } catch (e) {
        return '未知';
      }
    }
  },
  {
    title: '评分',
    key: 'vote_average',
    width: 160,
    sorter(rowA, rowB) {
      return (rowA.vote_average ?? 0) - (rowB.vote_average ?? 0);
    },
    render(row) {
      const rating = row.vote_average ?? 0;
      return h(
        NSpace,
        { align: 'center', wrap: false, size: 'small' },
        {
          default: () => [
            h(NRate, { size: 'small', allowHalf: true, readonly: true, value: rating / 2, color: '#FFAC33' }),
            h(NText, { depth: 2 }, { default: () => rating.toFixed(1) })
          ]
        }
      );
    }
  },
  {
    title: '时长',
    key: 'runtime',
    width: 80,
    render(row) {
      const runtime = Number(row.runtime ?? 0);
      return runtime ? `${runtime}分钟` : '未知';
    }
  },
  {
    title: '制片国家',
    key: 'production_countries',
    width: 120,
    render(row) {
      const countries = row.production_countries;
      if (!countries || (Array.isArray(countries) && countries.length === 0) || (typeof countries === 'string' && !countries.trim())) {
        return h(NText, { depth: 3 }, { default: () => '未知' });
      }
      const countryList = (Array.isArray(countries) ? countries : String(countries).split(/[,，]/).map(c => c.trim())).filter(Boolean);

      if (countryList.length === 0) {
        return h(NText, { depth: 3 }, { default: () => '未知' });
      }
      // 移除了 NMarquee，NSpace 添加 wrap: true
      return h(NSpace, { itemStyle: { marginRight: '4px', marginBottom: '4px' }, wrap: true, size: 'small' }, {
        default: () => countryList.map((country: string) =>
          h(NTag, { size: 'small', type: 'info', round: true }, { default: () => country })
        )
      });
    }
  },
  {
    title: '票房',
    key: 'revenue',
    width: 120,
    sorter(rowA, rowB) {
      return (rowA.revenue ?? 0) - (rowB.revenue ?? 0);
    },
    render(row) {
      const revenue = row.revenue ?? 0;
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
      const children:any[] = [];
      if (row.imdb_id) {
        children.push(h(NButton, {
          quaternary: true, circle: true, size: 'small', tag: 'a',
          href: `https://www.imdb.com/title/${String(row.imdb_id).startsWith('tt') ? row.imdb_id : `tt${row.imdb_id}`}`,
          target: '_blank', rel: 'noopener noreferrer'
        }, { default: () => h(Icon, { icon: 'simple-icons:imdb', style: 'font-size: 20px; color: #F5C518;' }) }));
      }
      if (row.tmdb_id) {
        children.push(h(NButton, {
          quaternary: true, circle: true, size: 'small', tag: 'a',
          href: `https://www.themoviedb.org/movie/${row.tmdb_id}`,
          target: '_blank', rel: 'noopener noreferrer'
        }, { default: () => h(Icon, { icon: 'simple-icons:themoviedatabase', style: 'font-size: 20px; color: #01B4E4;' }) }));
      }
      if (children.length === 0) {
        return h(NText, { depth: 3 }, { default: () => '无链接' });
      }
      return h(NSpace, { justify: 'center', align: 'center' }, { default: () => children });
    }
  }
]);
</script>
