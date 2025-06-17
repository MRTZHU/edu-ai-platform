<template>
  <div class="painting-tool-card group p-6 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
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
          <span class="text-sm text-slate-500 dark:text-slate-400">{{ tool.category }}</span>
        </div>
      </div>
      
      <!-- 收藏按钮 -->
      <button 
        @click.stop="toggleFavorite"
        class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        :class="{ 'text-yellow-500': isFavorited, 'text-slate-400': !isFavorited }"
      >
        <i-heroicons-outline:star class="h-4 w-4" :class="{ 'fill-current': isFavorited }" />
      </button>
    </div>

    <!-- 工具描述 -->
    <p class="text-slate-600 dark:text-slate-300 text-sm mb-4 line-clamp-2">
      {{ tool.description }}
    </p>

    <!-- 标签 -->
    <div class="flex flex-wrap gap-1 mb-4">
      <span
        v-for="tag in tool.tags.slice(0, 3)"
        :key="tag"
        class="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full
               dark:bg-blue-900/20 dark:text-blue-300"
      >
        {{ tag }}
      </span>
      <span
        v-if="tool.tags.length > 3"
        class="px-2 py-1 text-xs bg-slate-100 text-slate-500 rounded-full
               dark:bg-slate-700 dark:text-slate-400"
      >
        +{{ tool.tags.length - 3 }}
      </span>
    </div>

    <!-- 功能特性指示器 -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <!-- 输入类型指示器 -->
        <div class="flex items-center gap-1">
          <i-heroicons-outline:pencil 
            v-if="tool.features.supportTextInput" 
            class="h-3 w-3 text-green-500" 
            title="支持文本输入"
          />
          <i-heroicons-outline:camera 
            v-if="tool.features.supportImageInput" 
            class="h-3 w-3 text-blue-500" 
            title="支持图片上传"
          />
          <i-heroicons-outline:music-note 
            v-if="tool.features.supportAudioInput" 
            class="h-3 w-3 text-purple-500" 
            title="支持音频上传"
          />
        </div>
        
        <!-- 输出类型 -->
        <span class="text-xs text-slate-500 dark:text-slate-400">
          → {{ outputTypeLabel }}
        </span>
      </div>
      
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
    <div class="opacity-0 group-hover:opacity-100 transition-opacity">
      <button 
        @click="useTool"
        :disabled="!apiStatus"
        class="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg text-sm font-medium transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <component :is="tool.icon" class="h-4 w-4" />
        {{ apiStatus ? '开始创作' : 'API未配置' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { PaintingToolConfig } from '@/config/ai/painting'
import { difyApiService } from '@/services/difyApi'

interface Props {
  tool: PaintingToolConfig
  isFavorited?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isFavorited: false
})

const emit = defineEmits<{
  (e: 'use', tool: PaintingToolConfig): void
  (e: 'favorite', toolId: string, favorited: boolean): void
}>()

// API配置状态检查
const apiStatus = ref(false)

// 输出类型标签
const outputTypeLabel = computed(() => {
  const labels = {
    image: '图片',
    audio: '音频',
    video: '视频',
    text: '文本'
  }
  return labels[props.tool.features.outputType] || props.tool.features.outputType
})

// 检查API配置
const checkApiStatus = () => {
  const toolKey = props.tool.apikey.replace('VITE_DIFY_API_KEY_', '')
  apiStatus.value = difyApiService.checkApiConfig(toolKey)
}

// 切换收藏状态
const toggleFavorite = () => {
  emit('favorite', props.tool.id, !props.isFavorited)
}

// 使用工具
const useTool = () => {
  if (apiStatus.value) {
    emit('use', props.tool)
  }
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