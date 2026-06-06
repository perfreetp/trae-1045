<template>
  <div class="archives-page">
    <el-card>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="统计分析" name="statistics">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-card class="chart-card">
                <template #header>
                  <div class="card-header">案件类型分布</div>
                </template>
                <div ref="typeChartRef" class="chart"></div>
              </el-card>
            </el-col>
            <el-col :span="12">
              <el-card class="chart-card">
                <template #header>
                  <div class="card-header">各部门办案数量</div>
                </template>
                <div ref="deptChartRef" class="chart"></div>
              </el-card>
            </el-col>
          </el-row>
          <el-row :gutter="20" style="margin-top: 20px">
            <el-col :span="12">
              <el-card class="chart-card">
                <template #header>
                  <div class="card-header">月度案件趋势</div>
                </template>
                <div ref="monthlyChartRef" class="chart"></div>
              </el-card>
            </el-col>
            <el-col :span="12">
              <el-card class="chart-card">
                <template #header>
                  <div class="card-header">处罚金额区间分布</div>
                </template>
                <div ref="amountChartRef" class="chart"></div>
              </el-card>
            </el-col>
          </el-row>

          <el-card style="margin-top: 20px">
            <template #header>
              <div class="card-header">
                <span>综合统计报表</span>
                <el-button-group>
                  <el-button size="small" type="primary" @click="handleExportExcel">导出Excel</el-button>
                  <el-button size="small" @click="handlePrint">打印</el-button>
                </el-button-group>
              </div>
            </template>
            <el-table :data="statReportData" border>
              <el-table-column prop="dept" label="部门" width="120" fixed />
              <el-table-column prop="total" label="案件总数" width="100" />
              <el-table-column prop="administrative" label="行政处罚" width="100" />
              <el-table-column prop="coercive" label="行政强制" width="100" />
              <el-table-column prop="license" label="行政许可" width="100" />
              <el-table-column prop="inspection" label="行政检查" width="100" />
              <el-table-column prop="completed" label="已结案" width="100" />
              <el-table-column prop="pending" label="办理中" width="100" />
              <el-table-column prop="totalAmount" label="处罚总额(元)" width="130" />
              <el-table-column prop="avgDays" label="平均办理天数" width="120" />
            </el-table>
          </el-card>
        </el-tab-pane>

        <el-tab-pane label="案卷归档" name="archives">
          <div class="toolbar">
            <el-form :inline="true" :model="archiveFilter">
              <el-form-item label="归档年度">
                <el-select v-model="archiveFilter.year" placeholder="请选择" style="width: 120px" clearable>
                  <el-option label="2026年" value="2026" />
                  <el-option label="2025年" value="2025" />
                  <el-option label="2024年" value="2024" />
                </el-select>
              </el-form-item>
              <el-form-item label="案卷类别">
                <el-select v-model="archiveFilter.type" placeholder="请选择" style="width: 140px" clearable>
                  <el-option label="行政处罚卷" value="行政处罚卷" />
                  <el-option label="行政强制卷" value="行政强制卷" />
                  <el-option label="行政复议卷" value="行政复议卷" />
                </el-select>
              </el-form-item>
              <el-form-item label="保管期限">
                <el-select v-model="archiveFilter.period" placeholder="请选择" style="width: 120px" clearable>
                  <el-option label="永久" value="永久" />
                  <el-option label="30年" value="30年" />
                  <el-option label="10年" value="10年" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleArchiveSearch">查询</el-button>
                <el-button @click="handleArchiveReset">重置</el-button>
              </el-form-item>
            </el-form>
            <el-button type="success" @click="openArchiveDialog">
              <el-icon><Plus /></el-icon>新增归档
            </el-button>
          </div>
          <el-table :data="filteredArchives" border stripe>
            <el-table-column prop="archiveNo" label="档号" width="140" />
            <el-table-column prop="caseId" label="案件编号" width="140" />
            <el-table-column prop="caseTitle" label="案件名称" min-width="200" />
            <el-table-column prop="type" label="案卷类别" width="120" />
            <el-table-column prop="archiver" label="归档人" width="100" />
            <el-table-column prop="archiveDate" label="归档日期" width="120" />
            <el-table-column prop="period" label="保管期限" width="100">
              <template #default="{ row }">
                <el-tag size="small">{{ row.period }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="location" label="存放位置" width="120" />
            <el-table-column label="操作" width="280" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="handleViewArchive(row)">查看</el-button>
                <el-button link type="primary" size="small" @click="handleBorrow(row)">借阅</el-button>
                <el-button link type="primary" size="small" @click="handleDownloadArchive(row)">下载</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="执法人员管理" name="officers">
          <div class="toolbar">
            <el-button type="success" @click="openOfficerDialog">
              <el-icon><Plus /></el-icon>新增执法人员
            </el-button>
          </div>
          <el-table :data="officers" border stripe>
            <el-table-column prop="id" label="序号" width="80" />
            <el-table-column prop="name" label="姓名" width="100" />
            <el-table-column prop="dept" label="所属部门" width="150" />
            <el-table-column prop="certificateNo" label="执法证号" width="150" />
            <el-table-column prop="status" label="证件状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === '有效' ? 'success' : 'warning'" size="small">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="expireDate" label="有效期至" width="120" />
            <el-table-column label="操作" width="280">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="handleViewOfficer(row)">详情</el-button>
                <el-button link type="primary" size="small" @click="handleEditOfficer(row)">编辑</el-button>
                <el-button link type="primary" size="small" @click="handleVerifyOfficer(row)">核验</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-dialog v-model="showArchiveDialog" title="新增案卷归档" width="700px">
      <el-form :model="archiveForm" label-width="100px">
        <el-form-item label="关联案件">
          <el-select v-model="archiveForm.caseId" placeholder="请选择案件" style="width: 100%" filterable>
            <el-option label="AJ202605089 某公司未经许可经营" value="AJ202605089" />
            <el-option label="AJ202605088 某车辆超限运输" value="AJ202605088" />
            <el-option label="AJ202605087 某工厂安全生产不达标" value="AJ202605087" />
          </el-select>
        </el-form-item>
        <el-form-item label="案件名称">
          <el-input v-model="archiveForm.caseTitle" placeholder="请输入案件名称" />
        </el-form-item>
        <el-form-item label="案卷类别">
          <el-select v-model="archiveForm.type" style="width: 100%">
            <el-option label="行政处罚卷" value="行政处罚卷" />
            <el-option label="行政强制卷" value="行政强制卷" />
            <el-option label="行政复议卷" value="行政复议卷" />
          </el-select>
        </el-form-item>
        <el-form-item label="保管期限">
          <el-select v-model="archiveForm.period" style="width: 100%">
            <el-option label="永久" value="永久" />
            <el-option label="30年" value="30年" />
            <el-option label="10年" value="10年" />
          </el-select>
        </el-form-item>
        <el-form-item label="存放位置">
          <el-input v-model="archiveForm.location" placeholder="如：档案室A区-3排-5号" />
        </el-form-item>
        <el-form-item label="归档人">
          <el-input v-model="archiveForm.archiver" placeholder="请输入归档人" />
        </el-form-item>
        <el-form-item label="归档材料">
          <el-upload
            action="#"
            :auto-upload="false"
            multiple
          >
            <el-button type="primary">
              <el-icon><Upload /></el-icon>上传扫描件
            </el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showArchiveDialog = false">取消</el-button>
        <el-button type="primary" @click="handleArchive">确认归档</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showArchiveViewDialog" title="案卷详情" width="700px">
      <el-descriptions :column="2" border v-if="currentArchive">
        <el-descriptions-item label="档号">{{ currentArchive.archiveNo }}</el-descriptions-item>
        <el-descriptions-item label="案件编号">{{ currentArchive.caseId }}</el-descriptions-item>
        <el-descriptions-item label="案件名称" :span="2">{{ currentArchive.caseTitle }}</el-descriptions-item>
        <el-descriptions-item label="案卷类别">{{ currentArchive.type }}</el-descriptions-item>
        <el-descriptions-item label="保管期限">{{ currentArchive.period }}</el-descriptions-item>
        <el-descriptions-item label="归档人">{{ currentArchive.archiver }}</el-descriptions-item>
        <el-descriptions-item label="归档日期">{{ currentArchive.archiveDate }}</el-descriptions-item>
        <el-descriptions-item label="存放位置">{{ currentArchive.location }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <el-dialog v-model="showBorrowDialog" title="案卷借阅" width="500px">
      <el-descriptions :column="1" border size="small" style="margin-bottom: 20px" v-if="currentArchive">
        <el-descriptions-item label="案卷">{{ currentArchive.archiveNo }} - {{ currentArchive.caseTitle }}</el-descriptions-item>
      </el-descriptions>
      <el-form :model="borrowForm" label-width="100px">
        <el-form-item label="借阅人">
          <el-input v-model="borrowForm.borrower" placeholder="请输入借阅人姓名" />
        </el-form-item>
        <el-form-item label="借阅用途">
          <el-input v-model="borrowForm.purpose" type="textarea" :rows="3" placeholder="请输入借阅用途" />
        </el-form-item>
        <el-form-item label="预计归还日期">
          <el-date-picker v-model="borrowForm.returnDate" type="date" style="width: 100%" value-format="YYYY-MM-DD" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showBorrowDialog = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmBorrow">确认借阅</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showOfficerDialog" title="新增执法人员" width="600px">
      <el-form :model="officerForm" label-width="100px">
        <el-form-item label="姓名">
          <el-input v-model="officerForm.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="所属部门">
          <el-select v-model="officerForm.dept" placeholder="请选择部门" style="width: 100%">
            <el-option label="市场监管局" value="市场监管局" />
            <el-option label="环保局" value="环保局" />
            <el-option label="住建局" value="住建局" />
            <el-option label="交通局" value="交通局" />
            <el-option label="应急管理局" value="应急管理局" />
            <el-option label="公安局" value="公安局" />
          </el-select>
        </el-form-item>
        <el-form-item label="执法证号">
          <el-input v-model="officerForm.certificateNo" placeholder="请输入执法证件号" />
        </el-form-item>
        <el-form-item label="证件状态">
          <el-select v-model="officerForm.status" style="width: 100%">
            <el-option label="有效" value="有效" />
            <el-option label="即将到期" value="即将到期" />
            <el-option label="已过期" value="已过期" />
          </el-select>
        </el-form-item>
        <el-form-item label="有效期至">
          <el-date-picker v-model="officerForm.expireDate" type="date" style="width: 100%" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="officerForm.phone" placeholder="请输入联系电话" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showOfficerDialog = false">取消</el-button>
        <el-button type="primary" @click="handleCreateOfficer">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showOfficerViewDialog" title="执法人员详情" width="600px">
      <el-descriptions :column="2" border v-if="currentOfficer">
        <el-descriptions-item label="姓名">{{ currentOfficer.name }}</el-descriptions-item>
        <el-descriptions-item label="所属部门">{{ currentOfficer.dept }}</el-descriptions-item>
        <el-descriptions-item label="执法证号">{{ currentOfficer.certificateNo }}</el-descriptions-item>
        <el-descriptions-item label="证件状态">
          <el-tag :type="currentOfficer.status === '有效' ? 'success' : 'warning'">{{ currentOfficer.status }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="有效期至">{{ currentOfficer.expireDate }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ currentOfficer.phone || '无' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <el-dialog v-model="showOfficerEditDialog" title="编辑执法人员" width="600px">
      <el-form :model="officerEditForm" label-width="100px">
        <el-form-item label="姓名">
          <el-input v-model="officerEditForm.name" />
        </el-form-item>
        <el-form-item label="所属部门">
          <el-select v-model="officerEditForm.dept" style="width: 100%">
            <el-option label="市场监管局" value="市场监管局" />
            <el-option label="环保局" value="环保局" />
            <el-option label="住建局" value="住建局" />
            <el-option label="交通局" value="交通局" />
            <el-option label="应急管理局" value="应急管理局" />
            <el-option label="公安局" value="公安局" />
          </el-select>
        </el-form-item>
        <el-form-item label="执法证号">
          <el-input v-model="officerEditForm.certificateNo" />
        </el-form-item>
        <el-form-item label="证件状态">
          <el-select v-model="officerEditForm.status" style="width: 100%">
            <el-option label="有效" value="有效" />
            <el-option label="即将到期" value="即将到期" />
            <el-option label="已过期" value="已过期" />
          </el-select>
        </el-form-item>
        <el-form-item label="有效期至">
          <el-date-picker v-model="officerEditForm.expireDate" type="date" style="width: 100%" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="officerEditForm.phone" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showOfficerEditDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSaveOfficerEdit">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showVerifyDialog" title="证件核验结果" width="500px">
      <el-result
        :icon="verifyResult.pass ? 'success' : 'error'"
        :title="verifyResult.title"
        :sub-title="verifyResult.message"
      >
        <template #extra v-if="verifyResult.officer">
          <el-descriptions :column="1" border size="small">
            <el-descriptions-item label="姓名">{{ verifyResult.officer.name }}</el-descriptions-item>
            <el-descriptions-item label="所属部门">{{ verifyResult.officer.dept }}</el-descriptions-item>
            <el-descriptions-item label="执法证号">{{ verifyResult.officer.certificateNo }}</el-descriptions-item>
            <el-descriptions-item label="有效期至">{{ verifyResult.officer.expireDate }}</el-descriptions-item>
          </el-descriptions>
        </template>
      </el-result>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import * as echarts from 'echarts'
import { Plus, Upload } from '@element-plus/icons-vue'
import { dashboardStats, enforcementOfficers } from '@/mock'
import { ElMessage } from 'element-plus'

const activeTab = ref('statistics')

const typeChartRef = ref(null)
const deptChartRef = ref(null)
const monthlyChartRef = ref(null)
const amountChartRef = ref(null)

const showArchiveDialog = ref(false)
const showArchiveViewDialog = ref(false)
const showBorrowDialog = ref(false)
const showOfficerDialog = ref(false)
const showOfficerViewDialog = ref(false)
const showOfficerEditDialog = ref(false)
const showVerifyDialog = ref(false)

const archiveFilter = reactive({
  year: '',
  type: '',
  period: ''
})

const archiveForm = reactive({
  caseId: '',
  caseTitle: '',
  type: '行政处罚卷',
  period: '30年',
  location: '',
  archiver: '管理员'
})

const borrowForm = reactive({
  borrower: '',
  purpose: '',
  returnDate: ''
})

const officerForm = reactive({
  name: '',
  dept: '',
  certificateNo: '',
  status: '有效',
  expireDate: '',
  phone: ''
})

const officerEditForm = reactive({
  id: '',
  name: '',
  dept: '',
  certificateNo: '',
  status: '',
  expireDate: '',
  phone: ''
})

const verifyResult = reactive({
  pass: false,
  title: '',
  message: '',
  officer: null
})

const currentArchive = ref(null)
const currentOfficer = ref(null)

const allArchives = ref([
  { archiveNo: 'D-2026-001', caseId: 'AJ202605089', caseTitle: '某公司未经许可经营案', type: '行政处罚卷', archiver: '管理员', archiveDate: '2026-06-03', period: '30年', location: 'A区-3排-5号' },
  { archiveNo: 'D-2026-002', caseId: 'AJ202605088', caseTitle: '某车辆超限运输案', type: '行政处罚卷', archiver: '管理员', archiveDate: '2026-06-02', period: '10年', location: 'A区-3排-6号' },
  { archiveNo: 'D-2026-003', caseId: 'AJ202605087', caseTitle: '某工厂安全生产不达标案', type: '行政强制卷', archiver: '管理员', archiveDate: '2026-06-01', period: '30年', location: 'A区-3排-7号' }
])

const filteredArchives = computed(() => {
  return allArchives.value.filter(item => {
    const matchYear = !archiveFilter.year || item.archiveDate.startsWith(archiveFilter.year)
    const matchType = !archiveFilter.type || item.type === archiveFilter.type
    const matchPeriod = !archiveFilter.period || item.period === archiveFilter.period
    return matchYear && matchType && matchPeriod
  })
})

const officers = ref([...enforcementOfficers])

const statReportData = ref([
  { dept: '市场监管局', total: 356, administrative: 156, coercive: 68, license: 42, inspection: 90, completed: 320, pending: 36, totalAmount: 1256000, avgDays: 15 },
  { dept: '公安局', total: 289, administrative: 120, coercive: 85, license: 24, inspection: 60, completed: 265, pending: 24, totalAmount: 985000, avgDays: 12 },
  { dept: '环保局', total: 215, administrative: 95, coercive: 45, license: 30, inspection: 45, completed: 198, pending: 17, totalAmount: 2150000, avgDays: 18 },
  { dept: '住建局', total: 198, administrative: 85, coercive: 36, license: 72, inspection: 5, completed: 180, pending: 18, totalAmount: 1560000, avgDays: 16 },
  { dept: '交通局', total: 120, administrative: 78, coercive: 20, license: 8, inspection: 14, completed: 110, pending: 10, totalAmount: 680000, avgDays: 10 }
])

const archivesList = filteredArchives

const initTypeChart = () => {
  const chart = echarts.init(typeChartRef.value)
  chart.setOption({
    tooltip: { trigger: 'item' },
    legend: { bottom: 10 },
    series: [{
      type: 'pie',
      radius: ['40%', '65%'],
      center: ['50%', '45%'],
      data: dashboardStats.caseTypeDistribution.map(item => ({ name: item.name, value: item.value })),
      emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } }
    }]
  })
}

const initDeptChart = () => {
  const chart = echarts.init(deptChartRef.value)
  chart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: dashboardStats.deptDistribution.map(item => item.name), axisLabel: { interval: 0, rotate: 30 } },
    yAxis: { type: 'value' },
    series: [{
      data: dashboardStats.deptDistribution.map(item => item.value),
      type: 'bar',
      itemStyle: { color: '#67C23A' },
      barWidth: '50%'
    }]
  })
}

