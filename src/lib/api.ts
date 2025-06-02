import axios from 'axios';
import {API_BASE_URL} from './config';

// 创建axios实例
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
});

// 添加响应拦截器，确保数据格式一致
apiClient.interceptors.response.use(
    (response) => {
        // 处理电影数据格式
        if (response.config.url?.includes('/api/v1/movies') && response.data && response.data.data) {
            // 处理电影列表数据
            if (Array.isArray(response.data.data)) {
                response.data.data = response.data.data.map(formatMovieData);
            }
            // 处理单个电影数据
            else if (response.data.data.id || response.data.data.tmdb_id) {
                response.data.data = formatMovieData(response.data.data);
            }
        }
        return response;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 格式化电影数据的辅助函数
function formatMovieData(movie: any): any {
    if (!movie) return movie;

    const formatted = { ...movie };

    // 确保imdb_id格式正确
    if (formatted.imdb_id && typeof formatted.imdb_id === 'string') {
        if (!formatted.imdb_id.startsWith('tt')) {
            formatted.imdb_id = `tt${formatted.imdb_id}`;
        }
    }

    // 确保id存在
    if (!formatted.id) {
        formatted.id = formatted.tmdb_id || formatted._id || String(Math.random()).substring(2);
    }

    // 确保genres是数组格式
    if (formatted.genres) {
        if (typeof formatted.genres === 'string') {
            formatted.genres = formatted.genres.split(',').map((g: string) => g.trim()).filter(Boolean);
        }
    } else {
        formatted.genres = [];
    }

    return formatted;
}

// 处理错误的工具函数
const handleApiError = (error: any) => {
    console.error('API错误:', error);
    if (error.response) {
        // 服务器返回错误状态码
        console.error('状态码:', error.response.status);
        console.error('响应数据:', error.response.data);
    } else if (error.request) {
        // 请求已经发出，但没有收到响应
        console.error('没有收到响应:', error.request);
    } else {
        // 设置请求时发生了错误
        console.error('错误信息:', error.message);
    }
    throw error;
};

// 电影API服务
export const movieApi = {
    // 获取所有电影
    async getAllMovies(params = {}) {
        try {
            const response = await apiClient.get('/api/v1/movies/all', { params });
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    // 获取分页电影列表
    async getMovies(params = {}) {
        try {
            const response = await apiClient.get('/api/v1/movies', { params });
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    // 搜索电影
    async searchMovies(query: string, page = 1, pageSize = 20) {
        try {
            const response = await apiClient.get(`/api/v1/movies/search`, {
                params: { query, page, pageSize }
            });
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    // 获取电影详情
    async getMovieById(id: number | string) {
        try {
            const response = await apiClient.get(`/api/v1/movies/${id}`);
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    // 获取相似电影
    async getSimilarMovies(id: number | string, limit = 5) {
        try {
            const response = await apiClient.get(`/api/v1/movies/${id}/similar`, {
                params: { limit }
            });
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    // 获取电影类型列表
    async getGenres() {
        try {
            const response = await apiClient.get('/api/v1/genres');
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    // 获取电影统计数据
    async getStats() {
        try {
            const response = await apiClient.get('/api/v1/stats/summary');
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    // 获取按年份统计的电影
    async getMoviesByYear() {
        try {
            const response = await apiClient.get('/api/v1/stats/years');
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    // 获取随机推荐电影
    async getRandomMovies(count = 5, minRating = 7.0) {
        try {
            const response = await apiClient.get('/api/v1/recommendations/random', {
                params: { count, minRating }
            });
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    }
};

// 可视化API服务
export const visualizationApi = {
    // 获取预算收入分析
    async getBudgetRevenueAnalysis(startYear = 1940, endYear = new Date().getFullYear(), minVotes = 0, bucketSize = 10000000) {
        try {
            const response = await apiClient.get('/api/v1/visualization/budget-revenue', {
                params: { startYear, endYear, minVotes, bucketSize }
            });
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    // 获取电影时长分布
    async getRuntimeDistribution(bucketSize = 15, minVotes = 15) {
        try {
            const response = await apiClient.get('/api/v1/visualization/runtime-distribution', {
                params: { bucketSize, minVotes }
            });
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    // 获取演员关系网络数据
    async getActorNetwork(actor: string, minCollaborations = 2, limit = 50) {
        try {
            const response = await apiClient.get('/api/v1/visualization/actor-collaborations', {
                params: { actor, minCollaborations, limit }
            });
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    // 获取电影评分分布
    async getRatingDistribution(bucketSize = 0.5) {
        try {
            const response = await apiClient.get('/api/v1/visualization/rating-distribution', {
                params: { bucketSize }
            });
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    // 获取年度趋势
    async getYearlyTrends(startYear = 1990, endYear = new Date().getFullYear(), minVotes = 10) {
        try {
            const response = await apiClient.get('/api/v1/visualization/yearly-trends', {
                params: { startYear, endYear, minVotes }
            });
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    // 获取类型对比数据
    async getGenreComparison(genres?: string, metric = 'avg_rating') {
        try {
            const response = await apiClient.get('/api/v1/visualization/genre-comparison', {
                params: { genres, metric }
            });
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    // 获取制作公司排名分析
    async getTopProductionCompanies(limit = 10, minMovies = 5, metric = 'movie_count') {
        try {
            const response = await apiClient.get('/api/v1/visualization/top-production-companies', {
                params: { limit, minMovies, metric }
            });
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    // 获取类型及其统计信息
    async getGenresWithStats() {
        try {
            const response = await apiClient.get('/api/v1/genres/stats');
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    // 获取电影语言分布
    async getLanguageDistribution(minMovies = 5, limit = 20) {
        try {
            const response = await apiClient.get('/api/v1/visualization/language-distribution', {
                params: { minMovies, limit }
            });
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    // 获取顶级导演分析
    async getTopDirectors(limit = 20, minMovies = 3, sortBy = 'movie_count') {
        try {
            const response = await apiClient.get('/api/v1/visualization/top-directors', {
                params: { limit, minMovies, sortBy }
            });
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    // 获取顶级摄影指导分析
    async getTopCinematographers(limit = 15, minMovies = 2) {
        try {
            const response = await apiClient.get('/api/v1/visualization/top-cinematographers', {
                params: { limit, minMovies }
            });
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    // 获取顶级音乐作曲家分析
    async getTopComposers(limit = 15, minMovies = 2) {
        try {
            const response = await apiClient.get('/api/v1/visualization/top-composers', {
                params: { limit, minMovies }
            });
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    // 获取跨领域电影工作者分析
    async getCrossRoleTalents(limit = 15, minMovies = 2) {
        try {
            const response = await apiClient.get('/api/v1/visualization/cross-role-talents', {
                params: { limit, minMovies }
            });
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    }
};

/**
 *  导入 API
 *  @module importApi
 */
export const importApi = {
    /**
     * 上传 CSV 文件
     * @param file
     * @param onUploadProgress
     */
    async uploadCsvFile(
        file: File,
        onUploadProgress?: (progressEvent: any) => void // Axios 的进度事件类型
    ) {
        const formData = new FormData();
        // 后端期望的字段名是 'file'
        formData.append('file', file, file.name);

        try {
            const response = await apiClient.post('/api/v1/import', formData, {
                headers: {
                    'Content-Type': undefined
                },
                onUploadProgress: onUploadProgress,
                timeout: 300000,
            });
            return response.data;
        } catch (error) {
            // 使用您已有的统一错误处理函数
            return handleApiError(error);
        }
    },
};
