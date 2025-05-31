<template>
  <!-- 主内容区 -->
  <n-card class="mx-auto px-6 py-8 min-h-screen">
      <!-- 顶部统计信息区域 -->
      <StatCards :stats="stats" />

      <!-- 筛选和地图区域 -->
      <div class="flex flex-col lg:flex-row gap-6 mb-6">
        <!-- 右侧世界地图区域 -->
        <WorldMapChart class="w-full" :movies="filteredMovies" />
      </div>

      <!-- 数据概要 -->
      <div class="mb-6">
        <MiniCharts />
      </div>

      <!-- 年度票房趋势 - 单独一行 -->
      <div class="mb-6">
        <RevenueChart :movies="filteredMovies" />
      </div>

      <!-- 图表区域 -->
      <ChartSection :movies="filteredMovies" />

      <!-- 详细数据表格 -->
      <MovieTable :movies="filteredMovies" />
    </n-card>
</template>

<script lang="ts" setup>
import {onMounted, ref} from 'vue';
import {useTheme} from '@/composables/useTheme';
import StatCards from "@/components/StatCards.vue";
import ChartSection from "@/components/ChartSection.vue";
import WorldMapChart from "@/components/WorldMapChart.vue";
import MovieTable from "@/components/MovieTable.vue";
import MiniCharts from "@/components/MiniCharts.vue";
import RevenueChart from "@/components/RevenueChart.vue";
import type {Movie, Stats} from "@/types";
import {movieApi} from "@/lib/api";

// 获取主题状态
const { isDark} = useTheme();

// 所有电影数据
const allMovies = ref<Movie[]>([]);
// 过滤后的电影数据
const filteredMovies = ref<Movie[]>([]);
// 加载状态
const loading = ref(false);
// 错误信息
const error = ref('');

// 统计信息
const stats = ref<Stats>({
  totalMovies: 0,
  avgRating: "0",
  highestRated: undefined,
  mostPopular: undefined,
  longestMovie: undefined
});

// 从API获取电影数据
const fetchMovies = async (params = {}) => {
  loading.value = true;
  error.value = '';

  try {
    const result = await movieApi.getAllMovies(params);
    allMovies.value = result.data || [];
    filteredMovies.value = result.data || [];
    console.log(`成功从API获取 ${result.data.length} 条电影数据`);

    // 获取统计数据
    await fetchStats();
  } catch (err: any) {
    console.error('获取电影数据失败:', err);
    error.value = err.response?.data?.message || '获取数据失败，请稍后重试';
    // 使用示例数据作为备用
    allMovies.value = generateSampleMovies();
    filteredMovies.value = allMovies.value;
  } finally {
    loading.value = false;
  }
};

// 获取统计数据
const fetchStats = async () => {
  try {
    const statsData = await movieApi.getStats();
    stats.value = {
      totalMovies: statsData.totalMovies,
      avgRating: statsData.avgRating,
      highestRated: statsData.highestRated,
      mostPopular: statsData.mostPopular,
      longestMovie: statsData.longestMovie
    };
  } catch (err: any) {
    console.error('获取统计数据失败:', err);
    // 设置默认统计数据
    stats.value = {
      totalMovies: filteredMovies.value.length,
      avgRating: "6.5",
      highestRated: {
        id: "1",
        title: "肖申克的救赎",
        vote_average: "9.3",
        release_date: "1994-09-23"
      },
      mostPopular: {
        id: "1",
        title: "肖申克的救赎",
        vote_count: "15000",
        release_date: "1994-09-23"
      },
      longestMovie: {
        id: "3",
        title: "泰坦尼克号",
        runtime: "195",
        release_date: "1997-11-19"
      }
    };
  }
};

