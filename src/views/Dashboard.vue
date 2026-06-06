<template>
  <div class="dashboard">
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card stat-blue">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon size="36"><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalCases }}</div>
              <div class="stat-label">案件总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card stat-orange">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon size="36"><Clock /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.pendingReview }}</div>
              <div class="stat-label">待审核案件</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card stat-green">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon size="36"><CircleCheck /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.completedThisMonth }}</div>
              <div class="stat-label">本月办结</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card stat-red">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon size="36"><Warning /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.warningCount }}</div>
              <div class="stat-label">异常预警</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="charts-row">
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>案件办理趋势</span>
            </div>
          </template>
          <div ref="trendChartRef" class="chart"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>部门案件分布</span>
            </div>
          </template>
          <div ref="deptChartRef" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="bottom-row">
      <el-col :span="12">
        <el-card class="warning-card">
          <template #header>
            <div class="card-header">
              <span>异常预警</span>
              <el-tag type="danger" size="small">{{ warnings.length }} 条</el-tag>
            </div>
          </template>
          <el-table :data="warnings" size="small" style="width: 100%">
            <el-table-column prop="type" label="预警类型" width="120" />
            <el-table-column prop="content" label="预警内容" />
            <el-table-column prop="level" label="级别" width="80">
              <template #default="{ row }">
                <el-tag :type="row.level === '高' ? 'danger' : 'warning'" size="small">
                  {{ row.level }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="time" label="时间" width="150" />
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="quick-card">
          <template #header>
            <div class="card-header">
              <span>快捷入口</span>
            </div>
          </template>
          <div class="quick-actions">
            <div class="quick-item" @click="$router.push('/inspection')">
              <el-icon size="28"><Calendar /></el-icon>
              <span>检查计划</span>
            </div>
            <div class="quick-item" @click="$router.push('/cases')">
              <el-icon size="28"><Document /></el-icon>
              <span>案件管理</span>
            </div>
            <div class="quick-item" @click="$router.push('/review')">
              <el-icon size="28"><Stamp /></el-icon>
              <span>法制审核</span>
            </div>
            <div class="quick-item" @click="showVerifyDialog = true">
              <el-icon size="28"><User /></el-icon>
              <span>证件核验</span>
            </div>
            <div class="quick-item" @click="$router.push('/documents')">
              <el-icon size="28"><Files /></el-icon>
              <span>文书中心</span>
            </div>
            <div class="quick-item" @click="showBenchmarkDialog = true">
              <el-icon size="28"><Coin /></el-icon>
              <span>裁量基准</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="showVerifyDialog" title="执法人员证件核验" width="600px">
      <el-form :model="verifyForm" label-width="100px">
        <el-form-item label="证件编号">
          <el-input v-model="verifyForm.certificateNo" placeholder="请输入执法证件编号" />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="verifyForm.name" placeholder="请输入执法人员姓名" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showVerifyDialog = false">取消</el-button>
        <el-button type="primary" @click="handleVerify">核验</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showVerifyResultDialog" title="核验结果" width="500px" :close-on-click-modal="false">
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
            <el-descriptions-item label="证件状态">
              <el-tag :type="verifyResult.officer.status === '有效' ? 'success' : 'warning'">
                {{ verifyResult.officer.status }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </template>
        <template #extra v-else>
          <div class="verify-tips">
            <p v-if="verifyResult.tips">{{ verifyResult.tips }}</p>
          </div>
        </template>
      </el-result>
    </el-dialog>

    <el-dialog v-model="showBenchmarkDialog" title="裁量基准查询" width="800px">
      <el-table :data="benchmarks" border>
        <el-table-column prop="violation" label="违法行为" width="180" />
        <el-table-column prop="basis" label="法律依据" />
        <el-table-column label="处罚金额范围" width="180">
          <template #default="{ row }">
            {{ row.minAmount }} - {{ row.maxAmount }} 元
          </template>
        </el-table-column>
        <el-table-column prop="level" label="情节等级" width="100" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import * as echarts from 'echarts'
import { Document, Clock, CircleCheck, Warning, Calendar, Stamp, User, Files, Coin } from '@element-plus/icons-vue'
import { dashboardStats, warningList, punishmentBenchmark, enforcementOfficers } from '@/mock'
import { ElMessage } from 'element-plus'

const stats = dashboardStats
const warnings = warningList
const benchmarks = punishmentBenchmark

const trendChartRef = ref(null)
const deptChartRef = ref(null)
const showVerifyDialog = ref(false)
const showVerifyResultDialog = ref(false)
const showBenchmarkDialog = ref(false)
const verifyForm = reactive({ certificateNo: '', name: '' })
const verifyResult = reactive({
  pass: false,
  title: '',
  message: '',
  officer: null,
  tips: ''
})

const handleVerify = () => {
  if (!verifyForm.certificateNo || !verifyForm.name) {
    ElMessage.warning('请输入证件编号和姓名')
    return
  }
  const matchByCert = enforcementOfficers.find(o => o.certificateNo === verifyForm.certificateNo)
  const matchByName = enforcementOfficers.find(o => o.name === verifyForm.name)
  
  verifyResult.pass = false
  verifyResult.officer = null
  verifyResult.tips = ''
  
  if (matchByCert && matchByName) {
    if (matchByCert.id === matchByName.id) {
      verifyResult.pass = true
      verifyResult.title = '核验通过'
      verifyResult.message = `执法人员 ${matchByCert.name} 的证件信息匹配`
      verifyResult.officer = matchByCert
    } else {
      verifyResult.title = '核验失败'
      verifyResult.message = '证件编号与姓名不匹配'
      verifyResult.tips = `证件号 ${verifyForm.certificateNo} 对应人员为 ${matchByCert.name}，姓名 ${verifyForm.name} 对应证件号为 ${matchByName.certificateNo}`
    }
  } else if (matchByCert && !matchByName) {
    verifyResult.title = '核验失败'
    verifyResult.message = '姓名与证件不匹配'
    verifyResult.tips = `证件号 ${verifyForm.certificateNo} 对应人员为 ${matchByCert.name}，未找到姓名为 ${verifyForm.name} 的人员`
  } else if (!matchByCert && matchByName) {
    verifyResult.title = '核验失败'
    verifyResult.message = '证件编号与姓名不匹配'
    verifyResult.tips = `姓名 ${verifyForm.name} 对应证件号为 ${matchByName.certificateNo}，未找到证件号为 ${verifyForm.certificateNo} 的人员`
  } else {
    verifyResult.title = '核验失败'
    verifyResult.message = '未找到匹配的执法人员信息'
    verifyResult.tips = `系统中不存在证件号 ${verifyForm.certificateNo} 或姓名 ${verifyForm.name} 的执法人员`
  }
  
  showVerifyResultDialog.value = true
}

const initTrendChart = () => {
  const chart = echarts.init(trendChartRef.value)
  chart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: stats.caseTrend.map(item => item.month)
    },
    yAxis: { type: 'value' },
    series: [{
      data: stats.caseTrend.map(item => item.count),
      type: 'line',
      smooth: true,
      areaStyle: { color: 'rgba(64, 158, 255, 0.2)' },
      lineStyle: { color: '#409eff' },
      itemStyle: { color: '#409eff' }
    }]
  })
}

