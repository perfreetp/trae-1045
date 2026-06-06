<template>
  <div class="documents-page">
    <el-card>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="文书模板" name="templates">
          <div class="toolbar">
            <el-input v-model="searchKeyword" placeholder="搜索文书模板" style="width: 240px" clearable>
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button type="primary" @click="openUploadDialog">
              <el-icon><Upload /></el-icon>上传模板
            </el-button>
          </div>
          <el-row :gutter="20">
            <el-col :span="8" v-for="tpl in filteredTemplates" :key="tpl.id">
              <el-card class="template-card" shadow="hover">
                <div class="template-header">
                  <div class="template-icon">
                    <el-icon size="32"><Document /></el-icon>
                  </div>
                  <el-tag size="small" type="info">{{ tpl.type }}</el-tag>
                </div>
                <div class="template-body">
                  <h4>{{ tpl.name }}</h4>
                  <p class="template-meta">
                    已使用 {{ tpl.usageCount }} 次 · 更新于 {{ tpl.updateTime }}
                  </p>
                </div>
                <div class="template-footer">
                  <el-button size="small" type="primary" @click="handleUseTemplate(tpl)">套用</el-button>
                  <el-button size="small" @click="handlePreview(tpl)">预览</el-button>
                  <el-button size="small" @click="handleDownload(tpl)">下载</el-button>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </el-tab-pane>

        <el-tab-pane label="已生成文书" name="generated">
          <el-table :data="generatedDocs" border stripe>
            <el-table-column prop="name" label="文书名称" min-width="200" />
            <el-table-column prop="caseId" label="关联案件" width="140" />
            <el-table-column prop="type" label="文书类型" width="120" />
            <el-table-column prop="createTime" label="生成时间" width="160" />
            <el-table-column prop="creator" label="生成人" width="100" />
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === '已签发' ? 'success' : 'warning'" size="small">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="280" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="handleViewDoc(row)">查看</el-button>
                <el-button link type="primary" size="small" @click="handleEditDoc(row)">编辑</el-button>
                <el-button link type="primary" size="small" @click="handleDownloadDoc(row)">下载</el-button>
                <el-button link type="success" size="small" @click="handleSign(row)" v-if="row.status !== '已签发'">签发</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="文书套用" name="apply">
          <el-form :model="applyForm" label-width="120px" class="apply-form">
            <el-form-item label="选择模板">
              <el-select v-model="applyForm.templateId" placeholder="请选择文书模板" style="width: 300px">
                <el-option v-for="tpl in allTemplates" :key="tpl.id" :label="tpl.name" :value="tpl.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="关联案件">
              <el-select v-model="applyForm.caseId" placeholder="请选择关联案件" style="width: 300px">
                <el-option label="AJ202606001 某超市销售过期食品案" value="AJ202606001" />
                <el-option label="AJ202606002 某企业违法排放污水案" value="AJ202606002" />
                <el-option label="AJ202606003 某工地未采取扬尘防治措施" value="AJ202606003" />
              </el-select>
            </el-form-item>
            <el-form-item label="文书名称">
              <el-input v-model="applyForm.docName" style="width: 300px" />
            </el-form-item>
            <el-form-item label="当事人">
              <el-input v-model="applyForm.party" style="width: 300px" />
            </el-form-item>
            <el-form-item label="违法事实">
              <el-input v-model="applyForm.fact" type="textarea" :rows="4" style="width: 500px" />
            </el-form-item>
            <el-form-item label="处罚依据">
              <el-input v-model="applyForm.basis" type="textarea" :rows="3" style="width: 500px" />
            </el-form-item>
            <el-form-item label="处罚内容">
              <el-input v-model="applyForm.punishment" type="textarea" :rows="3" style="width: 500px" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleGenerate">生成文书</el-button>
              <el-button @click="handleResetApply">重置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-dialog v-model="showUploadDialog" title="上传文书模板" width="600px">
      <el-form :model="uploadForm" label-width="100px">
        <el-form-item label="模板名称">
          <el-input v-model="uploadForm.name" placeholder="请输入模板名称" />
        </el-form-item>
        <el-form-item label="模板类型">
          <el-select v-model="uploadForm.type" placeholder="请选择类型" style="width: 100%">
            <el-option label="处罚文书" value="处罚文书" />
            <el-option label="笔录文书" value="笔录文书" />
            <el-option label="强制文书" value="强制文书" />
            <el-option label="通知文书" value="通知文书" />
            <el-option label="其他文书" value="其他文书" />
          </el-select>
        </el-form-item>
        <el-form-item label="模板文件">
          <el-upload
            class="upload-demo"
            drag
            action="#"
            :auto-upload="false"
            :on-change="handleUploadFileChange"
            :file-list="uploadFileList"
          >
            <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
            <div class="el-upload__text">
              将模板文件拖到此处，或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持 doc、docx、pdf 等格式，单个文件不超过 20MB
              </div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showUploadDialog = false">取消</el-button>
        <el-button type="primary" @click="handleUpload">上传</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showEditDialog" title="编辑文书" width="700px">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="文书名称">
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item label="关联案件">
          <el-input v-model="editForm.caseId" disabled />
        </el-form-item>
        <el-form-item label="文书类型">
          <el-input v-model="editForm.type" disabled />
        </el-form-item>
        <el-form-item label="文书内容">
          <el-input v-model="editForm.content" type="textarea" :rows="10" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSaveEdit">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showPreviewDialog" title="文书预览" width="800px">
      <div class="preview-content">
        <h2 style="text-align: center; margin-bottom: 20px;">{{ currentDoc?.name || '行政处罚决定书' }}</h2>
        <p style="text-align: right; margin-bottom: 20px;">文号：X罚字〔2026〕第{{ String(currentDoc?.id || 1).padStart(3, '0') }}号</p>
        <p><strong>当事人：</strong>{{ currentDoc?.party || '某某超市有限公司' }}</p>
        <p><strong>法定代表人：</strong>张三</p>
        <p><strong>地址：</strong>某某市某某区某某路123号</p>
        <br>
        <p><strong>违法事实：</strong></p>
        <p style="text-indent: 2em;">{{ currentDoc?.fact || '经查，当事人于2026年6月1日在其经营场所销售超过保质期的食品，违反了《中华人民共和国食品安全法》第三十四条第（十）项的规定。' }}</p>
        <br>
        <p><strong>处罚依据：</strong></p>
        <p style="text-indent: 2em;">{{ currentDoc?.basis || '依据《中华人民共和国食品安全法》第一百二十四条第一款第（五）项的规定。' }}</p>
        <br>
        <p><strong>处罚决定：</strong></p>
        <p style="text-indent: 2em;">{{ currentDoc?.punishment || '1. 没收违法所得人民币500元；\n2. 罚款人民币5000元。' }}</p>
        <br>
        <p style="text-align: right;">某某市场监督管理局</p>
        <p style="text-align: right;">{{ currentDoc?.createTime || '2026年6月5日' }}</p>
      </div>
    </el-dialog>

    <el-dialog v-model="showSignDialog" title="签发文书" width="500px">
      <el-descriptions :column="1" border style="margin-bottom: 20px" v-if="currentDoc">
        <el-descriptions-item label="文书名称">{{ currentDoc.name }}</el-descriptions-item>
        <el-descriptions-item label="关联案件">{{ currentDoc.caseId }}</el-descriptions-item>
        <el-descriptions-item label="文书类型">{{ currentDoc.type }}</el-descriptions-item>
      </el-descriptions>
      <el-form :model="signForm" label-width="100px">
        <el-form-item label="签发人">
          <el-input v-model="signForm.issuer" placeholder="请输入签发人姓名" />
        </el-form-item>
        <el-form-item label="签发意见">
          <el-input v-model="signForm.opinion" type="textarea" :rows="3" placeholder="请输入签发意见" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showSignDialog = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmSign">确认签发</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Document, Search, Upload, UploadFilled } from '@element-plus/icons-vue'
