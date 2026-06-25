<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <h2 class="dashboard-title">数据概览</h2>
      <p class="dashboard-desc">实时监测平台核心指标，洞察用户情绪趋势</p>
    </div>

    <el-row :gutter="24" class="stats-row">
      <el-col :xs="24" :sm="12" :lg="6" class="stats-col">
        <div class="stat-card stat-card--users">
          <div class="stat-card__icon-box">
            <el-image :src="iconUrl1" alt="用户" class="stat-card__icon" />
          </div>
          <div class="stat-card__body">
            <span class="stat-card__label">总用户数</span>
            <span class="stat-card__value">{{ aiData.systemOverview?.totalUsers || 0 }}</span>
            <span class="stat-card__sub">活跃用户 {{ aiData.systemOverview?.activeUsers || 0 }}</span>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6" class="stats-col">
        <div class="stat-card stat-card--diary">
          <div class="stat-card__icon-box">
            <el-image :src="iconUrl2" alt="日志" class="stat-card__icon" />
          </div>
          <div class="stat-card__body">
            <span class="stat-card__label">情绪日志</span>
            <span class="stat-card__value">{{ aiData.systemOverview?.totalDiaries || 0 }}</span>
            <span class="stat-card__sub">今日新增 {{ aiData.systemOverview?.todayNewDiaries || 0 }}</span>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6" class="stats-col">
        <div class="stat-card stat-card--session">
          <div class="stat-card__icon-box">
            <el-image :src="iconUrl3" alt="咨询" class="stat-card__icon" />
          </div>
          <div class="stat-card__body">
            <span class="stat-card__label">咨询会话</span>
            <span class="stat-card__value">{{ aiData.systemOverview?.totalSessions || 0 }}</span>
            <span class="stat-card__sub">今日新增 {{ aiData.systemOverview?.todayNewSessions || 0 }}</span>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6" class="stats-col">
        <div class="stat-card stat-card--mood">
          <div class="stat-card__icon-box">
            <el-image :src="iconUrl4" alt="心情" class="stat-card__icon" />
          </div>
          <div class="stat-card__body">
            <span class="stat-card__label">平均心情</span>
            <span class="stat-card__value">{{ aiData.systemOverview?.avgMoodScore || 0 }}<small>/10</small></span>
            <span class="stat-card__sub">情绪健康指数</span>
          </div>
        </div>
      </el-col>
    </el-row>
    <!-- 第一行：用户情绪趋势 + 咨询会话统计 各占 50% -->
    <el-row :gutter="24" class="chart-row">
      <el-col :xs="24" :lg="12" class="chart-col">
          <el-card>
               <template #header>
                <div class="card-header">
                 <span>用户情绪趋势</span>
                 </div>
               </template>
               <div class="chart-body">
                   <div ref="emotionChartRef" class="emotion-chart"></div>
               </div>
          </el-card>
      </el-col>
      <el-col :xs="24" :lg="12" class="chart-col">
          <el-card>
               <template #header>
                <div class="card-header">
                 <span>咨询会话统计</span>
                 </div>
               </template>
               <div class="chart-body">
                  <div class="cs-stats">
                    <div class="cs-stats__item">
                      <span class="cs-stats__label">会话总数</span>
                      <span class="cs-stats__value">{{ aiData.consultationStats?.totalSessions || 0 }}</span>
                    </div>
                    <div class="cs-stats__item">
                      <span class="cs-stats__label">平均时长</span>
                      <span class="cs-stats__value">{{ aiData.consultationStats?.avgDurationMinutes || 0 }}<small> 分钟</small></span>
                    </div>
                    <div class="cs-stats__item">
                      <span class="cs-stats__label">活跃用户</span>
                      <span class="cs-stats__value">{{ aiData.systemOverview?.activeUsers || 0 }}</span>
                    </div>
                  </div>
                <div ref="consultationChartRef" class="emotion-chart emotion-chart--compact"></div>
               </div>
          </el-card>
      </el-col>
    </el-row>
    <!-- 第二行：用户活跃度趋势 占 100% -->
    <el-row :gutter="24" class="chart-row">
      <el-col :xs="24" :lg="24" class="chart-col chart-col--full">
          <el-card>
               <template #header>
                <div class="card-header">
                 <span>用户活跃度趋势</span>
                 </div>
               </template>
               <div class="chart-body">
                   <div ref="userActiveChartRef" class="emotion-chart emotion-chart--wide"></div>
               </div>
          </el-card>
      </el-col>
    </el-row>
  </div>
