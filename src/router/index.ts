import {createRouter, createWebHistory} from "vue-router";
import HomeView from "../view/home/HomeView.vue";
import ImportView from "../view/import/ImportView.vue";
import AboutView from "../view/AboutView.vue";
import VisualizationView from "../view/visualization/VisualizationView.vue";
import ActorNetworkView from "../view/visualization/ActorNetworkView.vue";
import AdvancedVisualizationView from "../view/visualization/AdvancedVisualizationView.vue";

const routes = [
    { path: '/', name: 'home', component: HomeView },
    { path: '/about', name: 'about', component: AboutView },
    { path: '/import', name: 'import', component: ImportView },
    { path: '/visualization', name: 'visualization', component: VisualizationView },
    { path: '/visualization/actors', name: 'actorNetwork', component: ActorNetworkView },
    { path: '/visualization/advanced', name: 'advancedVisualization', component: AdvancedVisualizationView }
]

export const router = createRouter({
    history: createWebHistory(),
    routes,
})