const initMonthlyChart = () => {
  const chart = echarts.init(monthlyChartRef.value)
  chart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: dashboardStats.caseTrend.map(item => item.month) },
    yAxis: { type: 'value' },
    series: [{
      data: dashboardStats.caseTrend.map(item => item.count),
      type: 'line',
      smooth: true,
      areaStyle: { color: 'rgba(236, 136, 68, 0.2)' },
      lineStyle: { color: '#E6A23C' },
      itemStyle: { color: '#E6A23C' }
    }]
  })
}

const initAmountChart = () => {
  const chart = echarts.init(amountChartRef.value)
  chart.setOption({
    tooltip: { trigger: 'item' },
    xAxis: { type: 'category', data: ['1万以下', '1-5万', '5-10万', '10-50万', '50万以上'] },
    yAxis: { type: 'value' },
    series: [{
      data: [156, 320, 189, 95, 28],
      type: 'bar',
      itemStyle: { color: '#909399' },
      barWidth: '50%'
    }]
  })
}

const handleExportExcel = () => {
  ElMessage.success('正在导出Excel报表')
}

const handlePrint = () => {
  ElMessage.info('正在准备打印')
}

const handleArchiveSearch = () => {
  ElMessage.success(`查询完成，共找到 ${filteredArchives.value.length} 条记录`)
}

