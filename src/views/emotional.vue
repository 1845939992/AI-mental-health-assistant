<template>
  <div>
    <PageHead title="情绪日志" />
    <TableSearch :formItem="formItem" @search="handleSearch" />
    <el-table :data="tableData" style="width: 100%">
      <el-table-column prop="id" label="用户ID" width="80" />
      <el-table-column label="会话ID" width="80" >
        <template #default="scope">
          <el-avatar :size="240" >{{scope.row.nickname}}</el-avatar>
        </template>
      </el-table-column>
      <el-table-column prop="diaryDate" label="记录日期" width="120" />
      <el-table-column prop="moodScore" label="情绪评分" >
        <template #default="scope">
        <el-rate
           v-model="scope.row.moodScore"
           disabled
           show-score
           text-color="#ff9900"
           score-template="{value} points"
           :max="10"
         />
        </template>
      </el-table-column>
      <el-table-column label="生活指标" width="120" >
        <template #default="scope">
            <div>
              <p>睡眠质量：{{scope.row.sleepQuality}} / 5</p>
              <p>压力等级：{{scope.row.stressLevel}} / 5</p>
            </div>
        </template>
      </el-table-column>
      <el-table-column prop="emotionTriggers" label="情绪触发因素" width="120" />
      <el-table-column prop="diaryContent" label="日记内容" width="250" />
       <el-table-column label="操作" width="200" fixed="right">
      <template #default="scope">
        <el-button size="small" text type="primary" @click="handleEdit(scope.row)">详情</el-button>
        <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
      </template>
    </el-table-column>
    </el-table>
    <!-- 分页 -->
    <el-pagination
      style="margin-top: 25px;"
      layout="prev, pager, next"
      :total="pagination.total"
      :page-size="pagination.size"
      v-model:current-page="pagination.current"
      @current-change="handleChange"
    />
  </div>
</template>
<script setup>
import { ref, onMounted, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import PageHead from '@/components/PageHead.vue'
import TableSearch from '@/components/TableSearch.vue'
import { getEmotionDiaryPage } from '@/api/asmin'

const formItem = [{label: '用户ID ',prop: 'userId',comp: 'input',placeholder: '请输入用户ID',
                  },
                  {label: '情绪评分',prop: 'moodScreRange',comp: 'select',placeholder: '请选择情绪评分',options:[
                    {label: '低分（1-3）',value: '1-3'},
                    {label: '中分（4-6）',value: '4-6'},
                    {label: '高分（7-10）',value: '7-10'},
                  ]
                  }]

const tableData = ref([])// 表格数据
const pagination = reactive({
  total: 0,  // 总条数
  size: 10,  // 每页多少条
  currentPage: 1,   // 当前页码
})

const handleEdit = (row) => {
  // TODO: 查看情绪日记详情
}

const handleDelete = (row) => {
  // TODO: 删除情绪日记
}

const handleChange = (val) => {
  pagination.currentPage = val
  handleSearch({})
}

const handleSearch = async (formData) => {
  console.log(formData)
  const params = {
    currentPage: pagination.currentPage,
    size: pagination.size,
    ...(formData || {}),
  }
  try {
    const {records, total} = await getEmotionDiaryPage(params)
    tableData.value = records || []
    pagination.total = total || 0
  } catch {
    // 请求失败
    ElMessage.error('查询失败')
    return
  }
}

onMounted(() => {
  handleSearch({})
})
</script>
<style scoped>

</style>
