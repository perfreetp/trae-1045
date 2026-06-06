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
            <el-button type="success" @click="showCreateDialog = true">
              <el-icon><Plus /></el-icon>登记投诉
            </el-button>
          </div>
          <el-table :data="complaints" border stripe>
            <el-table-column type="index" label="序号" width="60" />
            <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
            <el-table-column prop="complainant" label="投诉人" width="100" />
            <el-table-column prop="type" label="类型" width="130" />
            <el-table-column prop="createTime" label="登记时间" width="160" />
            <el-table-column prop="handler" label="经办人" width="100" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="statusType(row.status)" size="small">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right">
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
            <el-button type="success" @click="showLitigationDialog = true">
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
            <el-table-column label="操作" width="150">
              <template #default="{ row }">
                <el-button link type="primary" size="small">详情</el-button>
                <el-button link type="primary" size="small">更新状态</el-button>
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

    <el-dialog v-model="showProcessDialog" title="处理投诉" width="600px">
      <el-form :model="processForm" label-width="100px">
        <el-form-item label="处理状态">
          <el-select v-model="processForm.status" style="width: 100%">
            <el-option label="受理中" value="受理中" />
            <el-option label="调查核实中" value="调查核实中" />
            <el-option label="已处理完成" value="已办结" />
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
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Plus, Upload } from '@element-plus/icons-vue'
import { complaintsList, litigationList } from '@/mock'
import { ElMessage } from 'element-plus'

const activeTab = ref('list')
const complaints = ref([...complaintsList])
const litigations = ref([...litigationList])

const filterForm = reactive({
  type: '',
  status: ''
})

const complaintForm = reactive({
  type: '执法行为投诉',
  title: '',
  complainant: '',
  contact: '',
  content: ''
})

const processForm = reactive({
  status: '',
  opinion: '',
  reply: false,
  replyContent: ''
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
const showProcessDialog = ref(false)
const showLitigationDialog = ref(false)
const currentComplaint = ref(null)

const statusType = (status) => {
  const map = { '已受理': 'info', '处理中': 'primary', '已办结': 'success' }
  return map[status] || 'info'
}

const handleSearch = () => {
  ElMessage.success('查询成功')
}

const handleReset = () => {
  filterForm.type = ''
  filterForm.status = ''
}

const handleView = (row) => {
  ElMessage.info(`查看投诉：${row.title}`)
}

const handleProcess = (row) => {
  currentComplaint.value = row
  showProcessDialog.value = true
}

const handleTransfer = (row) => {
  ElMessage.info('转办功能')
}

const handleCreate = () => {
  ElMessage.success('投诉举报登记成功')
  showCreateDialog.value = false
}

const handleSubmitProcess = () => {
  if (currentComplaint.value) {
    currentComplaint.value.status = processForm.status
  }
  ElMessage.success('处理意见已提交')
  showProcessDialog.value = false
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