</template>
<script setup>
/**
 * 管理端数据看板
 * 展示系统运营核心指标（总用户/情绪日志/咨询会话/平均心情）+ 三张 ECharts 图表
 * 数据流：onMounted → getAnalyticsOverview() → 填充 aiData → initChart() 渲染图表
 */
import { getAnalyticsOverview } from '@/api/asmin'
import { onMounted, ref } from 'vue'
import * as echarts from 'echarts'

const aiData = ref({}) // 所有图表数据统一存储，由 overview API 一次返回

// --- 统计卡片图标（Vite 动态导入）---
const iconUrl1 = new URL('@/assets/images/users.png', import.meta.url).href
const iconUrl2 = new URL('@/assets/images/like.png', import.meta.url).href
const iconUrl3 = new URL('@/assets/images/comments.png', import.meta.url).href
const iconUrl4 = new URL('@/assets/images/开心.png', import.meta.url).href

// --- 图表 DOM 引用与实例 ---
// 三张图表的容器引用和 ECharts 实例分开管理，避免 dispose/init 时的竞态
const emotionChartRef = ref(null)       // 用户情绪趋势图容器
let emotionChart = null                 // 用户情绪趋势图实例
const consultationChartRef = ref(null)  // 咨询会话统计图容器
let consultationChart = null            // 咨询会话统计图实例
const userActiveChartRef = ref(null)    // 用户活跃度趋势图容器
let userActiveChartChart = null         // 用户活跃度趋势图实例

/** 统一初始化三张图表 */
const initChart = () => {
  initEmotionChart()
  initConsultationChart()
  initUserActiveChart()
}

/**
 * 初始化「用户情绪趋势」图表
 * 双 Y 轴折线图：左轴=平均情绪评分（紫色），右轴=记录数量（金色）
 * 带渐变填充区域，line 类型，smooth 曲线
 */
const initEmotionChart = () => {
  if (!emotionChartRef.value) return
  // 清空旧图表
  if (emotionChart) {
    emotionChart.dispose()
  }
  // 创建新实例
  emotionChart = echarts.init(emotionChartRef.value)
  const TrendData = aiData.value.emotionTrend || []
  // 图表配置
  const option = {
    color: ['#818CF8', '#F59E0B'], // 全局色板
        // 图表提示框
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(255,255,255,0.96)',
          borderColor: '#E5E7EB',
          borderWidth: 1,
        // 提示框样式
          textStyle: {
            color: '#374151',
            fontSize: 13,
            fontWeight: '500'
          },
          axisPointer: {
            type: 'line' // 虚线指示
          }
        },
        // 图表图例
        legend: {
          data: ['平均情绪评分', '记录数量'],
          top: '10%',
          textStyle: {
            color: '#6B7280',
            fontSize: 13,
            fontWeight: '500'
          }
        },
        grid: {
          top: 35,
          bottom: '3%',
          left: '3%',
          right: '4%',
        },
        // 图表x轴
        xAxis: {
          type: 'category',
          data: TrendData.map(item => item.date),
          axisLine: {
            lineStyle: {
              color: '#D1D5DB'
            }
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            color: '#9CA3AF',
            fontSize: 12,
            fontWeight: '400'
          }
        },
        // 图表y轴
        yAxis: [{
          type: 'value',
          name: '平均情绪评分',
          position: 'left',
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          splitLine: {
            lineStyle: {
              color: '#F3F4F6',
              type: 'dashed'
            }
          },
          axisLabel: {
            color: '#9CA3AF',
            fontSize: 12,
            fontWeight: '400'
          },
          nameTextStyle: {
            color: '#818CF8',
            fontSize: 12,
            fontWeight: '500'
          }
        },
        {
          type: 'value',
          name: '记录数量',
          position: 'right',
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          splitLine: {
            show: false
          },
          axisLabel: {
            color: '#9CA3AF',
            fontSize: 12,
            fontWeight: '400'
          },
          nameTextStyle: {
            color: '#F59E0B',
            fontSize: 12,
            fontWeight: '500'
          }
        }],
        // 图表系列
        series: [
          {
            name: '平均情绪评分',
            type: 'line',
            data: TrendData.map(item => item.avgMoodScore || 0),
            smooth: true,
            // 图表样式
            lineStyle: {
              color: '#818CF8',
              width: 2.5
            },
            itemStyle: {
              color: '#818CF8',
              borderRadius: 4 // 点的圆角半径
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(129,140,248,0.15)' },
                { offset: 1, color: 'rgba(129,140,248,0.02)' }
              ])
            }
          },
          {
            name: '记录数量',
            type: 'line',
            data: TrendData.map(item => item.recordCount || 0),
            smooth: true,
            // 图表样式
            lineStyle: {
              color: '#F59E0B',
              width: 2.5
            },
            itemStyle: {
              color: '#F59E0B',
              borderRadius: 4 // 点的圆角半径
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(245,158,11,0.12)' },
                { offset: 1, color: 'rgba(245,158,11,0.02)' }
              ])
            }
          }
        ]
        };
  // 渲染图表
  emotionChart.setOption(option)
}
/**
 * 初始化「咨询会话统计」图表
 * 柱状图（双系列）：会话数量（紫蓝渐变柱）+ 参与用户数（金色渐变柱）
 * 带阴影指示器（shadow），tooltip 智能定位避免溢出
 */
