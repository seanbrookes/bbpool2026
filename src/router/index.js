import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'
import PosPage from '../pages/PosPage.vue'

const routes = [
  { path: '/',         component: HomePage },
  { path: '/pos/:pos', component: PosPage  },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