const handleArchiveReset = () => {
  archiveFilter.year = ''
  archiveFilter.type = ''
  archiveFilter.period = ''
  ElMessage.info('已重置筛选条件')
}

const openArchiveDialog = () => {
  Object.assign(archiveForm, {
    caseId: '',
    caseTitle: '',
    type: '行政处罚卷',
    period: '30年',
    location: '',
    archiver: '管理员'
  })
  showArchiveDialog.value = true
}

const handleArchive = () => {
  if (!archiveForm.caseTitle) {
    ElMessage.warning('请填写案件名称')
    return
  }
  const newArchive = {
    archiveNo: `D-2026-${String(allArchives.value.length + 1).padStart(3, '0')}`,
    caseId: archiveForm.caseId || '无',
    caseTitle: archiveForm.caseTitle,
    type: archiveForm.type,
    archiver: archiveForm.archiver,
    archiveDate: new Date().toISOString().slice(0, 10),
    period: archiveForm.period,
    location: archiveForm.location || '待分配'
  }
  allArchives.value.unshift(newArchive)
  ElMessage.success(`案卷 ${newArchive.archiveNo} 归档成功`)
  showArchiveDialog.value = false
}

const handleViewArchive = (row) => {
  currentArchive.value = row
  showArchiveViewDialog.value = true
}