const initConsultationChart = () => {
  if (!consultationChartRef.value) return
  // 清空旧图表
  if (consultationChart) {
    consultationChart.dispose()
  }
  // 创建新实例
  consultationChart = echarts.init(consultationChartRef.value)
  const dailyTrend = aiData.value.consultationStats.dailyTrend || []
  // 图表配置
  const option = {
    color: ['#818CF8', '#F59E0B'], // 全局色板
        // 图表提示框
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(255,255,255,0.96)',
          borderColor: '#E5E7EB',
          borderWidth: 1,
          position: function (point, params, dom, rect, size) {
            return [point[0] - size.contentSize[0] / 2, point[1] - size.contentSize[1] - 12]
          },
        // 提示框样式
          textStyle: {
            color: '#374151',
            fontSize: 13,
            fontWeight: '500'
          },
          axisPointer: {
            type: 'shadow' // 柱状阴影指示器
          }
        },
        // 图表图例
        legend: {
          data: ['会话数量', '参与用户数'],
          top: '0%',
          textStyle: {
            color: '#6B7280',
            fontSize: 13,
            fontWeight: '500'
          }
        },
        grid: {
          top: 25,
          bottom: '3%',
          left: '3%',
          right: '4%',
        },
        // 图表x轴
        xAxis: {
          type: 'category',
          data: dailyTrend.map(item => item.date),
          axisLine: {
            lineStyle: {
              color: '#D1D5DB'
            }
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            color: '#9CA3AF',
            fontSize: 12,
            fontWeight: '400'
          }
        },
        // 图表y轴
        yAxis: [{
          type: 'value',
          name: '会话数量',
          position: 'left',
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          splitLine: {
            lineStyle: {
              color: '#F3F4F6',
              type: 'dashed'
            }
          },
          axisLabel: {
            color: '#9CA3AF',
            fontSize: 12,
            fontWeight: '400'
          },
          nameTextStyle: {
            color: '#818CF8',
            fontSize: 12,
            fontWeight: '500'
          }
        },
        {
          type: 'value',
          name: '参与用户数',
          position: 'right',
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          splitLine: {
            show: false
          },
          axisLabel: {
            color: '#9CA3AF',
            fontSize: 12,
            fontWeight: '400'
          },
          nameTextStyle: {
            color: '#F59E0B',
            fontSize: 12,
            fontWeight: '500'
          }
        }],
        // 图表系列
        series: [
          {
            name: '会话数量',
            type: 'bar',
            barMaxWidth: 32,
            data: dailyTrend.map(item => item.sessionCount),
            // 图表样式
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#A5B4FC' },
                { offset: 1, color: '#818CF8' }
              ]),
              borderRadius: [6, 6, 0, 0]
            }
          },
          {
            name: '参与用户数',
            type: 'bar',
            barMaxWidth: 32,
            data: dailyTrend.map(item => item.userCount),
            // 图表样式
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#FCD34D' },
                { offset: 1, color: '#F59E0B' }
              ]),
              borderRadius: [6, 6, 0, 0]
            }
          }
        ]
        };
  // 渲染图表
  consultationChart.setOption(option)
}
/**
 * 初始化「用户活跃度趋势」图表
 * 四系列折线图（全宽占一行）：活跃用户 / 新增用户 / 日记用户 / 咨询用户
 * 四色区分（紫/金/绿/红），各带渐变填充，smooth 曲线
 */
