<template>
  <div class="cases-page">
    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="案件编号">
          <el-input v-model="filterForm.id" placeholder="请输入案件编号" clearable style="width: 160px" />
        </el-form-item>
        <el-form-item label="案件类型">
          <el-select v-model="filterForm.type" placeholder="请选择" clearable style="width: 140px">
            <el-option label="行政处罚" value="行政处罚" />
            <el-option label="行政强制" value="行政强制" />
            <el-option label="行政许可" value="行政许可" />
            <el-option label="行政检查" value="行政检查" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="请选择" clearable style="width: 140px">
            <el-option label="立案" value="立案" />
            <el-option label="调查中" value="调查中" />
            <el-option label="法制审核" value="法制审核" />
            <el-option label="待执行" value="待执行" />
            <el-option label="已结案" value="已结案" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" @click="openCreateDialog">
            <el-icon><Plus /></el-icon>新建案件
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <el-table :data="filteredCases" border stripe>
        <el-table-column prop="id" label="案件编号" width="140" />
        <el-table-column prop="title" label="案件名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="type" label="类型" width="100" />
        <el-table-column prop="dept" label="承办部门" width="120" />
        <el-table-column prop="handler" label="承办人" width="80" />
        <el-table-column label="处罚金额" width="100">
          <template #default="{ row }">
            <span v-if="row.amount">¥{{ row.amount }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="立案时间" width="110" />
        <el-table-column label="操作" width="360" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleView(row)">详情</el-button>
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="primary" size="small" @click="handleFlow(row)">流转</el-button>
            <el-button link type="primary" size="small" @click="handleRecord(row)">现场记录</el-button>
            <el-button link type="primary" size="small" @click="handleEvidence(row)">证据</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="showCreateDialog" title="新建案件" width="700px">
      <el-form :model="createForm" label-width="100px" ref="createFormRef">
        <el-form-item label="案件名称" prop="title" rules="[{ required: true, message: '请输入案件名称', trigger: 'blur' }]">
          <el-input v-model="createForm.title" placeholder="请输入案件名称" />
        </el-form-item>
        <el-form-item label="案件类型" prop="type" rules="[{ required: true, message: '请选择案件类型', trigger: 'change' }]">
          <el-select v-model="createForm.type" placeholder="请选择" style="width: 100%">
            <el-option label="行政处罚" value="行政处罚" />
            <el-option label="行政强制" value="行政强制" />
            <el-option label="行政许可" value="行政许可" />
            <el-option label="行政检查" value="行政检查" />
          </el-select>
        </el-form-item>
        <el-form-item label="承办部门" prop="dept" rules="[{ required: true, message: '请选择承办部门', trigger: 'change' }]">
          <el-select v-model="createForm.dept" placeholder="请选择" style="width: 100%">
            <el-option label="市场监管局" value="市场监管局" />
            <el-option label="环保局" value="环保局" />
            <el-option label="住建局" value="住建局" />
            <el-option label="交通局" value="交通局" />
            <el-option label="应急管理局" value="应急管理局" />
            <el-option label="公安局" value="公安局" />
          </el-select>
        </el-form-item>
        <el-form-item label="承办人" prop="handler" rules="[{ required: true, message: '请输入承办人', trigger: 'blur' }]">
          <el-input v-model="createForm.handler" placeholder="请输入承办人姓名" />
        </el-form-item>
        <el-form-item label="当事人">
          <el-input v-model="createForm.party" placeholder="请输入当事人" />
        </el-form-item>
        <el-form-item label="处罚金额">
          <el-input-number v-model="createForm.amount" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="案件描述">
          <el-input v-model="createForm.description" type="textarea" :rows="3" placeholder="请输入案件描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="handleCreate">提交立案</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showEditDialog" title="编辑案件" width="700px">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="案件编号">
          <el-input v-model="editForm.id" disabled />
        </el-form-item>
        <el-form-item label="案件名称">
          <el-input v-model="editForm.title" />
        </el-form-item>
        <el-form-item label="案件类型">
          <el-select v-model="editForm.type" style="width: 100%">
            <el-option label="行政处罚" value="行政处罚" />
            <el-option label="行政强制" value="行政强制" />
            <el-option label="行政许可" value="行政许可" />
            <el-option label="行政检查" value="行政检查" />
          </el-select>
        </el-form-item>
        <el-form-item label="承办部门">
          <el-select v-model="editForm.dept" style="width: 100%">
            <el-option label="市场监管局" value="市场监管局" />
            <el-option label="环保局" value="环保局" />
            <el-option label="住建局" value="住建局" />
            <el-option label="交通局" value="交通局" />
            <el-option label="应急管理局" value="应急管理局" />
            <el-option label="公安局" value="公安局" />
          </el-select>
        </el-form-item>
        <el-form-item label="承办人">
          <el-input v-model="editForm.handler" />
        </el-form-item>
        <el-form-item label="当事人">
          <el-input v-model="editForm.party" />
        </el-form-item>
        <el-form-item label="处罚金额">
          <el-input-number v-model="editForm.amount" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="案件状态">
          <el-select v-model="editForm.status" style="width: 100%">
            <el-option label="立案" value="立案" />
            <el-option label="调查中" value="调查中" />
            <el-option label="法制审核" value="法制审核" />
            <el-option label="待执行" value="待执行" />
            <el-option label="已结案" value="已结案" />
          </el-select>
        </el-form-item>
        <el-form-item label="案件描述">
          <el-input v-model="editForm.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSaveEdit">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showDetailDialog" title="案件详情" width="900px">
      <el-descriptions :column="2" border v-if="currentCase">
        <el-descriptions-item label="案件编号">{{ currentCase.id }}</el-descriptions-item>
        <el-descriptions-item label="案件名称">{{ currentCase.title }}</el-descriptions-item>
        <el-descriptions-item label="案件类型">{{ currentCase.type }}</el-descriptions-item>
        <el-descriptions-item label="承办部门">{{ currentCase.dept }}</el-descriptions-item>
        <el-descriptions-item label="承办人">{{ currentCase.handler }}</el-descriptions-item>
        <el-descriptions-item label="立案时间">{{ currentCase.createTime }}</el-descriptions-item>
        <el-descriptions-item label="当事人">{{ currentCase.party || '-' }}</el-descriptions-item>
        <el-descriptions-item label="处罚金额" v-if="currentCase.amount">¥{{ currentCase.amount }}</el-descriptions-item>
        <el-descriptions-item label="案件状态">
          <el-tag :type="getStatusType(currentCase.status)">{{ currentCase.status }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="案件描述" :span="2">{{ currentCase.description || '暂无描述' }}</el-descriptions-item>
      </el-descriptions>
      <el-divider content-position="left">案件流转记录</el-divider>
      <el-steps :active="getStepIndex(currentCase.status)" finish-status="success" simple>
        <el-step title="立案" :description="currentCase?.createTime || '2026-06-05'" />
        <el-step title="调查取证" description="进行中" />
        <el-step title="法制审核" description="待完成" />
        <el-step title="作出决定" description="待完成" />
        <el-step title="结案归档" description="待完成" />
      </el-steps>
    </el-dialog>

    <el-dialog v-model="showRecordDialog" title="现场检查记录" width="800px">
      <div v-if="currentCaseRecord" class="record-info">
        <el-alert title="已有现场记录，将更新内容" type="info" :closable="false" style="margin-bottom: 20px" v-if="hasRecord" />
      </div>
      <el-form :model="recordForm" label-width="100px">
        <el-form-item label="检查时间">
          <el-date-picker v-model="recordForm.time" type="datetime" style="width: 100%" value-format="YYYY-MM-DD HH:mm:ss" />
        </el-form-item>
        <el-form-item label="检查地点">
          <el-input v-model="recordForm.location" placeholder="请输入检查地点" />
        </el-form-item>
        <el-form-item label="被检查人">
          <el-input v-model="recordForm.target" placeholder="请输入被检查人" />
        </el-form-item>
        <el-form-item label="执法人员">
          <el-select v-model="recordForm.officers" multiple placeholder="请选择执法人员" style="width: 100%">
            <el-option v-for="officer in officers" :key="officer.id" :label="officer.name" :value="officer.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="检查情况">
          <el-input v-model="recordForm.content" type="textarea" :rows="5" placeholder="请输入现场检查情况" />
        </el-form-item>
        <el-form-item label="现场照片">
          <el-upload
            action="#"
            list-type="picture-card"
            :auto-upload="false"
            :on-preview="handlePicturePreview"
            :on-remove="handleRemove"
            :file-list="recordForm.photos"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showRecordDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSaveRecord">保存记录</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showEvidenceDialog" title="证据上传" width="700px">
      <el-upload
        class="upload-demo"
        drag
        action="#"
        :auto-upload="false"
        multiple
        :on-change="handleEvidenceChange"
        :file-list="currentEvidenceFileList"
      >
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
        <div class="el-upload__text">
          将证据文件拖到此处，或<em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            支持图片、文档、音视频等格式，单个文件不超过 50MB
          </div>
        </template>
      </el-upload>
      <el-table :data="currentEvidenceList" style="margin-top: 20px" border>
        <el-table-column prop="name" label="证据名称" />
        <el-table-column prop="type" label="类型" width="100" />
        <el-table-column prop="uploadTime" label="上传时间" width="160" />
        <el-table-column label="操作" width="150">
          <template #default="{ row, $index }">
            <el-button link type="primary" size="small" @click="handleDownloadEvidence(row)">下载</el-button>
            <el-button link type="danger" size="small" @click="handleDeleteEvidence($index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <el-dialog v-model="showFlowDialog" title="案件流转" width="600px">
      <el-descriptions :column="1" border v-if="currentCase" style="margin-bottom: 20px">
        <el-descriptions-item label="当前案件">{{ currentCase.id }} - {{ currentCase.title }}</el-descriptions-item>
        <el-descriptions-item label="当前状态">
          <el-tag :type="getStatusType(currentCase.status)">{{ currentCase.status }}</el-tag>
        </el-descriptions-item>
      </el-descriptions>
      <el-form :model="flowForm" label-width="100px">
        <el-form-item label="流转至">
          <el-select v-model="flowForm.nextStep" style="width: 100%">
            <el-option label="法制审核" value="法制审核" />
            <el-option label="重大案件集体讨论" value="集体讨论" />
            <el-option label="作出处罚决定" value="处罚决定" />
            <el-option label="结案归档" value="结案归档" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理意见">
          <el-input v-model="flowForm.opinion" type="textarea" :rows="4" placeholder="请输入处理意见" />
        </el-form-item>
        <el-form-item label="接收部门">
          <el-select v-model="flowForm.receiveDept" style="width: 100%">
            <el-option label="法制科" value="法制科" />
            <el-option label="案审委员会" value="案审委员会" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showFlowDialog = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmFlow">确认流转</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Plus, UploadFilled } from '@element-plus/icons-vue'
import { caseList, enforcementOfficers } from '@/mock'
import { ElMessage } from 'element-plus'

const allCases = ref([...caseList])
const officers = enforcementOfficers

const filterForm = reactive({
  id: '',
  type: '',
  status: ''
})

const filteredCases = computed(() => {
  return allCases.value.filter(item => {
    const matchId = !filterForm.id || item.id.includes(filterForm.id)
    const matchType = !filterForm.type || item.type === filterForm.type
    const matchStatus = !filterForm.status || item.status === filterForm.status
    return matchId && matchType && matchStatus
  })
})

const createForm = reactive({
  title: '',
  type: '',
  dept: '',
  handler: '',
  party: '',
  amount: 0,
  description: ''
})

const editForm = reactive({
  id: '',
  title: '',
  type: '',
  dept: '',
  handler: '',
  party: '',
  amount: 0,
  status: '',
  description: ''
})

const recordForm = reactive({
  time: '',
  location: '',
  target: '',
  officers: [],
  content: '',
  photos: []
})

const flowForm = reactive({
  nextStep: '',
  opinion: '',
  receiveDept: ''
})

const caseRecords = ref({})
const caseEvidences = ref({})

const showDetailDialog = ref(false)
const showRecordDialog = ref(false)
const showEvidenceDialog = ref(false)
const showFlowDialog = ref(false)
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const currentCase = ref(null)
const currentCaseId = ref('')
const currentEvidenceFileList = ref([])

const currentEvidenceList = computed(() => {
  return caseEvidences.value[currentCaseId.value] || []
})

const hasRecord = computed(() => {
  return !!caseRecords.value[currentCaseId.value]
})

const currentCaseRecord = computed(() => {
  return caseRecords.value[currentCaseId.value]
})

const getStepIndex = (status) => {
  const map = {
    '立案': 1,
    '调查中': 2,
    '法制审核': 3,
    '待执行': 4,
    '已结案': 5
  }
  return map[status] || 1
}

const getStatusType = (status) => {
  const map = {
    '立案': 'info',
    '调查中': 'warning',
    '法制审核': 'primary',
    '待执行': 'danger',
    '已结案': 'success'
  }
  return map[status] || 'info'
}

const handleSearch = () => {
  ElMessage.success(`查询完成，共找到 ${filteredCases.value.length} 条记录`)
}

const handleReset = () => {
  filterForm.id = ''
  filterForm.type = ''
  filterForm.status = ''
  ElMessage.info('已重置筛选条件')
}

const openCreateDialog = () => {
  Object.assign(createForm, {
    title: '',
    type: '',
    dept: '',
    handler: '',
    party: '',
    amount: 0,
    description: ''
  })
  showCreateDialog.value = true
}

const generateCaseId = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const count = allCases.value.length + 1
  return `AJ${year}${month}${String(count).padStart(3, '0')}`
}

const handleCreate = () => {
  if (!createForm.title || !createForm.type || !createForm.dept || !createForm.handler) {
    ElMessage.warning('请填写必填项')
    return
  }
  const newCase = {
    id: generateCaseId(),
    title: createForm.title,
    type: createForm.type,
    dept: createForm.dept,
    handler: createForm.handler,
    party: createForm.party,
    amount: createForm.amount,
    description: createForm.description,
    status: '立案',
    createTime: new Date().toISOString().slice(0, 10)
  }
  allCases.value.unshift(newCase)
  caseRecords.value[newCase.id] = null
  caseEvidences.value[newCase.id] = []
  ElMessage.success(`案件 ${newCase.id} 创建成功`)
  showCreateDialog.value = false
}

const handleView = (row) => {
  currentCase.value = row
  showDetailDialog.value = true
}

const handleEdit = (row) => {
  Object.assign(editForm, {
    id: row.id,
    title: row.title,
    type: row.type,
    dept: row.dept,
    handler: row.handler,
    party: row.party || '',
    amount: row.amount || 0,
    status: row.status,
    description: row.description || ''
  })
  showEditDialog.value = true
}

const handleSaveEdit = () => {
  const index = allCases.value.findIndex(item => item.id === editForm.id)
  if (index !== -1) {
    Object.assign(allCases.value[index], editForm)
    ElMessage.success('案件信息已更新')
    showEditDialog.value = false
  }
}

const handleFlow = (row) => {
  currentCase.value = row
  flowForm.nextStep = ''
  flowForm.opinion = ''
  flowForm.receiveDept = ''
  showFlowDialog.value = true
}

const handleRecord = (row) => {
  currentCase.value = row
  currentCaseId.value = row.id
  const existingRecord = caseRecords.value[row.id]
  if (existingRecord) {
    Object.assign(recordForm, existingRecord)
  } else {
    Object.assign(recordForm, {
      time: '',
      location: '',
      target: '',
      officers: [],
      content: '',
      photos: []
    })
  }
  showRecordDialog.value = true
}

const handleEvidence = (row) => {
  currentCase.value = row
  currentCaseId.value = row.id
  currentEvidenceFileList.value = []
  showEvidenceDialog.value = true
}

const handleSaveRecord = () => {
  caseRecords.value[currentCaseId.value] = {
    time: recordForm.time,
    location: recordForm.location,
    target: recordForm.target,
    officers: [...recordForm.officers],
    content: recordForm.content,
    photos: [...recordForm.photos]
  }
  ElMessage.success('现场记录已保存')
  showRecordDialog.value = false
}

const handleConfirmFlow = () => {
  if (currentCase.value) {
    currentCase.value.status = flowForm.nextStep === '结案归档' ? '已结案' : flowForm.nextStep
    ElMessage.success(`案件已流转至：${flowForm.nextStep}`)
  }
  showFlowDialog.value = false
}

const handleEvidenceChange = (file) => {
  const ext = file.name.split('.').pop()?.toLowerCase()
  let type = '其他'
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(ext)) type = '图片'
  else if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'].includes(ext)) type = '文档'
  else if (['mp4', 'avi', 'mov', 'mp3', 'wav'].includes(ext)) type = '音视频'

  const now = new Date()
  const timeStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
  
  if (!caseEvidences.value[currentCaseId.value]) {
    caseEvidences.value[currentCaseId.value] = []
  }
  caseEvidences.value[currentCaseId.value].push({
    name: file.name,
    type: type,
    uploadTime: timeStr
  })
}

const handleDeleteEvidence = (index) => {
  if (caseEvidences.value[currentCaseId.value]) {
    caseEvidences.value[currentCaseId.value].splice(index, 1)
    ElMessage.success('删除成功')
  }
}

const handleDownloadEvidence = (row) => {
  ElMessage.info(`正在下载：${row.name}`)
}

const handlePicturePreview = () => {}
const handleRemove = () => {}
</script>

<style scoped>
.cases-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.filter-card, .table-card {
  border-radius: 8px;
}

.record-info {
  margin-bottom: 10px;
}
</style>