import { documentTemplates } from '@/mock'
import { ElMessage } from 'element-plus'

const activeTab = ref('templates')
const searchKeyword = ref('')
const allTemplates = ref([...documentTemplates])

const filteredTemplates = computed(() => {
  if (!searchKeyword.value) return allTemplates.value
  return allTemplates.value.filter(tpl => 
    tpl.name.includes(searchKeyword.value) || tpl.type.includes(searchKeyword.value)
  )
})

const generatedDocs = ref([
  { id: 1, name: '行政处罚决定书（某某超市）', caseId: 'AJ202606001', type: '处罚文书', createTime: '2026-06-05 10:30', creator: '张三', status: '已签发', party: '某某超市有限公司', fact: '', basis: '', punishment: '' },
  { id: 2, name: '现场检查笔录', caseId: 'AJ202606002', type: '笔录文书', createTime: '2026-06-04 15:20', creator: '李四', status: '草稿', party: '', fact: '', basis: '', punishment: '' },
  { id: 3, name: '询问笔录', caseId: 'AJ202606001', type: '笔录文书', createTime: '2026-06-03 09:15', creator: '张三', status: '已签发', party: '', fact: '', basis: '', punishment: '' }
])

const applyForm = reactive({
  templateId: '',
  caseId: '',
  docName: '',
  party: '',
  fact: '',
  basis: '',
  punishment: ''
})

const uploadForm = reactive({
  name: '',
  type: '处罚文书'
})

const uploadFileList = ref([])

const editForm = reactive({
  id: '',
  name: '',
  caseId: '',
  type: '',
  content: ''
})

