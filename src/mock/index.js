export const dashboardStats = {
  totalCases: 1256,
  pendingReview: 89,
  completedThisMonth: 156,
  warningCount: 12,
  caseTrend: [
    { month: '1月', count: 98 },
    { month: '2月', count: 112 },
    { month: '3月', count: 135 },
    { month: '4月', count: 120 },
    { month: '5月', count: 145 },
    { month: '6月', count: 156 }
  ],
  deptDistribution: [
    { name: '市场监管局', value: 356 },
    { name: '公安局', value: 289 },
    { name: '环保局', value: 215 },
    { name: '住建局', value: 198 },
    { name: '交通局', value: 120 },
    { name: '其他', value: 78 }
  ],
  caseTypeDistribution: [
    { name: '行政处罚', value: 456 },
    { name: '行政强制', value: 234 },
    { name: '行政许可', value: 189 },
    { name: '行政检查', value: 377 }
  ]
}

export const inspectionPlans = [
  { id: 1, name: '2026年第二季度市场专项检查', dept: '市场监管局', status: '进行中', startDate: '2026-06-01', endDate: '2026-06-30', taskCount: 25, completedCount: 12 },
  { id: 2, name: '环境保护执法大检查', dept: '环保局', status: '进行中', startDate: '2026-05-15', endDate: '2026-06-15', taskCount: 18, completedCount: 15 },
  { id: 3, name: '安全生产专项整治', dept: '应急管理局', status: '待开始', startDate: '2026-06-10', endDate: '2026-07-10', taskCount: 30, completedCount: 0 },
  { id: 4, name: '交通违法行为整治', dept: '交通局', status: '已完成', startDate: '2026-04-01', endDate: '2026-05-31', taskCount: 45, completedCount: 45 },
  { id: 5, name: '建筑工地扬尘治理', dept: '住建局', status: '进行中', startDate: '2026-05-01', endDate: '2026-06-30', taskCount: 20, completedCount: 8 }
]

export const caseList = [
  { id: 'AJ202606001', title: '某超市销售过期食品案', type: '行政处罚', dept: '市场监管局', status: '调查中', createTime: '2026-06-05', handler: '张三', amount: 5000 },
  { id: 'AJ202606002', title: '某企业违法排放污水案', type: '行政处罚', dept: '环保局', status: '法制审核', createTime: '2026-06-04', handler: '李四', amount: 20000 },
  { id: 'AJ202606003', title: '某工地未采取扬尘防治措施', type: '行政处罚', dept: '住建局', status: '待执行', createTime: '2026-06-03', handler: '王五', amount: 10000 },
  { id: 'AJ202605089', title: '某公司未经许可经营', type: '行政强制', dept: '市场监管局', status: '已结案', createTime: '2026-05-28', handler: '赵六', amount: 30000 },
  { id: 'AJ202605088', title: '某车辆超限运输', type: '行政处罚', dept: '交通局', status: '已结案', createTime: '2026-05-25', handler: '钱七', amount: 8000 }
]

export const documentTemplates = [
  { id: 1, name: '行政处罚决定书', type: '处罚文书', usageCount: 256, updateTime: '2026-05-20' },
  { id: 2, name: '现场检查笔录', type: '笔录文书', usageCount: 512, updateTime: '2026-06-01' },
  { id: 3, name: '询问笔录', type: '笔录文书', usageCount: 389, updateTime: '2026-05-28' },
  { id: 4, name: '查封扣押决定书', type: '强制文书', usageCount: 78, updateTime: '2026-05-15' },
  { id: 5, name: '听证告知书', type: '通知文书', usageCount: 45, updateTime: '2026-06-02' }
]