const initUserActiveChart = () => {
  if (!userActiveChartRef.value) return
  // 清空旧图表
  if (userActiveChartChart) {
    userActiveChartChart.dispose()
  }
  // 创建新实例
  userActiveChartChart = echarts.init(userActiveChartRef.value)
  const activityData = aiData.value.userActivity || []
  // 图表配置
  const option = {
    color: ['#818CF8', '#F59E0B', '#10B981', '#F43F5E'], // 全局色板
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderColor: '#E5E7EB',
    borderWidth: 1,
    position: function (point, params, dom, rect, size) {
      return [point[0] - size.contentSize[0] / 2, point[1] - size.contentSize[1] - 12]
    },
    textStyle: {
      color: '#374151',
      fontSize: 13,
      fontWeight: '500'
    }
  },
  legend: {
    data: ['活跃用户', '新增用户', '日记用户', '咨询用户'],
    top: '0%',
    textStyle: {
      color: '#6B7280',
      fontSize: 13,
      fontWeight: '500'
    }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    top: 35,
  },
  xAxis: {
    type: 'category',
    data: activityData.map(item => item.date),
    axisLine: {
      lineStyle: {
        color: '#D1D5DB'
      }
    },
    axisTick: {
      show: false
    },
    axisLabel: {
      color: '#9CA3AF',
      fontSize: 12,
      fontWeight: '400'
    }
  },
  yAxis: {
    type: 'value',
    axisLine: {
      show: false
    },
    axisTick: {
      show: false
    },
    splitLine: {
      lineStyle: {
        color: '#F3F4F6',
        type: 'dashed'
      }
    },
    axisLabel: {
      color: '#9CA3AF',
      fontSize: 12,
      fontWeight: '400'
    }
  },
  series: [
    {
      name: '活跃用户',
      type: 'line',
      data: activityData.map(item => item.activeUsers),
      smooth: true,
      lineStyle: {
        width: 2.5,
        color: '#818CF8'
      },
      itemStyle: {
        color: '#818CF8'
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(129,140,248,0.15)' },
          { offset: 1, color: 'rgba(129,140,248,0.02)' }
        ])
      }
    },
    {
      name: '新增用户',
      type: 'line',
      data: activityData.map(item => item.newUsers),
      smooth: true,
      lineStyle: {
        width: 2.5,
        color: '#F59E0B'
      },
      itemStyle: {
        color: '#F59E0B'
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(245,158,11,0.12)' },
          { offset: 1, color: 'rgba(245,158,11,0.02)' }
        ])
      }
    },
    {
      name: '日记用户',
      type: 'line',
      data: activityData.map(item => item.diaryUsers),
      smooth: true,
      lineStyle: {
        width: 2.5,
        color: '#10B981'
      },
      itemStyle: {
        color: '#10B981'
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(16,185,129,0.12)' },
          { offset: 1, color: 'rgba(16,185,129,0.02)' }
        ])
      }
    },
    {
      name: '咨询用户',
      type: 'line',
      data: activityData.map(item => item.consultationUsers),
      smooth: true,
      lineStyle: {
        width: 2.5,
        color: '#F43F5E'
      },
      itemStyle: {
        color: '#F43F5E'
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(244,63,94,0.12)' },
          { offset: 1, color: 'rgba(244,63,94,0.02)' }
        ])
      }
    }
  ]
  }
  // 渲染图表
  userActiveChartChart.setOption(option)
}