const signForm = reactive({
  issuer: '',
  opinion: ''
})

const showUploadDialog = ref(false)
const showPreviewDialog = ref(false)
const showEditDialog = ref(false)
const showSignDialog = ref(false)
const currentDoc = ref(null)

const openUploadDialog = () => {
  uploadForm.name = ''
  uploadForm.type = '处罚文书'
  uploadFileList.value = []
  showUploadDialog.value = true
}

const handleUploadFileChange = (file) => {
  if (!uploadForm.name) {
    uploadForm.name = file.name.replace(/\.[^/.]+$/, '')
  }
}

const handleUseTemplate = (tpl) => {
  activeTab.value = 'apply'
  applyForm.templateId = tpl.id
  if (!applyForm.docName) {
    applyForm.docName = tpl.name.replace('书', '书（新）')
  }
  tpl.usageCount++
}

const handlePreview = (tpl) => {
  currentDoc.value = { name: tpl.name, id: tpl.id, createTime: tpl.updateTime }
  showPreviewDialog.value = true
}

const handleDownload = (tpl) => {
  ElMessage.success(`正在下载模板：${tpl.name}`)
}

const handleDownloadDoc = (row) => {
  ElMessage.success(`正在下载文书：${row.name}`)
}

const handleGenerate = () => {
  if (!applyForm.templateId || !applyForm.docName) {
    ElMessage.warning('请选择模板并填写文书名称')
    return
  }
  const tpl = allTemplates.value.find(t => t.id === applyForm.templateId)
  const newDoc = {
    id: generatedDocs.value.length + 1,
    name: applyForm.docName,
    caseId: applyForm.caseId,
    type: tpl?.type || '处罚文书',
    createTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
    creator: '当前用户',
    status: '草稿',
    party: applyForm.party,
    fact: applyForm.fact,
    basis: applyForm.basis,
    punishment: applyForm.punishment
  }
  generatedDocs.value.unshift(newDoc)
  ElMessage.success(`文书"${newDoc.name}"生成成功，已在"已生成文书"列表中`)
  activeTab.value = 'generated'
}

const handleResetApply = () => {
  Object.assign(applyForm, {
    templateId: '',
    caseId: '',
    docName: '',
    party: '',
    fact: '',
    basis: '',
    punishment: ''
  })
}

const handleUpload = () => {
  if (!uploadForm.name) {
    ElMessage.warning('请输入模板名称')
    return
  }
  const newTpl = {
    id: allTemplates.value.length + 1,
    name: uploadForm.name,
    type: uploadForm.type,
    usageCount: 0,
    updateTime: new Date().toISOString().slice(0, 10)
  }
  allTemplates.value.unshift(newTpl)
  ElMessage.success(`模板"${newTpl.name}"上传成功，已在模板列表中`)
  showUploadDialog.value = false
}

const handleViewDoc = (row) => {
  currentDoc.value = row
  showPreviewDialog.value = true
}

const handleEditDoc = (row) => {
  Object.assign(editForm, {
    id: row.id,
    name: row.name,
    caseId: row.caseId,
    type: row.type,
    content: row.fact || ''
  })
  showEditDialog.value = true
}

const handleSaveEdit = () => {
  const index = generatedDocs.value.findIndex(d => d.id === editForm.id)
  if (index !== -1) {
    generatedDocs.value[index].name = editForm.name
    generatedDocs.value[index].fact = editForm.content
    ElMessage.success('文书已保存')
    showEditDialog.value = false
  }
}

const handleSign = (row) => {
  currentDoc.value = row
  signForm.issuer = ''
  signForm.opinion = ''
  showSignDialog.value = true
}

const handleConfirmSign = () => {
  if (!signForm.issuer) {
    ElMessage.warning('请输入签发人')
    return
  }
  if (currentDoc.value) {
    currentDoc.value.status = '已签发'
    const index = generatedDocs.value.findIndex(d => d.id === currentDoc.value.id)
    if (index !== -1) {
      generatedDocs.value[index].status = '已签发'
    }
    ElMessage.success('文书已签发')
    showSignDialog.value = false
  }
}
</script>

<style scoped>
.documents-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.template-card {
  margin-bottom: 20px;
}

.template-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.template-icon {
  color: #409eff;
}

.template-body h4 {
  margin: 0 0 8px 0;
  font-size: 15px;
  color: #303133;
}

.template-meta {
  font-size: 12px;
  color: #909399;
  margin: 0;
}

.template-footer {
  display: flex;
  gap: 8px;
  margin-top: 15px;
}

.apply-form {
  max-width: 700px;
  padding: 20px 0;
}

.preview-content {
  padding: 20px;
  background: #fff;
  min-height: 500px;
  line-height: 1.8;
}
</style>