const handleBorrow = (row) => {
  currentArchive.value = row
  Object.assign(borrowForm, { borrower: '', purpose: '', returnDate: '' })
  showBorrowDialog.value = true
}

const handleConfirmBorrow = () => {
  if (!borrowForm.borrower) {
    ElMessage.warning('请填写借阅人')
    return
  }
  ElMessage.success(`借阅登记成功，借阅人：${borrowForm.borrower}`)
  showBorrowDialog.value = false
}

const handleDownloadArchive = (row) => {
  ElMessage.success(`正在下载案卷：${row.caseTitle}`)
}

const openOfficerDialog = () => {
  Object.assign(officerForm, {
    name: '',
    dept: '',
    certificateNo: '',
    status: '有效',
    expireDate: '',
    phone: ''
  })
  showOfficerDialog.value = true
}

const handleCreateOfficer = () => {
  if (!officerForm.name || !officerForm.dept || !officerForm.certificateNo) {
    ElMessage.warning('请填写姓名、部门和执法证号')
    return
  }
  const newOfficer = {
    id: officers.value.length + 1,
    name: officerForm.name,
    dept: officerForm.dept,
    certificateNo: officerForm.certificateNo,
    status: officerForm.status,
    expireDate: officerForm.expireDate || '长期',
    phone: officerForm.phone
  }
  officers.value.push(newOfficer)
  ElMessage.success(`执法人员 ${newOfficer.name} 添加成功`)
  showOfficerDialog.value = false
}

