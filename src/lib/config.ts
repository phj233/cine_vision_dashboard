// API配置
export const API_BASE_URL = 'http://localhost:3000';

// 过滤器默认值配置
export const FILTERS = {
    // 年份范围默认值
    YEAR_RANGE: {
        min: 1990,
        max: 2023,
    },
    // 评分范围默认值
    RATING_RANGE: {
        min: 0,
        max: 10,
    },
    // 有效的电影类型列表
    VALID_GENRES: [
        'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary',
        'Drama', 'Family', 'Fantasy', 'History', 'Horror', 'Music', 'Mystery',
        'Romance', 'Science Fiction', 'TV Movie', 'Thriller', 'War', 'Western'
    ]
};

// 分页配置
export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_PAGE_SIZE: 20,
    OPTIONS: [10, 20, 50, 100]
};

// 图表颜色配置
export const CHART_COLORS = {
    PRIMARY: '#0072F5',
    SECONDARY: '#F5A300',
    SUCCESS: '#17C964',
    WARNING: '#F5A524',
    ERROR: '#F31260',
    GRADIENT: [
        '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF',
        '#EC4899', '#F43F5E', '#FB7185', '#FCA5A5', '#FCD34D'
    ]
};

// 视图模式
export const VIEW_MODES = {
    LIST: 'list',
    GRID: 'grid',
    TABLE: 'table'
};

// 缓存配置
export const CACHE = {
    ENABLE: true,
    DURATION: 5 * 60 * 1000, // 5分钟
}; 