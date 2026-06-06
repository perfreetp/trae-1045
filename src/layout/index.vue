<template>
  <el-container class="layout-container">
    <el-aside width="240px" class="sidebar">
      <div class="logo">
        <el-icon size="28"><Coin /></el-icon>
        <span class="logo-text">行政执法监督平台</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        router
        background-color="#1f2937"
        text-color="#9ca3af"
        active-text-color="#ffffff"
        class="menu"
      >
        <el-menu-item v-for="route in menuRoutes" :key="route.path" :index="route.path">
          <el-icon><component :is="route.meta.icon" /></el-icon>
          <span>{{ route.meta.title }}</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <div class="header-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-badge :value="5" class="item">
            <el-button circle type="primary" :icon="Bell" />
          </el-badge>
          <el-dropdown>
            <span class="user-info">
              <el-avatar :size="36" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
              <span class="username">管理员</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人中心</el-dropdown-item>
                <el-dropdown-item>修改密码</el-dropdown-item>
                <el-dropdown-item divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  DataBoard, Calendar, Document, Files, Stamp, Bell, DataLine, Coin
} from '@element-plus/icons-vue'

const route = useRoute()
const activeMenu = computed(() => route.path)
const currentTitle = computed(() => route.meta.title || '')

const menuRoutes = [
  { path: '/dashboard', meta: { title: '监督看板', icon: DataBoard } },
  { path: '/inspection', meta: { title: '检查计划', icon: Calendar } },
  { path: '/cases', meta: { title: '案件管理', icon: Document } },
  { path: '/documents', meta: { title: '文书中心', icon: Files } },
  { path: '/review', meta: { title: '法制审核', icon: Stamp } },
  { path: '/complaints', meta: { title: '投诉举报', icon: Bell } },
  { path: '/archives', meta: { title: '统计档案', icon: DataLine } }
]
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.sidebar {
  background-color: #1f2937;
  overflow: hidden;
}

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #fff;
  border-bottom: 1px solid #374151;
}

.logo-text {
  font-size: 16px;
  font-weight: 600;
}

.menu {
  border-right: none;
}

.header {
  background-color: #fff;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.username {
  font-size: 14px;
  color: #374151;
}

.main-content {
  background-color: #f3f4f6;
  padding: 20px;
  overflow-y: auto;
}
</style>
