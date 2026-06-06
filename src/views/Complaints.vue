<template>
  <div class="complaints-page">
    <el-card>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="投诉举报列表" name="list">
          <div class="toolbar">
            <el-form :inline="true" :model="filterForm">
              <el-form-item label="类型">
                <el-select v-model="filterForm.type" placeholder="请选择" clearable style="width: 140px">
                  <el-option label="执法行为投诉" value="执法行为投诉" />
                  <el-option label="违法线索举报" value="违法线索举报" />
                  <el-option label="行政复议申请" value="行政复议申请" />
                  <el-option label="履职投诉" value="履职投诉" />
                </el-select>
              </el-form-item>
              <el-form-item label="状态">
                <el-select v-model="filterForm.status" placeholder="请选择" clearable style="width: 140px">
                  <el-option label="已受理" value="已受理" />
                  <el-option label="处理中" value="处理中" />
                  <el-option label="已办结" value="已办结" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleSearch">查询</el-button>
                <el-button @click="handleReset">重置</el-button>
              </el-form-item>
            </el-form>
            <el-button type="success" @click="openCreateDialog">
              <el-icon><Plus /></el-icon>登记投诉
            </el-button>
          </div>
          <el-table :data="filteredComplaints" border stripe>
            <el-table-column type="index" label="序号" width="60" />
            <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
            <el-table-column prop="complainant" label="投诉人" width="100" />
            <el-table-column prop="type" label="类型" width="130" />
            <el-table-column prop="dept" label="承办部门" width="120">
              <template #default="{ row }">
                {{ row.dept || '未分配' }}
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="登记时间" width="160" />
            <el-table-column prop="handler" label="经办人" width="100" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="statusType(row.status)" size="small">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="280" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="handleView(row)">查看</el-button>
                <el-button link type="primary" size="small" @click="handleProcess(row)">处理</el-button>
                <el-button link type="primary" size="small" @click="handleTransfer(row)">转办</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="复议诉讼登记" name="litigation">
          <div class="toolbar">
            <el-button type="success" @click="openLitigationDialog">
              <el-icon><Plus /></el-icon>新增登记
            </el-button>
          </div>
          <el-table :data="litigations" border stripe>
            <el-table-column prop="caseId" label="关联案件" width="140" />
            <el-table-column prop="caseTitle" label="案件名称" min-width="200" />
            <el-table-column prop="applicant" label="申请人/原告" width="150" />
            <el-table-column prop="type" label="类型" width="100">
              <template #default="{ row }">
                <el-tag :type="row.type === '行政复议' ? 'primary' : 'warning'" size="small">
                  {{ row.type }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="acceptDate" label="受理日期" width="120" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag size="small">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="220">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="handleViewLitigation(row)">详情</el-button>
                <el-button link type="primary" size="small" @click="handleUpdateLitigationStatus(row)">更新状态</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="全过程留痕" name="trace">
          <el-timeline>
            <el-timeline-item
              v-for="(activity, index) in activities"
              :key="index"
              :timestamp="activity.timestamp"
              :type="activity.type"
            >
              <el-card>
                <h4>{{ activity.title }}</h4>
                <p>{{ activity.content }}</p>
                <p class="trace-meta">操作人：{{ activity.operator }} · IP：{{ activity.ip }}</p>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-dialog v-model="showCreateDialog" title="登记投诉举报" width="700px">
      <el-form :model="complaintForm" label-width="100px">
        <el-form-item label="举报类型">
          <el-radio-group v-model="complaintForm.type">
            <el-radio label="执法行为投诉">执法行为投诉</el-radio>
            <el-radio label="违法线索举报">违法线索举报</el-radio>
            <el-radio label="行政复议申请">行政复议申请</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="标题">
          <el-input v-model="complaintForm.title" placeholder="请简要描述" />
        </el-form-item>
        <el-form-item label="投诉人">
          <el-input v-model="complaintForm.complainant" placeholder="请输入姓名（可匿名）" />
        </el-form-item>
        <el-form-item label="联系方式">
          <el-input v-model="complaintForm.contact" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="经办人">
          <el-input v-model="complaintForm.handler" placeholder="请输入经办人" />
        </el-form-item>
        <el-form-item label="投诉内容">
          <el-input v-model="complaintForm.content" type="textarea" :rows="5" placeholder="请详细描述投诉内容" />
        </el-form-item>
        <el-form-item label="相关证据">
          <el-upload
            action="#"
            :auto-upload="false"
            multiple
          >
            <el-button type="primary">
              <el-icon><Upload /></el-icon>上传附件
            </el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="handleCreate">提交登记</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showViewDialog" title="投诉详情" width="800px">
      <el-descriptions :column="2" border v-if="currentComplaint">
        <el-descriptions-item label="标题" :span="2">{{ currentComplaint.title }}</el-descriptions-item>
        <el-descriptions-item label="类型">{{ currentComplaint.type }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="statusType(currentComplaint.status)">{{ currentComplaint.status }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="投诉人">{{ currentComplaint.complainant }}</el-descriptions-item>
        <el-descriptions-item label="承办部门">{{ currentComplaint.dept || '未分配' }}</el-descriptions-item>
        <el-descriptions-item label="经办人">{{ currentComplaint.handler }}</el-descriptions-item>
        <el-descriptions-item label="登记时间">{{ currentComplaint.createTime }}</el-descriptions-item>
        <el-descriptions-item label="联系方式">{{ currentComplaint.contact || '无' }}</el-descriptions-item>
        <el-descriptions-item label="处理意见" :span="2">{{ currentComplaint.opinion || '暂无' }}</el-descriptions-item>
        <el-descriptions-item label="投诉内容" :span="2">{{ currentComplaint.content }}</el-descriptions-item>
      </el-descriptions>
      <el-divider content-position="left">处理轨迹</el-divider>
      <el-timeline>
        <el-timeline-item
          v-for="(item, index) in currentTraces"
          :key="index"
          :timestamp="item.time"
          :type="item.type || 'primary'"
          size="large"
        >
          <el-card shadow="hover">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px">
              <strong>{{ item.action }}</strong>
              <el-tag size="small" type="info">{{ item.operator }}</el-tag>
            </div>
            <div style="color: #606266; font-size: 13px">{{ item.content }}</div>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </el-dialog>

    <el-dialog v-model="showProcessDialog" title="处理投诉" width="600px">
      <el-descriptions :column="1" border size="small" style="margin-bottom: 20px" v-if="currentComplaint">
        <el-descriptions-item label="当前投诉">{{ currentComplaint.title }}</el-descriptions-item>
        <el-descriptions-item label="当前状态">
          <el-tag :type="statusType(currentComplaint.status)">{{ currentComplaint.status }}</el-tag>
        </el-descriptions-item>
      </el-descriptions>
      <el-form :model="processForm" label-width="100px">
        <el-form-item label="处理状态">
          <el-select v-model="processForm.status" style="width: 100%">
            <el-option label="已受理" value="已受理" />
            <el-option label="处理中" value="处理中" />
            <el-option label="已办结" value="已办结" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理意见">
          <el-input v-model="processForm.opinion" type="textarea" :rows="5" placeholder="请输入处理意见" />
        </el-form-item>
        <el-form-item label="是否回复">
          <el-switch v-model="processForm.reply" />
        </el-form-item>
        <el-form-item label="回复内容" v-if="processForm.reply">
          <el-input v-model="processForm.replyContent" type="textarea" :rows="3" placeholder="请输入回复内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showProcessDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitProcess">提交</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showTransferDialog" title="转办投诉" width="500px">
      <el-descriptions :column="1" border size="small" style="margin-bottom: 20px" v-if="currentComplaint">
        <el-descriptions-item label="当前投诉">{{ currentComplaint.title }}</el-descriptions-item>
      </el-descriptions>
      <el-form :model="transferForm" label-width="100px">
        <el-form-item label="转办至">
          <el-select v-model="transferForm.toDept" style="width: 100%" placeholder="请选择部门">
            <el-option label="市场监管局" value="市场监管局" />
            <el-option label="环保局" value="环保局" />
            <el-option label="住建局" value="住建局" />
            <el-option label="交通局" value="交通局" />
            <el-option label="公安局" value="公安局" />
          </el-select>
        </el-form-item>
        <el-form-item label="转办说明">
          <el-input v-model="transferForm.remark" type="textarea" :rows="3" placeholder="请输入转办说明" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showTransferDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitTransfer">确认转办</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showLitigationDialog" title="新增复议诉讼登记" width="700px">
      <el-form :model="litigationForm" label-width="120px">
        <el-form-item label="类型">
          <el-radio-group v-model="litigationForm.type">
            <el-radio label="行政复议">行政复议</el-radio>
            <el-radio label="行政诉讼">行政诉讼</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="关联案件">
          <el-select v-model="litigationForm.caseId" placeholder="请选择案件" style="width: 100%">
            <el-option label="AJ202606001 某超市销售过期食品案" value="AJ202606001" />
            <el-option label="AJ202606002 某企业违法排放污水案" value="AJ202606002" />
            <el-option label="AJ202605089 某公司未经许可经营" value="AJ202605089" />
          </el-select>
        </el-form-item>
        <el-form-item label="案件名称">
          <el-input v-model="litigationForm.caseTitle" placeholder="请输入案件名称" />
        </el-form-item>
        <el-form-item label="申请人/原告">
          <el-input v-model="litigationForm.applicant" placeholder="请输入申请人或原告" />
        </el-form-item>
        <el-form-item label="受理日期">
          <el-date-picker v-model="litigationForm.acceptDate" type="date" style="width: 100%" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="当前状态">
          <el-select v-model="litigationForm.status" style="width: 100%">
            <el-option label="已受理" value="已受理" />
            <el-option label="审理中" value="审理中" />
            <el-option label="已开庭" value="已开庭" />
            <el-option label="已判决" value="已判决" />
            <el-option label="已结案" value="已结案" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注说明">
          <el-input v-model="litigationForm.remark" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showLitigationDialog = false">取消</el-button>
        <el-button type="primary" @click="handleCreateLitigation">提交登记</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showLitigationViewDialog" title="复议诉讼详情" width="700px">
      <el-descriptions :column="2" border v-if="currentLitigation">
        <el-descriptions-item label="类型">
          <el-tag :type="currentLitigation.type === '行政复议' ? 'primary' : 'warning'">{{ currentLitigation.type }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="状态">{{ currentLitigation.status }}</el-descriptions-item>
        <el-descriptions-item label="关联案件">{{ currentLitigation.caseId }}</el-descriptions-item>
        <el-descriptions-item label="申请人/原告">{{ currentLitigation.applicant }}</el-descriptions-item>
        <el-descriptions-item label="案件名称" :span="2">{{ currentLitigation.caseTitle }}</el-descriptions-item>
        <el-descriptions-item label="受理日期">{{ currentLitigation.acceptDate }}</el-descriptions-item>
        <el-descriptions-item label="备注说明" :span="2">{{ currentLitigation.remark || '无' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <el-dialog v-model="showUpdateStatusDialog" title="更新状态" width="500px">
      <el-descriptions :column="1" border size="small" style="margin-bottom: 20px" v-if="currentLitigation">
        <el-descriptions-item label="案件">{{ currentLitigation.caseTitle }}</el-descriptions-item>
        <el-descriptions-item label="当前状态">{{ currentLitigation.status }}</el-descriptions-item>
      </el-descriptions>
      <el-form :model="statusForm" label-width="100px">
        <el-form-item label="新状态">
          <el-select v-model="statusForm.newStatus" style="width: 100%">
            <el-option label="已受理" value="已受理" />
            <el-option label="审理中" value="审理中" />
            <el-option label="已开庭" value="已开庭" />
            <el-option label="已判决" value="已判决" />
            <el-option label="已结案" value="已结案" />
          </el-select>
        </el-form-item>
        <el-form-item label="更新说明">
          <el-input v-model="statusForm.remark" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showUpdateStatusDialog = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmUpdateStatus">确认更新</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Plus, Upload } from '@element-plus/icons-vue'
import { complaintsList, litigationList } from '@/mock'
import { ElMessage } from 'element-plus'

const activeTab = ref('list')
const allComplaints = ref([...complaintsList])
const allLitigations = ref([...litigationList])
const complaintTraces = ref({})

const filterForm = reactive({
  type: '',
  status: ''
})

const filteredComplaints = computed(() => {
  return allComplaints.value.filter(item => {
    const matchType = !filterForm.type || item.type === filterForm.type
    const matchStatus = !filterForm.status || item.status === filterForm.status
    return matchType && matchStatus
  })
})

const currentTraces = computed(() => {
  if (!currentComplaint.value) return []
  return complaintTraces.value[currentComplaint.value.id] || []
})

const addTrace = (complaintId, action, content, operator = '系统管理员', type = 'primary') => {
  if (!complaintTraces.value[complaintId]) {
    complaintTraces.value[complaintId] = []
  }
  const now = new Date()
  const timeStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`
  complaintTraces.value[complaintId].unshift({
    action,
    content,
    operator,
    time: timeStr,
    type
  })
}

const initComplaintTraces = () => {
  allComplaints.value.forEach(c => {
    if (!complaintTraces.value[c.id]) {
      addTrace(c.id, '投诉登记', `投诉「${c.title}」已登记，投诉人：${c.complainant}，类型：${c.type}`, c.handler || '系统管理员', 'success')
    }
  })
}
initComplaintTraces()

const filteredLitigations = computed(() => allLitigations.value)

const complaintForm = reactive({
  type: '执法行为投诉',
  title: '',
  complainant: '',
  contact: '',
  handler: '',
  content: ''
})

const processForm = reactive({
  status: '',
  opinion: '',
  reply: false,
  replyContent: ''
})

const transferForm = reactive({
  toDept: '',
  remark: ''
})

const litigationForm = reactive({
  type: '行政复议',
  caseId: '',
  caseTitle: '',
  applicant: '',
  acceptDate: '',
  status: '已受理',
  remark: ''
})

const statusForm = reactive({
  newStatus: '',
  remark: ''
})

const activities = ref([
  {
    timestamp: '2026-06-05 16:30:25',
    title: '创建投诉记录',
    content: '登记了一条新的投诉举报：反映执法人员态度恶劣',
    operator: '刘主任',
    ip: '192.168.1.100',
    type: 'primary'
  },
  {
    timestamp: '2026-06-05 15:20:10',
    title: '案件流转',
    content: '案件AJ202606002流转至法制审核环节',
    operator: '李四',
    ip: '192.168.1.105',
    type: 'success'
  },
  {
    timestamp: '2026-06-05 14:15:33',
    title: '上传证据',
    content: '案件AJ202606001上传了现场照片3张',
    operator: '张三',
    ip: '192.168.1.102',
    type: ''
  },
  {
    timestamp: '2026-06-05 10:30:00',
    title: '修改案件信息',
    content: '修改了案件AJ202606003的处罚金额',
    operator: '王五',
    ip: '192.168.1.103',
    type: 'warning'
  },
  {
    timestamp: '2026-06-04 17:45:20',
    title: '文书签发',
    content: '行政处罚决定书（某某超市）已签发',
    operator: '李审核员',
    ip: '192.168.1.101',
    type: 'success'
  }
])

const showCreateDialog = ref(false)
const showViewDialog = ref(false)
const showProcessDialog = ref(false)
const showTransferDialog = ref(false)
const showLitigationDialog = ref(false)
const showLitigationViewDialog = ref(false)
const showUpdateStatusDialog = ref(false)
const currentComplaint = ref(null)
const currentLitigation = ref(null)

const complaints = filteredComplaints
const litigations = filteredLitigations

const statusType = (status) => {
  const map = { '已受理': 'info', '处理中': 'primary', '已办结': 'success' }
  return map[status] || 'info'
}

const handleSearch = () => {
  ElMessage.success(`查询完成，共找到 ${filteredComplaints.value.length} 条记录`)
}

const handleReset = () => {
  filterForm.type = ''
  filterForm.status = ''
  ElMessage.info('已重置筛选条件')
}

const openCreateDialog = () => {
  Object.assign(complaintForm, {
    type: '执法行为投诉',
    title: '',
    complainant: '',
    contact: '',
    handler: '',
    content: ''
  })
  showCreateDialog.value = true
}

const handleCreate = () => {
  if (!complaintForm.title) {
    ElMessage.warning('请填写标题')
    return
  }
  const newComplaint = {
    id: allComplaints.value.length + 1,
    title: complaintForm.title,
    complainant: complaintForm.complainant || '匿名',
    type: complaintForm.type,
    contact: complaintForm.contact,
    dept: '',
    handler: complaintForm.handler || '待分配',
    content: complaintForm.content,
    status: '已受理',
    opinion: '',
    createTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
  }
  allComplaints.value.unshift(newComplaint)
  addTrace(newComplaint.id, '投诉登记', `投诉「${newComplaint.title}」已登记，投诉人：${newComplaint.complainant}，类型：${newComplaint.type}`, newComplaint.handler, 'success')
  ElMessage.success('投诉举报登记成功')
  showCreateDialog.value = false
}

const handleView = (row) => {
  currentComplaint.value = row
  showViewDialog.value = true
}

const handleProcess = (row) => {
  currentComplaint.value = row
  Object.assign(processForm, {
    status: row.status,
    opinion: '',
    reply: false,
    replyContent: ''
  })
  showProcessDialog.value = true
}

const handleTransfer = (row) => {
  currentComplaint.value = row
  Object.assign(transferForm, { toDept: '', remark: '' })
  showTransferDialog.value = true
}

const handleSubmitProcess = () => {
  if (currentComplaint.value) {
    const oldStatus = currentComplaint.value.status
    currentComplaint.value.status = processForm.status
    currentComplaint.value.opinion = processForm.opinion
    const index = allComplaints.value.findIndex(c => c.id === currentComplaint.value.id)
    if (index !== -1) {
      allComplaints.value[index].status = processForm.status
      allComplaints.value[index].opinion = processForm.opinion
    }
    const action = processForm.status === '已办结' ? '投诉办结' : '处理投诉'
    const type = processForm.status === '已办结' ? 'success' : 'primary'
    addTrace(currentComplaint.value.id, action, 
      `状态从「${oldStatus}」变更为「${processForm.status}」，处理意见：${processForm.opinion || '无'}${processForm.reply ? `，已回复：${processForm.replyContent}` : ''}`, 
      currentComplaint.value.handler || '系统管理员', type)
  }
  ElMessage.success('处理意见已提交')
  showProcessDialog.value = false
}

const handleSubmitTransfer = () => {
  if (!transferForm.toDept) {
    ElMessage.warning('请选择转办部门')
    return
  }
  if (currentComplaint.value) {
    const oldDept = currentComplaint.value.dept || '未分配'
    currentComplaint.value.dept = transferForm.toDept
    currentComplaint.value.status = '处理中'
    const index = allComplaints.value.findIndex(c => c.id === currentComplaint.value.id)
    if (index !== -1) {
      allComplaints.value[index].dept = transferForm.toDept
      allComplaints.value[index].status = '处理中'
    }
    addTrace(currentComplaint.value.id, '投诉转办', 
      `从「${oldDept}」转办至「${transferForm.toDept}」，转办说明：${transferForm.remark || '无'}`, 
      currentComplaint.value.handler || '系统管理员', 'warning')
  }
  ElMessage.success(`已转办至${transferForm.toDept}`)
  showTransferDialog.value = false
}

const openLitigationDialog = () => {
  Object.assign(litigationForm, {
    type: '行政复议',
    caseId: '',
    caseTitle: '',
    applicant: '',
    acceptDate: '',
    status: '已受理',
    remark: ''
  })
  showLitigationDialog.value = true
}

const handleCreateLitigation = () => {
  if (!litigationForm.caseTitle || !litigationForm.applicant) {
    ElMessage.warning('请填写案件名称和申请人')
    return
  }
  const newLitigation = {
    id: allLitigations.value.length + 1,
    caseId: litigationForm.caseId || '无',
    caseTitle: litigationForm.caseTitle,
    applicant: litigationForm.applicant,
    type: litigationForm.type,
    acceptDate: litigationForm.acceptDate || new Date().toISOString().slice(0, 10),
    status: litigationForm.status,
    remark: litigationForm.remark
  }
  allLitigations.value.unshift(newLitigation)
  ElMessage.success('复议诉讼登记成功')
  showLitigationDialog.value = false
}

const handleViewLitigation = (row) => {
  currentLitigation.value = row
  showLitigationViewDialog.value = true
}

const handleUpdateLitigationStatus = (row) => {
  currentLitigation.value = row
  Object.assign(statusForm, { newStatus: row.status, remark: '' })
  showUpdateStatusDialog.value = true
}

const handleConfirmUpdateStatus = () => {
  if (currentLitigation.value && statusForm.newStatus) {
    currentLitigation.value.status = statusForm.newStatus
    const index = allLitigations.value.findIndex(l => l.id === currentLitigation.value.id)
    if (index !== -1) {
      allLitigations.value[index].status = statusForm.newStatus
    }
    ElMessage.success('状态已更新')
    showUpdateStatusDialog.value = false
  }
}
</script>

<style scoped>
.complaints-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.trace-meta {
  font-size: 12px;
  color: #909399;
  margin: 8px 0 0 0;
}

h4 {
  margin: 0 0 8px 0;
}

p {
  margin: 0;
  color: #606266;
}
</style>
