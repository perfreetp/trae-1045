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
          <el-button type="success" @click="showCreateDialog = true">
            <el-icon><Plus /></el-icon>新建案件
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <el-table :data="cases" border stripe>
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
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleView(row)">详情</el-button>
            <el-button link type="primary" size="small" @click="handleFlow(row)">流转</el-button>
            <el-button link type="primary" size="small" @click="handleRecord(row)">现场记录</el-button>
            <el-button link type="primary" size="small" @click="handleEvidence(row)">证据</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="showDetailDialog" title="案件详情" width="900px">
      <el-descriptions :column="2" border v-if="currentCase">
        <el-descriptions-item label="案件编号">{{ currentCase.id }}</el-descriptions-item>
        <el-descriptions-item label="案件名称">{{ currentCase.title }}</el-descriptions-item>
        <el-descriptions-item label="案件类型">{{ currentCase.type }}</el-descriptions-item>
        <el-descriptions-item label="承办部门">{{ currentCase.dept }}</el-descriptions-item>
        <el-descriptions-item label="承办人">{{ currentCase.handler }}</el-descriptions-item>
        <el-descriptions-item label="立案时间">{{ currentCase.createTime }}</el-descriptions-item>
        <el-descriptions-item label="处罚金额" v-if="currentCase.amount">¥{{ currentCase.amount }}</el-descriptions-item>
        <el-descriptions-item label="案件状态">
          <el-tag :type="getStatusType(currentCase.status)">{{ currentCase.status }}</el-tag>
        </el-descriptions-item>
      </el-descriptions>
      <el-divider content-position="left">案件流转记录</el-divider>
      <el-steps :active="3" finish-status="success" simple>
        <el-step title="立案" description="2026-06-05" />
        <el-step title="调查取证" description="2026-06-05" />
        <el-step title="法制审核" description="进行中" />
        <el-step title="作出决定" description="待完成" />
        <el-step title="结案归档" description="待完成" />
      </el-steps>
    </el-dialog>

    <el-dialog v-model="showRecordDialog" title="现场检查记录" width="800px">
      <el-form :model="recordForm" label-width="100px">
        <el-form-item label="检查时间">
          <el-date-picker v-model="recordForm.time" type="datetime" style="width: 100%" />
        </el-form-item>
        <el-form-item label="检查地点">
          <el-input v-model="recordForm.location" />
        </el-form-item>
        <el-form-item label="被检查人">
          <el-input v-model="recordForm.target" />
        </el-form-item>
        <el-form-item label="执法人员">
          <el-select v-model="recordForm.officers" multiple placeholder="请选择执法人员" style="width: 100%">
            <el-option v-for="officer in officers" :key="officer.id" :label="officer.name" :value="officer.id" />
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
      <el-table :data="evidenceList" style="margin-top: 20px" border>
        <el-table-column prop="name" label="证据名称" />
        <el-table-column prop="type" label="类型" width="100" />
        <el-table-column prop="uploadTime" label="上传时间" width="160" />
        <el-table-column label="操作" width="100">
          <template #default>
            <el-button link type="primary" size="small">下载</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <el-dialog v-model="showFlowDialog" title="案件流转" width="600px">
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
import { ref, reactive } from 'vue'
import { Plus, UploadFilled } from '@element-plus/icons-vue'
import { caseList, enforcementOfficers } from '@/mock'
import { ElMessage } from 'element-plus'

const cases = ref([...caseList])
const officers = enforcementOfficers

const filterForm = reactive({
  id: '',
  type: '',
  status: ''
})

const recordForm = reactive({
  time: '',
  location: '',
  target: '',
  officers: [],
  content: ''
})

const flowForm = reactive({
  nextStep: '',
  opinion: '',
  receiveDept: ''
})

const evidenceList = ref([
  { name: '现场照片1.jpg', type: '图片', uploadTime: '2026-06-05 14:30' },
  { name: '询问笔录.pdf', type: '文档', uploadTime: '2026-06-05 15:00' }
])

const showDetailDialog = ref(false)
const showRecordDialog = ref(false)
const showEvidenceDialog = ref(false)
const showFlowDialog = ref(false)
const showCreateDialog = ref(false)
const currentCase = ref(null)

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
  ElMessage.success('查询成功')
}

const handleReset = () => {
  filterForm.id = ''
  filterForm.type = ''
  filterForm.status = ''
}

const handleView = (row) => {
  currentCase.value = row
  showDetailDialog.value = true
}

const handleFlow = (row) => {
  currentCase.value = row
  showFlowDialog.value = true
}

const handleRecord = (row) => {
  currentCase.value = row
  showRecordDialog.value = true
}

const handleEvidence = (row) => {
  currentCase.value = row
  showEvidenceDialog.value = true
}

const handleSaveRecord = () => {
  ElMessage.success('现场记录已保存')
  showRecordDialog.value = false
}

const handleConfirmFlow = () => {
  ElMessage.success('案件流转成功')
  showFlowDialog.value = false
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
</style>
