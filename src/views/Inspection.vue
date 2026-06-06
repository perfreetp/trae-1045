<template>
  <div class="inspection-page">
    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="计划名称">
          <el-input v-model="filterForm.name" placeholder="请输入计划名称" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="请选择状态" clearable style="width: 140px">
            <el-option label="进行中" value="进行中" />
            <el-option label="待开始" value="待开始" />
            <el-option label="已完成" value="已完成" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" @click="showCreateDialog = true">
            <el-icon><Plus /></el-icon>新建计划
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <el-table :data="plans" border stripe>
        <el-table-column prop="id" label="编号" width="80" />
        <el-table-column prop="name" label="计划名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="dept" label="责任部门" width="130" />
        <el-table-column label="计划周期" width="200">
          <template #default="{ row }">
            {{ row.startDate }} 至 {{ row.endDate }}
          </template>
        </el-table-column>
        <el-table-column label="任务进度" width="180">
          <template #default="{ row }">
            <el-progress :percentage="Math.round(row.completedCount / row.taskCount * 100)" />
            <span class="progress-text">{{ row.completedCount }}/{{ row.taskCount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleView(row)">查看</el-button>
            <el-button link type="primary" size="small" @click="handleAssignTask(row)">下发任务</el-button>
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="showCreateDialog" title="新建检查计划" width="700px">
      <el-form :model="planForm" label-width="100px">
        <el-form-item label="计划名称">
          <el-input v-model="planForm.name" placeholder="请输入计划名称" />
        </el-form-item>
        <el-form-item label="责任部门">
          <el-select v-model="planForm.dept" placeholder="请选择部门" style="width: 100%">
            <el-option label="市场监管局" value="市场监管局" />
            <el-option label="环保局" value="环保局" />
            <el-option label="住建局" value="住建局" />
            <el-option label="交通局" value="交通局" />
            <el-option label="应急管理局" value="应急管理局" />
          </el-select>
        </el-form-item>
        <el-form-item label="计划周期">
          <el-date-picker
            v-model="planForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="检查对象">
          <el-input v-model="planForm.targets" placeholder="请输入检查对象范围" />
        </el-form-item>
        <el-form-item label="检查内容">
          <el-input v-model="planForm.content" type="textarea" :rows="3" placeholder="请输入检查内容要点" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="handleCreate">创建</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showTaskDialog" title="下发检查任务" width="600px">
      <el-form :model="taskForm" label-width="100px">
        <el-form-item label="任务名称">
          <el-input v-model="taskForm.name" />
        </el-form-item>
        <el-form-item label="执行人员">
          <el-select v-model="taskForm.officer" placeholder="请选择执法人员" style="width: 100%">
            <el-option v-for="officer in officers" :key="officer.id" :label="`${officer.name} - ${officer.dept}`" :value="officer.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="截止日期">
          <el-date-picker v-model="taskForm.deadline" type="date" style="width: 100%" />
        </el-form-item>
        <el-form-item label="任务要求">
          <el-input v-model="taskForm.requirement" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showTaskDialog = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmTask">确认下发</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { inspectionPlans, enforcementOfficers } from '@/mock'
import { ElMessage } from 'element-plus'

const plans = ref([...inspectionPlans])
const officers = enforcementOfficers

const filterForm = reactive({
  name: '',
  status: ''
})

const planForm = reactive({
  name: '',
  dept: '',
  dateRange: [],
  targets: '',
  content: ''
})

const taskForm = reactive({
  name: '',
  officer: '',
  deadline: '',
  requirement: ''
})

const showCreateDialog = ref(false)
const showTaskDialog = ref(false)
const currentPlan = ref(null)

const getStatusType = (status) => {
  const map = {
    '进行中': 'primary',
    '待开始': 'warning',
    '已完成': 'success'
  }
  return map[status] || 'info'
}

const handleSearch = () => {
  ElMessage.success('查询成功')
}

const handleReset = () => {
  filterForm.name = ''
  filterForm.status = ''
}

const handleCreate = () => {
  ElMessage.success('检查计划创建成功')
  showCreateDialog.value = false
}

const handleView = (row) => {
  ElMessage.info(`查看计划：${row.name}`)
}

const handleAssignTask = (row) => {
  currentPlan.value = row
  taskForm.name = `${row.name} - 检查任务`
  showTaskDialog.value = true
}

const handleEdit = (row) => {
  ElMessage.info(`编辑计划：${row.name}`)
}

const handleConfirmTask = () => {
  ElMessage.success('任务下发成功')
  showTaskDialog.value = false
}
</script>

<style scoped>
.inspection-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.filter-card {
  border-radius: 8px;
}

.table-card {
  border-radius: 8px;
}

.progress-text {
  display: block;
  text-align: center;
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
</style>
