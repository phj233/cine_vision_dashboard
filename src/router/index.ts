import {createRouter, createWebHistory} from "vue-router";

const routes = [
    {
        path: '/',
        name: 'home',
        component: () => import('@/view/home/HomeView.vue')
    },
    {
        path: '/about',
        name: 'about',
        component: () => import('@/view/AboutView.vue')
    },
    {
        path: '/import',
        name: 'import',
        component: () => import('@/view/import/ImportView.vue')
    },
    {
        path: '/visualization',
        name: 'visualization',
        component: () => import('@/view/visualization/VisualizationView.vue')
    },
    {
        path: '/visualization/actors',
        name: 'actorNetwork',
        component: () => import('@/view/visualization/ActorNetworkView.vue')
    },
    {
        path: '/visualization/advanced',
        name: 'advancedVisualization',
        component: () => import('@/view/visualization/AdvancedVisualizationView.vue')
    }
];

export const router = createRouter({
    history: createWebHistory(),
    routes,
});