const handleViewOfficer = (row) => {
  currentOfficer.value = row
  showOfficerViewDialog.value = true
}

const handleEditOfficer = (row) => {
  Object.assign(officerEditForm, {
    id: row.id,
    name: row.name,
    dept: row.dept,
    certificateNo: row.certificateNo,
    status: row.status,
    expireDate: row.expireDate,
    phone: row.phone || ''
  })
  showOfficerEditDialog.value = true
}

const handleSaveOfficerEdit = () => {
  const index = officers.value.findIndex(o => o.id === officerEditForm.id)
  if (index !== -1) {
    Object.assign(officers.value[index], officerEditForm)
    ElMessage.success('执法人员信息已更新')
    showOfficerEditDialog.value = false
  }
}

const handleVerifyOfficer = (row) => {
  verifyResult.pass = true
  verifyResult.title = '核验通过'
  verifyResult.message = `执法人员 ${row.name} 的证件有效`
  verifyResult.officer = row
  showVerifyDialog.value = true
}

onMounted(() => {
  initTypeChart()
  initDeptChart()
  initMonthlyChart()
  initAmountChart()
  window.addEventListener('resize', () => {
    echarts.getInstanceByDom(typeChartRef.value)?.resize()
    echarts.getInstanceByDom(deptChartRef.value)?.resize()
    echarts.getInstanceByDom(monthlyChartRef.value)?.resize()
    echarts.getInstanceByDom(amountChartRef.value)?.resize()
  })
})
</script>

<style scoped>
.archives-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.chart-card {
  height: 320px;
}

.chart {
  width: 100%;
  height: 250px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
</style>
