<template>
  <div class="review-page">
    <el-card>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="待审核案件" name="pending">
          <el-table :data="pendingReviews" border stripe>
            <el-table-column prop="caseId" label="案件编号" width="140" />
            <el-table-column prop="caseTitle" label="案件名称" min-width="200" show-overflow-tooltip />
            <el-table-column prop="submitDept" label="提交部门" width="120" />
            <el-table-column prop="submitTime" label="提交时间" width="160" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === '待审核' ? 'warning' : row.status === '已通过' ? 'success' : 'danger'" size="small">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="240" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="handleReview(row)" v-if="row.status === '待审核'">审核</el-button>
                <el-button link type="primary" size="small" @click="handleViewCase(row)">查看案件</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="听证管理" name="hearing">
          <div class="toolbar">
            <el-button type="primary" @click="openHearingDialog">
              <el-icon><Plus /></el-icon>安排听证
            </el-button>
          </div>
          <el-table :data="hearingList" border stripe>
            <el-table-column prop="caseId" label="案件编号" width="140" />
            <el-table-column prop="caseTitle" label="案件名称" min-width="200" />
            <el-table-column prop="applicant" label="申请人" width="120" />
            <el-table-column prop="hearingTime" label="听证时间" width="180" />
            <el-table-column prop="hearingLocation" label="听证地点" width="180" />
            <el-table-column prop="host" label="主持人" width="100" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="hearingStatusType(row.status)" size="small">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="240">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="handleViewHearing(row)">详情</el-button>
                <el-button link type="primary" size="small" @click="handleNotify(row)">通知</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="处罚缴纳状态" name="payment">
          <el-table :data="paymentList" border stripe>
            <el-table-column prop="caseId" label="案件编号" width="140" />
            <el-table-column prop="caseTitle" label="案件名称" min-width="200" />
            <el-table-column prop="party" label="当事人" width="150" />
            <el-table-column label="处罚金额" width="120">
              <template #default="{ row }">
                ¥{{ row.amount }}
              </template>
            </el-table-column>
            <el-table-column prop="dueDate" label="缴纳期限" width="120" />
            <el-table-column prop="paidDate" label="实际缴纳日期" width="140">
              <template #default="{ row }">
                {{ row.paidDate || '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="paymentStatusType(row.status)" size="small">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="240">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="handleMarkPaid(row)" v-if="row.status !== '已缴纳'">
                  标记已缴
                </el-button>
                <el-button link type="primary" size="small" @click="handleViewPayment(row)">详情</el-button>
                <el-button link type="primary" size="small" @click="handleUrge(row)" v-if="row.status !== '已缴纳'">催缴</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="整改跟踪" name="rectification">
          <el-table :data="rectificationList" border stripe>
            <el-table-column prop="caseId" label="案件编号" width="140" />
            <el-table-column prop="caseTitle" label="案件名称" min-width="200" />
            <el-table-column prop="party" label="当事人" width="150" />
            <el-table-column prop="requirement" label="整改要求" min-width="200" show-overflow-tooltip />
            <el-table-column prop="deadline" label="整改期限" width="120" />
            <el-table-column prop="verifyDate" label="复查日期" width="120">
              <template #default="{ row }">
                {{ row.verifyDate || '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="rectStatusType(row.status)" size="small">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="280">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="handleViewReport(row)">查看报告</el-button>
                <el-button link type="primary" size="small" @click="handleVerify(row)" v-if="row.status !== '已完成'">复查登记</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-dialog v-model="showReviewDialog" title="法制审核" width="800px">
      <el-descriptions :column="2" border v-if="currentCase">
        <el-descriptions-item label="案件编号">{{ currentCase.caseId }}</el-descriptions-item>
        <el-descriptions-item label="案件名称">{{ currentCase.caseTitle }}</el-descriptions-item>
        <el-descriptions-item label="提交部门">{{ currentCase.submitDept }}</el-descriptions-item>
        <el-descriptions-item label="提交时间">{{ currentCase.submitTime }}</el-descriptions-item>
      </el-descriptions>
      <el-divider />
      <el-form :model="reviewForm" label-width="100px">
        <el-form-item label="审核意见">
          <el-radio-group v-model="reviewForm.result">
            <el-radio value="pass">通过</el-radio>
            <el-radio value="reject">退回补正</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核内容">
          <el-checkbox-group v-model="reviewForm.items">
            <el-checkbox label="主体资格" />
            <el-checkbox label="事实认定" />
            <el-checkbox label="证据确凿" />
            <el-checkbox label="适用法律" />
            <el-checkbox label="程序合法" />
            <el-checkbox label="裁量适当" />
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="审核意见说明">
          <el-input v-model="reviewForm.opinion" type="textarea" :rows="5" placeholder="请输入详细审核意见" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showReviewDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitReview">提交审核</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showCaseViewDialog" title="案件详情" width="800px">
      <el-descriptions :column="2" border v-if="currentCase">
        <el-descriptions-item label="案件编号">{{ currentCase.caseId }}</el-descriptions-item>
        <el-descriptions-item label="案件名称">{{ currentCase.caseTitle }}</el-descriptions-item>
        <el-descriptions-item label="提交部门">{{ currentCase.submitDept }}</el-descriptions-item>
        <el-descriptions-item label="提交时间">{{ currentCase.submitTime }}</el-descriptions-item>
        <el-descriptions-item label="案件类型">{{ currentCase.caseType || '行政处罚' }}</el-descriptions-item>
        <el-descriptions-item label="当前状态">
          <el-tag :type="currentCase.status === '待审核' ? 'warning' : currentCase.status === '已通过' ? 'success' : 'danger'">
            {{ currentCase.status }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="案情摘要" :span="2">
          {{ currentCase.summary || '暂无案情摘要' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <el-dialog v-model="showHearingDialog" title="安排听证" width="600px">
      <el-form :model="hearingForm" label-width="100px">
        <el-form-item label="关联案件">
          <el-select v-model="hearingForm.caseId" style="width: 100%" placeholder="请选择案件">
            <el-option label="AJ202606002 某企业违法排放污水案" value="AJ202606002" />
            <el-option label="AJ202605090 某餐厅无证经营案" value="AJ202605090" />
          </el-select>
        </el-form-item>
        <el-form-item label="听证时间">
          <el-date-picker v-model="hearingForm.time" type="datetime" style="width: 100%" value-format="YYYY-MM-DD HH:mm" />
        </el-form-item>
        <el-form-item label="听证地点">
          <el-input v-model="hearingForm.location" placeholder="请输入听证地点" />
        </el-form-item>
        <el-form-item label="主持人">
          <el-select v-model="hearingForm.host" style="width: 100%">
            <el-option label="李审核员" value="李审核员" />
            <el-option label="王审核员" value="王审核员" />
          </el-select>
        </el-form-item>
        <el-form-item label="听证参加人">
          <el-input v-model="hearingForm.participants" type="textarea" :rows="2" placeholder="请输入听证参加人" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showHearingDialog = false">取消</el-button>
        <el-button type="primary" @click="handleCreateHearing">确认安排</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showHearingViewDialog" title="听证详情" width="600px">
      <el-descriptions :column="2" border v-if="currentHearing">
        <el-descriptions-item label="案件编号">{{ currentHearing.caseId }}</el-descriptions-item>
        <el-descriptions-item label="案件名称">{{ currentHearing.caseTitle }}</el-descriptions-item>
        <el-descriptions-item label="申请人">{{ currentHearing.applicant }}</el-descriptions-item>
        <el-descriptions-item label="主持人">{{ currentHearing.host }}</el-descriptions-item>
        <el-descriptions-item label="听证时间" :span="2">{{ currentHearing.hearingTime }}</el-descriptions-item>
        <el-descriptions-item label="听证地点" :span="2">{{ currentHearing.hearingLocation }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="hearingStatusType(currentHearing.status)">{{ currentHearing.status }}</el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <el-dialog v-model="showPaymentViewDialog" title="缴纳详情" width="600px">
      <el-descriptions :column="2" border v-if="currentPayment">
        <el-descriptions-item label="案件编号">{{ currentPayment.caseId }}</el-descriptions-item>
        <el-descriptions-item label="案件名称">{{ currentPayment.caseTitle }}</el-descriptions-item>
        <el-descriptions-item label="当事人">{{ currentPayment.party }}</el-descriptions-item>
        <el-descriptions-item label="处罚金额">¥{{ currentPayment.amount }}</el-descriptions-item>
        <el-descriptions-item label="缴纳期限">{{ currentPayment.dueDate }}</el-descriptions-item>
        <el-descriptions-item label="实际缴纳日期">{{ currentPayment.paidDate || '-' }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="paymentStatusType(currentPayment.status)">{{ currentPayment.status }}</el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <el-dialog v-model="showUrgeDialog" title="发送催缴通知" width="500px">
      <el-descriptions :column="1" border size="small" style="margin-bottom: 20px" v-if="currentPayment">
        <el-descriptions-item label="当事人">{{ currentPayment.party }}</el-descriptions-item>
        <el-descriptions-item label="案件">{{ currentPayment.caseTitle }}</el-descriptions-item>
        <el-descriptions-item label="应缴金额">¥{{ currentPayment.amount }}</el-descriptions-item>
      </el-descriptions>
      <el-form :model="urgeForm" label-width="100px">
        <el-form-item label="通知方式">
          <el-radio-group v-model="urgeForm.type">
            <el-radio value="sms">短信</el-radio>
            <el-radio value="email">邮件</el-radio>
            <el-radio value="both">两者都发</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="通知内容">
          <el-input v-model="urgeForm.content" type="textarea" :rows="3" placeholder="请输入催缴内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showUrgeDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSendUrge">发送通知</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showReportDialog" title="整改报告" width="700px">
      <el-descriptions :column="2" border v-if="currentRect">
        <el-descriptions-item label="案件编号">{{ currentRect.caseId }}</el-descriptions-item>
        <el-descriptions-item label="案件名称">{{ currentRect.caseTitle }}</el-descriptions-item>
        <el-descriptions-item label="当事人">{{ currentRect.party }}</el-descriptions-item>
        <el-descriptions-item label="当前状态">
          <el-tag :type="rectStatusType(currentRect.status)">{{ currentRect.status }}</el-tag>
        </el-descriptions-item>
      </el-descriptions>
      <el-divider content-position="left">整改要求</el-divider>
      <p>{{ currentRect?.requirement }}</p>
      <el-divider content-position="left">整改报告内容</el-divider>
      <p v-if="currentRect?.report">{{ currentRect.report }}</p>
      <el-empty v-else description="暂无整改报告" />
    </el-dialog>

    <el-dialog v-model="showVerifyDialog" title="复查登记" width="600px">
      <el-descriptions :column="1" border size="small" style="margin-bottom: 20px" v-if="currentRect">
        <el-descriptions-item label="案件">{{ currentRect.caseTitle }}</el-descriptions-item>
        <el-descriptions-item label="当事人">{{ currentRect.party }}</el-descriptions-item>
      </el-descriptions>
      <el-form :model="verifyForm" label-width="100px">
        <el-form-item label="复查日期">
          <el-date-picker v-model="verifyForm.date" type="date" style="width: 100%" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="复查人员">
          <el-input v-model="verifyForm.officer" placeholder="请输入复查人员" />
        </el-form-item>
        <el-form-item label="复查结果">
          <el-radio-group v-model="verifyForm.result">
            <el-radio value="pass">整改合格</el-radio>
            <el-radio value="fail">整改不合格</el-radio>
            <el-radio value="continue">继续整改</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="复查意见">
          <el-input v-model="verifyForm.opinion" type="textarea" :rows="3" placeholder="请输入复查意见" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showVerifyDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitVerify">提交复查</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showNotifyDialog" title="听证通知" width="500px">
      <el-descriptions :column="1" border size="small" style="margin-bottom: 20px" v-if="currentHearing">
        <el-descriptions-item label="听证案件">{{ currentHearing.caseTitle }}</el-descriptions-item>
        <el-descriptions-item label="听证时间">{{ currentHearing.hearingTime }}</el-descriptions-item>
        <el-descriptions-item label="听证地点">{{ currentHearing.hearingLocation }}</el-descriptions-item>
      </el-descriptions>
      <el-form label-width="100px">
        <el-form-item label="通知对象">
          <el-checkbox :value="true" disabled>申请人</el-checkbox>
          <el-checkbox :value="true" disabled>主持人</el-checkbox>
          <el-checkbox :value="true" disabled>记录员</el-checkbox>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showNotifyDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSendNotify">发送通知</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { reviewList } from '@/mock'
import { ElMessage } from 'element-plus'

const activeTab = ref('pending')
const pendingReviews = ref([...reviewList])

const showReviewDialog = ref(false)
const showCaseViewDialog = ref(false)
const showHearingDialog = ref(false)
const showHearingViewDialog = ref(false)
const showPaymentViewDialog = ref(false)
const showUrgeDialog = ref(false)
const showReportDialog = ref(false)
const showVerifyDialog = ref(false)
const showNotifyDialog = ref(false)

const currentCase = ref(null)
const currentHearing = ref(null)
const currentPayment = ref(null)
const currentRect = ref(null)

const hearingList = ref([
  { id: 1, caseId: 'AJ202606002', caseTitle: '某企业违法排放污水案', applicant: '某化工有限公司', hearingTime: '2026-06-10 09:30', hearingLocation: '市局听证室A', host: '李审核员', status: '待举行' },
  { id: 2, caseId: 'AJ202605090', caseTitle: '某餐厅无证经营案', applicant: '某餐饮管理公司', hearingTime: '2026-06-08 14:00', hearingLocation: '市局听证室B', host: '王审核员', status: '待举行' }
])

const paymentList = ref([
  { id: 1, caseId: 'AJ202606003', caseTitle: '某工地未采取扬尘防治措施', party: '某建筑工程有限公司', amount: 10000, dueDate: '2026-06-20', paidDate: '', status: '待缴纳' },
  { id: 2, caseId: 'AJ202605089', caseTitle: '某公司未经许可经营', party: '某贸易有限公司', amount: 30000, dueDate: '2026-06-15', paidDate: '2026-06-03', status: '已缴纳' },
  { id: 3, caseId: 'AJ202605088', caseTitle: '某车辆超限运输', party: '王某', amount: 8000, dueDate: '2026-06-10', paidDate: '', status: '已逾期' }
])

const rectificationList = ref([
  { id: 1, caseId: 'AJ202606001', caseTitle: '某超市销售过期食品案', party: '某超市有限公司', requirement: '立即下架所有过期食品，建立健全食品进货查验制度', deadline: '2026-06-15', verifyDate: '', status: '整改中', report: '' },
  { id: 2, caseId: 'AJ202606002', caseTitle: '某企业违法排放污水案', party: '某化工有限公司', requirement: '立即停止违法排污行为，完善污水处理设施并确保正常运行', deadline: '2026-06-20', verifyDate: '', status: '整改中', report: '' },
  { id: 3, caseId: 'AJ202605086', caseTitle: '某开发商违规预售', party: '某房地产开发公司', requirement: '立即停止违规预售行为，退还已收购房款', deadline: '2026-05-30', verifyDate: '2026-06-02', status: '已完成', report: '经复查，开发商已停止违规预售行为，并已按规定退还全部已收购房款。' }
])

const reviewForm = reactive({
  result: 'pass',
  items: [],
  opinion: ''
})

const hearingForm = reactive({
  caseId: '',
  time: '',
  location: '',
  host: '',
  participants: ''
})

const urgeForm = reactive({
  type: 'sms',
  content: '您有一笔行政处罚款项尚未缴纳，请尽快处理。'
})

const verifyForm = reactive({
  date: '',
  officer: '',
  result: 'pass',
  opinion: ''
})

const hearingStatusType = (status) => {
  const map = { '待举行': 'warning', '已举行': 'success', '已取消': 'info' }
  return map[status] || 'info'
}

const paymentStatusType = (status) => {
  const map = { '待缴纳': 'warning', '已缴纳': 'success', '已逾期': 'danger' }
  return map[status] || 'info'
}

const rectStatusType = (status) => {
  const map = { '整改中': 'warning', '已完成': 'success', '逾期未改': 'danger' }
  return map[status] || 'info'
}

const handleReview = (row) => {
  currentCase.value = row
  reviewForm.result = 'pass'
  reviewForm.items = []
  reviewForm.opinion = ''
  showReviewDialog.value = true
}

const handleViewCase = (row) => {
  currentCase.value = row
  showCaseViewDialog.value = true
}

const handleSubmitReview = () => {
  if (reviewForm.result === 'pass') {
    ElMessage.success('审核通过')
    currentCase.value.status = '已通过'
  } else {
    ElMessage.info('已退回补正')
    currentCase.value.status = '已退回'
  }
  showReviewDialog.value = false
}

const openHearingDialog = () => {
  Object.assign(hearingForm, { caseId: '', time: '', location: '', host: '', participants: '' })
  showHearingDialog.value = true
}

const handleCreateHearing = () => {
  if (!hearingForm.caseId || !hearingForm.time || !hearingForm.location) {
    ElMessage.warning('请填写完整信息')
    return
  }
  const caseTitles = {
    'AJ202606002': '某企业违法排放污水案',
    'AJ202605090': '某餐厅无证经营案'
  }
  const newHearing = {
    id: hearingList.value.length + 1,
    caseId: hearingForm.caseId,
    caseTitle: caseTitles[hearingForm.caseId] || '新案件',
    applicant: '申请人',
    hearingTime: hearingForm.time,
    hearingLocation: hearingForm.location,
    host: hearingForm.host || '未指定',
    status: '待举行'
  }
  hearingList.value.unshift(newHearing)
  ElMessage.success('听证安排已创建')
  showHearingDialog.value = false
}

const handleViewHearing = (row) => {
  currentHearing.value = row
  showHearingViewDialog.value = true
}

const handleNotify = (row) => {
  currentHearing.value = row
  showNotifyDialog.value = true
}

const handleSendNotify = () => {
  ElMessage.success('听证通知已发送')
  showNotifyDialog.value = false
}

const handleMarkPaid = (row) => {
  row.status = '已缴纳'
  row.paidDate = new Date().toISOString().slice(0, 10)
  ElMessage.success('已标记为已缴纳')
}

const handleViewPayment = (row) => {
  currentPayment.value = row
  showPaymentViewDialog.value = true
}

const handleUrge = (row) => {
  currentPayment.value = row
  showUrgeDialog.value = true
}

const handleSendUrge = () => {
  ElMessage.success('催缴通知已发送')
  showUrgeDialog.value = false
}

const handleViewReport = (row) => {
  currentRect.value = row
  showReportDialog.value = true
}

const handleVerify = (row) => {
  currentRect.value = row
  verifyForm.date = ''
  verifyForm.officer = ''
  verifyForm.result = 'pass'
  verifyForm.opinion = ''
  showVerifyDialog.value = true
}

const handleSubmitVerify = () => {
  if (!verifyForm.date || !verifyForm.officer) {
    ElMessage.warning('请填写复查日期和复查人员')
    return
  }
  currentRect.value.verifyDate = verifyForm.date
  if (verifyForm.result === 'pass') {
    currentRect.value.status = '已完成'
  }
  currentRect.value.report = verifyForm.opinion
  ElMessage.success('复查登记已提交')
  showVerifyDialog.value = false
}
</script>

<style scoped>
.review-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.toolbar {
  margin-bottom: 20px;
}
</style>