// 生成示例数据（如果API请求失败）
const generateSampleMovies = (): Movie[] => {
  return [
    {
      id: 1,
      title: '肖申克的救赎',
      original_title: 'The Shawshank Redemption',
      release_date: '1994-09-23',
      vote_average: 9.3,
      revenue: 28341469,
      runtime: 142,
      overview: '两个被囚禁的男人在数年间建立了良好的关系，通过共同的体面行为找到了安慰和最终的救赎。',
      tagline: '希望永存',
      genres: 'Drama, Crime',
      cast: 'Tim Robbins, Morgan Freeman',
      directors: 'Frank Darabont',
      production_companies: 'Castle Rock Entertainment',
      production_countries: 'United States of America',
      poster_path: '/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
      budget: 25000000,
    },
    {
      id: 2,
      title: '教父',
      original_title: 'The Godfather',
      release_date: '1972-03-24',
      vote_average: 9.2,
      revenue: 245066411,
      runtime: 175,
      overview: '讲述了纽约最大黑手党家族首领维托·唐·科莱昂及其家族的故事。',
      tagline: '提供他们无法拒绝的条件',
      genres: 'Drama, Crime',
      cast: 'Marlon Brando, Al Pacino, James Caan',
      directors: 'Francis Ford Coppola',
      production_companies: 'Paramount Pictures',
      production_countries: 'United States of America',
      poster_path: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
      budget: 6000000,
    },
    {
      id: 3,
      title: '黑暗骑士',
      original_title: 'The Dark Knight',
      release_date: '2008-07-18',
      vote_average: 9.0,
      revenue: 1004558444,
      runtime: 152,
      overview: '蝙蝠侠与他的盟友詹姆斯警长和地方检察官哈维·登特共同打击哥谭市犯罪。',
      tagline: '为何如此严肃？',
      genres: 'Action, Crime, Drama, Thriller',
      cast: 'Christian Bale, Heath Ledger, Aaron Eckhart',
      directors: 'Christopher Nolan',
      production_companies: 'Warner Bros. Pictures',
      production_countries: 'United States of America, United Kingdom',
      poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
      budget: 185000000,
    },
    {
      id: 4,
      title: '星球大战：帝国反击战',
      original_title: 'The Empire Strikes Back',
      release_date: '1980-05-20',
      vote_average: 8.7,
      revenue: 538375067,
      runtime: 124,
      overview: '在冰冻星球霍斯的反抗军基地遭到帝国军队的袭击后，卢克·天行者与绝地大师尤达一起训练。',
      tagline: '星战传奇继续',
      genres: 'Adventure, Action, Science Fiction',
      cast: 'Mark Hamill, Harrison Ford, Carrie Fisher',
      directors: 'Irvin Kershner',
      production_companies: 'Lucasfilm Ltd.',
      production_countries: 'United States of America',
      poster_path: '/2l05cFWJacyIsTpsqSgH0wQXe4V.jpg',
      budget: 18000000,
    },
    {
      id: 5,
      title: '指环王：王者归来',
      original_title: 'The Lord of the Rings: The Return of the King',
      release_date: '2003-12-17',
      vote_average: 8.9,
      revenue: 1146030912,
      runtime: 201,
      overview: '护戒小队分散，弗罗多和山姆奔向魔多，而阿拉贡则必须团结刚铎的人民迎战索隆的军队。',
      tagline: '史诗的终结',
      genres: 'Adventure, Fantasy, Action',
      cast: 'Elijah Wood, Viggo Mortensen, Ian McKellen',
      directors: 'Peter Jackson',
      production_companies: 'New Line Cinema',
      production_countries: 'New Zealand, United States of America',
      poster_path: '/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg',
      budget: 94000000,
    }
  ];
};

// 获取电影类型列表
const fetchGenres = async () => {
  try {
    const data = await movieApi.getGenres();
    console.log("获取到电影类型:", data);
    // 这里可以用来更新过滤器中的类型选项
  } catch (error) {
    console.error("获取电影类型失败:", error);
  }
};

// 获取电影统计数据
const fetchMovieStats = async () => {
  try {
    const data = await movieApi.getStats();
    console.log("获取到统计数据:", data);
    // 可以更新统计卡片的数据
  } catch (error) {
    console.error("获取统计数据失败:", error);
  }
};

onMounted(() => {
  // 进入页面时立即获取数据
  fetchMovies();
  // 获取类型数据
  fetchGenres();
  // 获取统计数据
  fetchMovieStats();
});
</script>

<style scoped>
/* 自定义滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
/* 移除输入框数字箭头 */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type="number"] {
  -moz-appearance: textfield;
}
.min-h-screen {
  min-height: 1024px;
}
</style>