/**
 * 页面挂载后：先拉取 overview 数据填充 aiData，再调用 initChart 统一渲染三张图表
 * 注意：必须先有数据再渲染，否则 ECharts 绑定的是空数据集
 */
onMounted(() => {
  getAnalyticsOverview().then(res => {
    aiData.value = res
    initChart() // 数据就绪后统一渲染，避免多次 setOption 闪烁
  })
})

</script>
<style lang="scss" scoped>
// ============================================================
//  Dashboard — Soft Sanctuary 主题
// ============================================================

// -- 设计令牌 -------------------------------------------------
$color-users:    #818CF8;
$color-diary:    #F59E0B;
$color-session:  #10B981;
$color-mood:     #F43F5E;

$radius-card:    16px;
$radius-icon:    14px;
$shadow-card:    0 2px 12px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06);
$shadow-hover:   0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.06);
$transition:     0.3s cubic-bezier(0.4, 0, 0.2, 1);

// -- 入场动画 -------------------------------------------------
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes shimmer {
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
}

@keyframes breathe {
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.02); }
}

// ============================================================
//  容器 & 背景
// ============================================================
.dashboard-container {
  padding: 28px 32px 40px;
  min-height: 100%;
  overflow-x: hidden; // 防止 gutter 负边距 + 动画期间横向滚动条
  background:
    radial-gradient(ellipse 80% 60% at 20% 0%, rgba(129, 140, 248, 0.06), transparent),
    radial-gradient(ellipse 60% 50% at 80% 100%, rgba(16, 185, 129, 0.05), transparent),
    linear-gradient(180deg, #F9FAFB 0%, #F3F4F6 100%);
}

// ============================================================
//  头部区域
// ============================================================
.dashboard-header {
  margin-bottom: 28px;
}

.dashboard-title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #1F2937;
  letter-spacing: -0.02em;
  line-height: 1.3;
}

.dashboard-desc {
  margin: 6px 0 0;
  font-size: 14px;
  color: #9CA3AF;
  font-weight: 400;
}

// ============================================================
//  统计卡片行
// ============================================================
.stats-row {
  margin-top: 0 !important;
  margin-bottom: 0 !important;
}

.stats-col {
  margin-bottom: 24px;
}