const initDeptChart = () => {
  const chart = echarts.init(deptChartRef.value)
  chart.setOption({
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', right: 10, top: 'center' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      label: { show: false },
      emphasis: {
        label: { show: true, fontSize: 14, fontWeight: 'bold' }
      },
      data: stats.deptDistribution.map(item => ({
        name: item.name,
        value: item.value
      }))
    }]
  })
}

onMounted(() => {
  initTrendChart()
  initDeptChart()
  window.addEventListener('resize', () => {
    echarts.getInstanceByDom(trendChartRef.value)?.resize()
    echarts.getInstanceByDom(deptChartRef.value)?.resize()
  })
})
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stats-row {
  margin-bottom: 0;
}

.stat-card {
  border: none;
  border-radius: 8px;
}

.stat-blue {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.stat-orange {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: #fff;
}

.stat-green {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: #fff;
}

.stat-red {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  color: #fff;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-icon {
  opacity: 0.9;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
  margin-top: 4px;
}

.chart-card {
  height: 350px;
}

.chart {
  width: 100%;
  height: 280px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.warning-card {
  height: 320px;
}

.quick-card {
  height: 320px;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  padding: 10px 0;
}

.quick-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  color: #606266;
}

.quick-item:hover {
  background-color: #f0f2f5;
  transform: translateY(-2px);
}

.quick-item span {
  font-size: 13px;
}
</style>
