import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/',
    component: () => import('@/layout/index.vue'),
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '监督看板', icon: 'DataBoard' }
      },
      {
        path: 'inspection',
        name: 'Inspection',
        component: () => import('@/views/Inspection.vue'),
        meta: { title: '检查计划', icon: 'Calendar' }
      },
      {
        path: 'cases',
        name: 'Cases',
        component: () => import('@/views/Cases.vue'),
        meta: { title: '案件管理', icon: 'Document' }
      },
      {
        path: 'documents',
        name: 'Documents',
        component: () => import('@/views/Documents.vue'),
        meta: { title: '文书中心', icon: 'Files' }
      },
      {
        path: 'review',
        name: 'Review',
        component: () => import('@/views/Review.vue'),
        meta: { title: '法制审核', icon: 'Stamp' }
      },
      {
        path: 'complaints',
        name: 'Complaints',
        component: () => import('@/views/Complaints.vue'),
        meta: { title: '投诉举报', icon: 'Bell' }
      },
      {
        path: 'archives',
        name: 'Archives',
        component: () => import('@/views/Archives.vue'),
        meta: { title: '统计档案', icon: 'DataLine' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