// ============================================================
//  统计卡片 — 核心样式
// ============================================================
.stat-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 22px;
  background: #fff;
  border-radius: $radius-card;
  box-shadow: $shadow-card;
  cursor: default;
  overflow: hidden;
  transition: transform $transition, box-shadow $transition;

  // 左侧色条
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 16px;
    bottom: 16px;
    width: 4px;
    border-radius: 0 4px 4px 0;
    transition: height 0.35s ease, top 0.35s ease;
  }

  // 卡片悬浮
  &:hover {
    transform: translateY(-4px);
    box-shadow: $shadow-hover;

    &::before {
      top: 12px;
      bottom: 12px;
    }

    .stat-card__icon-box {
      animation: breathe 0.6s ease-in-out;
    }
  }

  // 入场动画（el-col 继承）
  animation: fadeUp 0.5s ease both;

  // ---- 各卡片配色 ------------------------------------------
  &--users {
    &::before { background: $color-users; }
    .stat-card__icon-box { background: linear-gradient(135deg, #C7D2FE, #A5B4FC); }
    .stat-card__value { color: $color-users; }
    .stat-card__sub   { color: $color-users; }
  }

  &--diary {
    animation-delay: 0.1s;
    &::before { background: $color-diary; }
    .stat-card__icon-box { background: linear-gradient(135deg, #FDE68A, #FCD34D); }
    .stat-card__value { color: $color-diary; }
    .stat-card__sub   { color: $color-diary; }
  }

  &--session {
    animation-delay: 0.2s;
    &::before { background: $color-session; }
    .stat-card__icon-box { background: linear-gradient(135deg, #A7F3D0, #6EE7B7); }
    .stat-card__value { color: $color-session; }
    .stat-card__sub   { color: $color-session; }
  }

  &--mood {
    animation-delay: 0.3s;
    &::before { background: $color-mood; }
    .stat-card__icon-box { background: linear-gradient(135deg, #FDA4AF, #FB7185); }
    .stat-card__value { color: $color-mood; }
    .stat-card__sub   { color: $color-mood; }
  }
}

// ============================================================
//  图标盒子
// ============================================================
.stat-card__icon-box {
  flex-shrink: 0;
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $radius-icon;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card__icon {
  width: 30px;
  height: 30px;
}

// ============================================================
//  卡片信息区
// ============================================================
.stat-card__body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.stat-card__label {
  font-size: 13px;
  font-weight: 500;
  color: #6B7280;
  letter-spacing: 0.01em;
}

.stat-card__value {
  font-size: 28px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;

  small {
    font-size: 16px;
    font-weight: 600;
    opacity: 0.7;
  }
}

.stat-card__sub {
  font-size: 12px;
  font-weight: 500;
  opacity: 0.75;
  letter-spacing: 0.01em;
}

// ============================================================
//  图表卡片头部
// ============================================================
.card-header {
  display: flex;
  align-items: center;
  gap: 8px;

  span {
    font-size: 16px;
    font-weight: 600;
    color: #1F2937;
    letter-spacing: -0.01em;
    line-height: 1.4;
  }
}

// ============================================================
//  图表区域
// ============================================================
.chart-row {
  margin-top: 24px;
}

.chart-col {
  margin-bottom: 24px;
}

.chart-col--full {
  .chart-body {
    animation-delay: 0.6s;
  }
}

.chart-body {
  animation: fadeUp 0.5s ease both;
  animation-delay: 0.4s;
}

.emotion-chart {
  height: 300px;
  width: 100%;
}

.emotion-chart--wide {
  height: 360px;
}

.emotion-chart--compact {
  height: 203px; // 300px - cs-stats(~97px) = 与左侧卡片精确对齐
}

// ============================================================
//  咨询统计横排指标
// ============================================================
.cs-stats {
  display: flex;
  gap: 32px;
  padding: 12px 0 20px;
  border-bottom: 1px solid #F3F4F6;
  margin-bottom: 16px;
  box-sizing: border-box; // 跨浏览器盒模型一致
}

.cs-stats__item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.cs-stats__label {
  font-size: 13px;
  font-weight: 500;
  color: #6B7280;
  letter-spacing: 0.01em;
}

.cs-stats__value {
  font-size: 24px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;
  color: #1F2937;

  small {
    font-size: 13px;
    font-weight: 500;
    color: #9CA3AF;
  }
}

// ============================================================
//  响应式
// ============================================================

// 平板：2 列
@media (max-width: 1199px) {
  .dashboard-container {
    padding: 20px 20px 32px;
  }

  .stat-card {
    padding: 18px 20px;
    gap: 14px;
  }

  .stat-card__icon-box {
    width: 46px;
    height: 46px;
  }

  .stat-card__icon {
    width: 26px;
    height: 26px;
  }

  .stat-card__value {
    font-size: 24px;
  }

  .cs-stats {
    gap: 24px;
  }

  .cs-stats__value {
    font-size: 22px;
  }
}

// 手机：单列 + 横排紧凑
@media (max-width: 767px) {
  .dashboard-container {
    padding: 16px 12px 24px;
  }

  .dashboard-header {
    margin-bottom: 20px;
  }

  .dashboard-title {
    font-size: 20px;
  }

  .stats-col {
    margin-bottom: 12px;
  }

  .stat-card {
    padding: 16px 18px;
    gap: 12px;
    border-radius: 14px;

    &::before {
      top: 14px;
      bottom: 14px;
      width: 3px;
    }
  }

  .stat-card__icon-box {
    width: 42px;
    height: 42px;
    border-radius: 12px;
  }

  .stat-card__icon {
    width: 24px;
    height: 24px;
  }

  .stat-card__value {
    font-size: 22px;
  }

  .stat-card__label {
    font-size: 12px;
  }

  .chart-row {
    margin-top: 16px;
  }

  .emotion-chart {
    height: 240px;
  }

  .emotion-chart--wide {
    height: 260px;
  }

  .emotion-chart--compact {
    height: 160px; // 240px - cs-stats(~80px)
  }

  .cs-stats {
    gap: 16px;
    padding: 8px 0 12px;
  }

  .cs-stats__value {
    font-size: 18px;
  }
}
</style>