<template>
  <div class="inspection-page">
    <el-card>
      <el-tabs v-model="activeTab" type="border-card">
        <el-tab-pane label="检查计划" name="plans">
          <div class="tab-content">
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
                <el-button type="success" @click="openCreateDialog">
                  <el-icon><Plus /></el-icon>新建计划
                </el-button>
              </el-form-item>
            </el-form>

            <el-table :data="filteredPlans" border stripe>
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
                  <el-progress :percentage="row.taskCount > 0 ? Math.round(row.completedCount / row.taskCount * 100) : 0" />
                  <span class="progress-text">{{ row.completedCount }}/{{ row.taskCount }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="getStatusType(row.status)" size="small">{{ row.status }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="280" fixed="right">
                <template #default="{ row }">
                  <el-button link type="primary" size="small" @click="handleView(row)">查看</el-button>
                  <el-button link type="primary" size="small" @click="handleAssignTask(row)">下发任务</el-button>
                  <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <el-tab-pane label="任务记录" name="tasks">
          <div class="tab-content">
            <el-form :inline="true" :model="taskFilterForm">
              <el-form-item label="计划名称">
                <el-select v-model="taskFilterForm.planId" placeholder="请选择计划" clearable style="width: 200px">
                  <el-option v-for="plan in allPlans" :key="plan.id" :label="plan.name" :value="plan.id" />
                </el-select>
              </el-form-item>
              <el-form-item label="执行人员">
                <el-select v-model="taskFilterForm.officerName" placeholder="请选择执行人员" clearable style="width: 160px">
                  <el-option v-for="officer in officers" :key="officer.id" :label="officer.name" :value="officer.name" />
                </el-select>
              </el-form-item>
              <el-form-item label="任务状态">
                <el-select v-model="taskFilterForm.status" placeholder="请选择状态" clearable style="width: 140px">
                  <el-option label="进行中" value="进行中" />
                  <el-option label="已完成" value="已完成" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleTaskSearch">查询</el-button>
                <el-button @click="handleTaskReset">重置</el-button>
              </el-form-item>
            </el-form>

            <el-table :data="filteredTasks" border stripe>
              <el-table-column prop="id" label="任务编号" width="140" />
              <el-table-column prop="name" label="任务名称" min-width="200" show-overflow-tooltip />
              <el-table-column prop="planName" label="所属计划" min-width="200" show-overflow-tooltip />
              <el-table-column prop="officerName" label="执行人" width="100" />
              <el-table-column prop="deadline" label="截止日期" width="120" />
              <el-table-column prop="createTime" label="创建时间" width="120" />
              <el-table-column prop="status" label="状态" width="100">
                <template #default="{ row }">
                  <el-tag size="small" :type="row.status === '已完成' ? 'success' : 'warning'">{{ row.status }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150" fixed="right">
                <template #default="{ row }">
                  <el-button link type="primary" size="small" @click="handleCompleteTask(row)" v-if="row.status === '进行中'">标记完成</el-button>
                  <el-button link type="primary" size="small" @click="handleViewTask(row)">查看详情</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>
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
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="任务数量">
          <el-input-number v-model="planForm.taskCount" :min="1" :max="100" />
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
        <el-button type="primary" @click="handleCreate">创建计划</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showViewDialog" title="计划详情" width="800px">
      <el-descriptions :column="2" border v-if="currentPlan">
        <el-descriptions-item label="计划编号">{{ currentPlan.id }}</el-descriptions-item>
        <el-descriptions-item label="计划名称">{{ currentPlan.name }}</el-descriptions-item>
        <el-descriptions-item label="责任部门">{{ currentPlan.dept }}</el-descriptions-item>
        <el-descriptions-item label="计划状态">
          <el-tag :type="getStatusType(currentPlan.status)">{{ currentPlan.status }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="计划周期">{{ currentPlan.startDate }} 至 {{ currentPlan.endDate }}</el-descriptions-item>
        <el-descriptions-item label="任务进度">{{ currentPlan.completedCount }}/{{ currentPlan.taskCount }}</el-descriptions-item>
        <el-descriptions-item label="检查对象" :span="2">{{ currentPlan.targets || '无' }}</el-descriptions-item>
        <el-descriptions-item label="检查内容" :span="2">{{ currentPlan.content || '无' }}</el-descriptions-item>
      </el-descriptions>
      <el-divider content-position="left">已下发任务</el-divider>
      <el-table :data="currentPlanTasks" border size="small">
        <el-table-column prop="id" label="任务编号" width="120" />
        <el-table-column prop="name" label="任务名称" />
        <el-table-column prop="officerName" label="执行人" width="100" />
        <el-table-column prop="deadline" label="截止日期" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag size="small" :type="row.status === '已完成' ? 'success' : 'warning'">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <el-dialog v-model="showEditDialog" title="编辑检查计划" width="700px">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="计划编号">
          <el-input v-model="editForm.id" disabled />
        </el-form-item>
        <el-form-item label="计划名称">
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item label="责任部门">
          <el-select v-model="editForm.dept" style="width: 100%">
            <el-option label="市场监管局" value="市场监管局" />
            <el-option label="环保局" value="环保局" />
            <el-option label="住建局" value="住建局" />
            <el-option label="交通局" value="交通局" />
            <el-option label="应急管理局" value="应急管理局" />
          </el-select>
        </el-form-item>
        <el-form-item label="计划状态">
          <el-select v-model="editForm.status" style="width: 100%">
            <el-option label="待开始" value="待开始" />
            <el-option label="进行中" value="进行中" />
            <el-option label="已完成" value="已完成" />
          </el-select>
        </el-form-item>
        <el-form-item label="计划周期">
          <el-date-picker
            v-model="editForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 100%"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="任务数量">
          <el-input-number v-model="editForm.taskCount" :min="1" :max="100" />
        </el-form-item>
        <el-form-item label="已完成数">
          <el-input-number v-model="editForm.completedCount" :min="0" :max="editForm.taskCount" />
        </el-form-item>
        <el-form-item label="检查对象">
          <el-input v-model="editForm.targets" />
        </el-form-item>
        <el-form-item label="检查内容">
          <el-input v-model="editForm.content" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSaveEdit">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showTaskDialog" title="下发检查任务" width="600px">
      <el-descriptions :column="1" border size="small" style="margin-bottom: 20px" v-if="currentPlan">
        <el-descriptions-item label="所属计划">{{ currentPlan.name }}</el-descriptions-item>
      </el-descriptions>
      <el-form :model="taskForm" label-width="100px">
        <el-form-item label="任务名称">
          <el-input v-model="taskForm.name" placeholder="请输入任务名称" />
        </el-form-item>
        <el-form-item label="执行人员">
          <el-select v-model="taskForm.officer" placeholder="请选择执法人员" style="width: 100%">
            <el-option v-for="officer in officers" :key="officer.id" :label="`${officer.name} - ${officer.dept}`" :value="officer" />
          </el-select>
        </el-form-item>
        <el-form-item label="截止日期">
          <el-date-picker v-model="taskForm.deadline" type="date" style="width: 100%" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="任务要求">
          <el-input v-model="taskForm.requirement" type="textarea" :rows="3" placeholder="请输入任务要求" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showTaskDialog = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmTask">确认下发</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showViewTaskDialog" title="任务详情" width="600px">
      <el-descriptions :column="1" border v-if="currentTask">
        <el-descriptions-item label="任务编号">{{ currentTask.id }}</el-descriptions-item>
        <el-descriptions-item label="任务名称">{{ currentTask.name }}</el-descriptions-item>
        <el-descriptions-item label="所属计划">{{ currentTask.planName }}</el-descriptions-item>
        <el-descriptions-item label="执行人">{{ currentTask.officerName }}</el-descriptions-item>
        <el-descriptions-item label="截止日期">{{ currentTask.deadline }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentTask.createTime }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag size="small" :type="currentTask.status === '已完成' ? 'success' : 'warning'">{{ currentTask.status }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="任务要求">{{ currentTask.requirement || '无' }}</el-descriptions-item>
        <el-descriptions-item label="完成时间" v-if="currentTask.status === '已完成'">{{ currentTask.completeTime || '-' }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="showViewTaskDialog = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showCompleteDialog" title="确认完成任务" width="500px">
      <el-alert
        title="确认将该任务标记为已完成？"
        type="warning"
        :closable="false"
        style="margin-bottom: 20px"
      />
      <el-descriptions :column="1" border v-if="currentTask">
        <el-descriptions-item label="任务编号">{{ currentTask.id }}</el-descriptions-item>
        <el-descriptions-item label="任务名称">{{ currentTask.name }}</el-descriptions-item>
        <el-descriptions-item label="执行人">{{ currentTask.officerName }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="showCompleteDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmCompleteTask">确认完成</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { inspectionPlans, enforcementOfficers } from '@/mock'
import { ElMessage } from 'element-plus'

const activeTab = ref('plans')
const allPlans = ref([...inspectionPlans])
const officers = enforcementOfficers
const planTasks = ref({})
const allTasks = ref([])

const filterForm = reactive({
  name: '',
  status: ''
})

const taskFilterForm = reactive({
  planId: '',
  officerName: '',
  status: ''
})

const filteredPlans = computed(() => {
  return allPlans.value.filter(item => {
    const matchName = !filterForm.name || item.name.includes(filterForm.name)
    const matchStatus = !filterForm.status || item.status === filterForm.status
    return matchName && matchStatus
  })
})

const filteredTasks = computed(() => {
  return allTasks.value.filter(item => {
    const matchPlan = !taskFilterForm.planId || item.planId === taskFilterForm.planId
    const matchOfficer = !taskFilterForm.officerName || item.officerName === taskFilterForm.officerName
    const matchStatus = !taskFilterForm.status || item.status === taskFilterForm.status
    return matchPlan && matchOfficer && matchStatus
  })
})

const planForm = reactive({
  name: '',
  dept: '',
  dateRange: [],
  taskCount: 10,
  targets: '',
  content: ''
})

const editForm = reactive({
  id: '',
  name: '',
  dept: '',
  status: '',
  dateRange: [],
  taskCount: 0,
  completedCount: 0,
  targets: '',
  content: ''
})

const taskForm = reactive({
  name: '',
  officer: null,
  deadline: '',
  requirement: ''
})

const showCreateDialog = ref(false)
const showViewDialog = ref(false)
const showEditDialog = ref(false)
const showTaskDialog = ref(false)
const showViewTaskDialog = ref(false)
const showCompleteDialog = ref(false)
const currentPlan = ref(null)
const currentPlanId = ref(null)
const currentTask = ref(null)

const currentPlanTasks = computed(() => {
  return planTasks.value[currentPlanId.value] || []
})

const getStatusType = (status) => {
  const map = {
    '进行中': 'primary',
    '待开始': 'warning',
    '已完成': 'success'
  }
  return map[status] || 'info'
}

const handleSearch = () => {
  ElMessage.success(`查询完成，共找到 ${filteredPlans.value.length} 条记录`)
}

const handleReset = () => {
  filterForm.name = ''
  filterForm.status = ''
  ElMessage.info('已重置筛选条件')
}

const openCreateDialog = () => {
  Object.assign(planForm, {
    name: '',
    dept: '',
    dateRange: [],
    taskCount: 10,
    targets: '',
    content: ''
  })
  showCreateDialog.value = true
}

const handleCreate = () => {
  if (!planForm.name || !planForm.dept || planForm.dateRange.length !== 2) {
    ElMessage.warning('请填写必填项（计划名称、责任部门、计划周期）')
    return
  }
  const newPlan = {
    id: allPlans.value.length + 1,
    name: planForm.name,
    dept: planForm.dept,
    startDate: planForm.dateRange[0],
    endDate: planForm.dateRange[1],
    taskCount: planForm.taskCount,
    completedCount: 0,
    targets: planForm.targets,
    content: planForm.content,
    status: '待开始'
  }
  allPlans.value.unshift(newPlan)
  planTasks.value[newPlan.id] = []
  ElMessage.success('检查计划创建成功')
  showCreateDialog.value = false
}

const handleView = (row) => {
  currentPlan.value = row
  currentPlanId.value = row.id
  showViewDialog.value = true
}

const handleEdit = (row) => {
  Object.assign(editForm, {
    id: row.id,
    name: row.name,
    dept: row.dept,
    status: row.status,
    dateRange: [row.startDate, row.endDate],
    taskCount: row.taskCount,
    completedCount: row.completedCount,
    targets: row.targets || '',
    content: row.content || ''
  })
  showEditDialog.value = true
}

const handleSaveEdit = () => {
  const index = allPlans.value.findIndex(item => item.id === editForm.id)
  if (index !== -1) {
    Object.assign(allPlans.value[index], {
      name: editForm.name,
      dept: editForm.dept,
      status: editForm.status,
      startDate: editForm.dateRange[0],
      endDate: editForm.dateRange[1],
      taskCount: editForm.taskCount,
      completedCount: editForm.completedCount,
      targets: editForm.targets,
      content: editForm.content
    })
    ElMessage.success('计划信息已更新')
    showEditDialog.value = false
  }
}

const handleAssignTask = (row) => {
  currentPlan.value = row
  currentPlanId.value = row.id
  Object.assign(taskForm, {
    name: `${row.name} - 检查任务`,
    officer: null,
    deadline: '',
    requirement: ''
  })
  showTaskDialog.value = true
}

const handleTaskSearch = () => {
  ElMessage.success(`查询完成，共找到 ${filteredTasks.value.length} 条任务记录`)
}

const handleTaskReset = () => {
  taskFilterForm.planId = ''
  taskFilterForm.officerName = ''
  taskFilterForm.status = ''
  ElMessage.info('已重置筛选条件')
}

const handleCompleteTask = (row) => {
  currentTask.value = row
  showCompleteDialog.value = true
}

const confirmCompleteTask = () => {
  if (currentTask.value) {
    const taskIndex = allTasks.value.findIndex(t => t.id === currentTask.value.id)
    if (taskIndex !== -1) {
      allTasks.value[taskIndex].status = '已完成'
      allTasks.value[taskIndex].completeTime = new Date().toISOString().slice(0, 10)
    }
    const planTaskIndex = planTasks.value[currentTask.value.planId]?.findIndex(t => t.id === currentTask.value.id)
    if (planTaskIndex !== -1 && planTaskIndex !== undefined) {
      planTasks.value[currentTask.value.planId][planTaskIndex].status = '已完成'
      planTasks.value[currentTask.value.planId][planTaskIndex].completeTime = new Date().toISOString().slice(0, 10)
    }
    const planIndex = allPlans.value.findIndex(p => p.id === currentTask.value.planId)
    if (planIndex !== -1) {
      allPlans.value[planIndex].completedCount = (allPlans.value[planIndex].completedCount || 0) + 1
      if (allPlans.value[planIndex].completedCount >= allPlans.value[planIndex].taskCount) {
        allPlans.value[planIndex].status = '已完成'
      }
    }
    ElMessage.success('任务已标记为完成，计划进度已同步更新')
    showCompleteDialog.value = false
  }
}

const handleViewTask = (row) => {
  currentTask.value = row
  showViewTaskDialog.value = true
}

const handleConfirmTask = () => {
  if (!taskForm.name || !taskForm.officer || !taskForm.deadline) {
    ElMessage.warning('请填写任务名称、执行人员和截止日期')
    return
  }
  if (!planTasks.value[currentPlanId.value]) {
    planTasks.value[currentPlanId.value] = []
  }
  const taskId = `RW${currentPlanId.value}-${String(planTasks.value[currentPlanId.value].length + 1).padStart(3, '0')}`
  const planName = currentPlan.value?.name || ''
  const newTask = {
    id: taskId,
    planId: currentPlanId.value,
    planName: planName,
    name: taskForm.name,
    officerId: taskForm.officer.id,
    officerName: taskForm.officer.name,
    deadline: taskForm.deadline,
    requirement: taskForm.requirement,
    status: '进行中',
    createTime: new Date().toISOString().slice(0, 10)
  }
  planTasks.value[currentPlanId.value].push(newTask)
  allTasks.value.push(newTask)
  ElMessage.success('任务下发成功！可在"查看"或"任务记录"中查看任务列表')
  showTaskDialog.value = false
}
</script>

<style scoped>
.inspection-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.tab-content {
  padding: 10px 0;
}

.tab-content .el-form {
  margin-bottom: 20px;
}

.progress-text {
  display: block;
  text-align: center;
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
</style>
