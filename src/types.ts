export interface Movie {
    id: string | number;                      // ID 可能是数字也可能是字符串 (例如 TMDB ID)
    title: string;                            // 标题通常是必需的
    original_title?: string | null;           // 原始标题可能不存在或与主标题相同
    release_date?: string | number | null;    // 上映日期可能未知
    vote_average?: number | null;             // 平均评分可能为0或未知
    vote_count?: number | null;               // 评分数量可能为0或未知
    revenue?: number | null;                  // 票房可能为0或未知
    runtime?: number | null;                  // 时长可能未知
    overview?: string | null;                 // 概述可能为空
    tagline?: string | null;                  // 宣传语可能为空
    genres?: string[] | string | null;                 // 类型列表
    cast?: string[] | string | null;                   // 主要演员列表 (仅名字)
    directors?: string[] | string | null;              // 导演列表 (仅名字)
    production_companies?: string[] | string | null;   // 制作公司列表 (仅名字)
    production_countries?: string[] | string | null;   // 制片国家/地区列表 (仅名字)
    poster_path?: string | null;              //海报路径可能为空
    budget?: number | null;                   // 预算可能为0或未知
    imdb_id?: string | null;                  // 已是可选且可空，保持
    tmdb_id?: string | number | null;         // 已是可选且可空，保持
}

export interface Stats {
    totalMovies: number;
    avgRating: string;
    highestRated?: {
        id: string;
        title: string;
        vote_average: string;
        release_date: string;
    };
    mostPopular?: {
        id: string;
        title: string;
        vote_count: string;
        release_date: string;
    };
    longestMovie?: {
        id: string;
        title: string;
        runtime: string;
        release_date: string;
    };
}

export interface BudgetRevenueData {
    budget_bucket: string;
    budget_bucket_end: string;
    avg_revenue: string;
    avg_roi: string;
    movie_count: number;
}

export interface RuntimeData {
    bucket_start: string;
    bucket_end: string;
    movie_count: number;
}

export interface ActorNode {
    id: string;
    name: string;
    value: number;
    symbolSize: number;
    category: number;
}

export interface ActorLink {
    source: string;
    target: string;
    value: number;
}

export interface ActorNetworkData {
    nodes: ActorNode[];
    links: ActorLink[];
    categories: { name: string }[];
}
