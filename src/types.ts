export interface Movie {
    id: number;
    title: string;
    original_title: string;
    release_date: string;
    vote_average: number;
    vote_count?: number;
    revenue: number;
    runtime: number;
    overview: string;
    tagline: string;
    genres: string;
    cast: string;
    directors: string;
    production_companies: string;
    production_countries: string;
    poster_path: string;
    budget: number;
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