export const reviewList = [
  { id: 1, caseId: 'AJ202606002', caseTitle: '某企业违法排放污水案', submitDept: '环保局', submitTime: '2026-06-04', status: '待审核', reviewer: '' },
  { id: 2, caseId: 'AJ202605090', caseTitle: '某餐厅无证经营案', submitDept: '市场监管局', submitTime: '2026-06-03', status: '审核中', reviewer: '李审核员' },
  { id: 3, caseId: 'AJ202605087', caseTitle: '某工厂安全生产不达标', submitDept: '应急管理局', submitTime: '2026-06-02', status: '已通过', reviewer: '王审核员' },
  { id: 4, caseId: 'AJ202605086', caseTitle: '某开发商违规预售', submitDept: '住建局', submitTime: '2026-06-01', status: '已退回', reviewer: '张审核员' }
]

export const complaintsList = [
  { id: 1, title: '反映执法人员态度恶劣', complainant: '匿名', type: '执法行为投诉', status: '处理中', createTime: '2026-06-05', handler: '刘主任' },
  { id: 2, title: '举报某企业偷排废气', complainant: '张先生', type: '违法线索举报', status: '已受理', createTime: '2026-06-04', handler: '王科长' },
  { id: 3, title: '对处罚决定不服', complainant: '李女士', type: '行政复议申请', status: '已办结', createTime: '2026-05-28', handler: '赵主任' },
  { id: 4, title: '反映某部门不作为', complainant: '陈先生', type: '履职投诉', status: '处理中', createTime: '2026-06-02', handler: '周科长' }
]

export const litigationList = [
  { id: 1, caseId: 'AJ202603015', caseTitle: '某公司不服行政处罚案', type: '行政复议', status: '审理中', acceptDate: '2026-05-10', applicant: '某贸易有限公司' },
  { id: 2, caseId: 'AJ202602008', caseTitle: '王某不服行政强制案', type: '行政诉讼', status: '已开庭', acceptDate: '2026-04-15', applicant: '王某' },
  { id: 3, caseId: 'AJ202601023', caseTitle: '某企业行政许可纠纷案', type: '行政诉讼', status: '已判决', acceptDate: '2026-03-20', applicant: '某科技公司' }
]

export const punishmentBenchmark = [
  { id: 1, violation: '销售过期食品', basis: '食品安全法第一百二十四条', minAmount: 5000, maxAmount: 50000, level: '一般' },
  { id: 2, violation: '违法排放水污染物', basis: '水污染防治法第八十三条', minAmount: 10000, maxAmount: 100000, level: '较重' },
  { id: 3, violation: '未采取扬尘防治措施', basis: '大气污染防治法第一百一十五条', minAmount: 10000, maxAmount: 50000, level: '一般' },
  { id: 4, violation: '超限运输', basis: '公路安全保护条例第六十四条', minAmount: 200, maxAmount: 30000, level: '一般' }
]

export const enforcementOfficers = [
  { id: 1, name: '张三', dept: '市场监管局', certificateNo: 'ZF20230001', status: '有效', expireDate: '2028-12-31' },
  { id: 2, name: '李四', dept: '环保局', certificateNo: 'ZF20230002', status: '有效', expireDate: '2028-12-31' },
  { id: 3, name: '王五', dept: '住建局', certificateNo: 'ZF20230003', status: '有效', expireDate: '2027-06-30' },
  { id: 4, name: '赵六', dept: '交通局', certificateNo: 'ZF20220015', status: '即将到期', expireDate: '2026-08-15' }
]

export const warningList = [
  { id: 1, type: '案件超期预警', content: '案件AJ202605080已超过办理期限3天', level: '高', time: '2026-06-05 10:30' },
  { id: 2, type: '证件到期预警', content: '执法人员赵六的执法证将于2026-08-15到期', level: '中', time: '2026-06-05 09:15' },
  { id: 3, type: '程序异常预警', content: '案件AJ202606001缺少现场检查笔录', level: '高', time: '2026-06-04 16:45' },
  { id: 4, type: '金额异常预警', content: '案件AJ202605095处罚金额低于裁量基准下限', level: '中', time: '2026-06-04 14:20' }
]
