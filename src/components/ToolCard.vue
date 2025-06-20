<template>
  <div class="group p-6 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
    <!-- 工具图标和收藏按钮 -->
    <div class="flex items-start justify-between mb-4">
      <div class="flex items-center gap-3">
        <div 
          class="w-12 h-12 rounded-lg flex items-center justify-center"
          :style="{ backgroundColor: tool.iconBgColor }"
        >
          <component :is="tool.icon" class="h-6 w-6" />
        </div>
        <div>
          <h3 class="font-semibold text-slate-900 dark:text-white">{{ tool.name }}</h3>
          <span class="text-sm text-slate-500 dark:text-slate-400">{{ tool.typename }}</span>
        </div>
      </div>
      
      <!-- 收藏按钮 -->
      <button 
        @click.stop="toggleFavorite"
        class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        :class="{ 'text-yellow-500': isFavorited, 'text-slate-400': !isFavorited }"
      >
        <i-lucide-star class="h-4 w-4" :class="{ 'fill-current': isFavorited }" />
      </button>
    </div>

    <!-- 工具描述 -->
    <p class="text-slate-600 dark:text-slate-300 text-sm mb-4 line-clamp-2">
      {{ tool.description }}
    </p>

    <!-- 分类标签 -->
    <div class="flex items-center justify-between">
      <span class="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-md">
        {{ tool.category }}
      </span>
      
      <!-- API状态指示器 -->
      <div class="flex items-center gap-1">
        <div 
          class="w-2 h-2 rounded-full"
          :class="apiStatus ? 'bg-green-500' : 'bg-red-500'"
        ></div>
        <span class="text-xs text-slate-500 dark:text-slate-400">
          {{ apiStatus ? '已配置' : '未配置' }}
        </span>
      </div>
    </div>

    <!-- 悬停显示的使用按钮 -->
    <div class="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
      <div class="flex gap-2">
        <!-- 主要使用按钮 -->
      <button 
        @click="useTool"
        :disabled="!apiStatus"
          class="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg text-sm font-medium transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
          <i-lucide-message-circle class="h-4 w-4" />
          {{ apiStatus ? '开始对话' : 'API未配置' }}
        </button>
        
        <!-- 测试按钮 -->
        <button
          v-if="apiStatus"
          @click.stop="testTool"
          class="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm transition-colors flex items-center justify-center"
          title="API测试"
        >
          <i-lucide-beaker class="h-4 w-4" />
      </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { DifyAppConfig } from '../config/ai'
import { difyApiService } from '@/services/difyApi'

interface Props {
  tool: DifyAppConfig
}

const props = defineProps<Props>()
const emit = defineEmits(['use', 'favorite', 'test'])
const router = useRouter()

// 收藏状态 (暂时使用本地状态，后续可连接数据库)
const isFavorited = ref(false)

// API配置状态检查
const apiStatus = ref(false)

// 检查API配置
const checkApiStatus = () => {
  const toolKey = props.tool.apikey.replace('VITE_DIFY_API_KEY_', '')
  apiStatus.value = difyApiService.checkApiConfig(toolKey)
}

// 切换收藏状态
const toggleFavorite = () => {
  isFavorited.value = !isFavorited.value
  emit('favorite', props.tool.id, isFavorited.value)
}

// 使用工具 - 跳转到对话界面
const useTool = () => {
  if (apiStatus.value) {
    // 跳转到对话页面
    router.push({
      name: 'aiChat',
      params: {
        toolId: props.tool.id
      }
    })
    
    emit('use', props.tool)
  }
}

// 测试工具 - 弹窗API测试（保留原有功能用于开发调试）
const testTool = () => {
  emit('test', props.tool)
}

onMounted(() => {
  checkApiStatus()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style> 