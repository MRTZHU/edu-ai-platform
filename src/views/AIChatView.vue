<template>
  <div class="ai-chat-view h-full">
    <!-- 加载状态 -->
    <div v-if="isLoading" class="h-full flex items-center justify-center">
      <div class="text-center">
        <i-lucide-loader-2 class="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
        <p class="text-slate-600 dark:text-slate-400">正在加载工具配置...</p>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="h-full flex items-center justify-center">
      <div class="text-center max-w-md">
        <i-lucide-alert-circle class="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 class="text-xl font-semibold text-slate-900 dark:text-white mb-2">
          工具加载失败
        </h2>
        <p class="text-slate-600 dark:text-slate-400 mb-4">
          {{ error }}
        </p>
        <div class="flex gap-3 justify-center">
          <button
            @click="loadToolConfig"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            重新加载
          </button>
          <button
            @click="goToToolbox"
            class="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
          >
            返回工具箱
          </button>
        </div>
      </div>
    </div>

    <!-- 对话界面 -->
    <UniversalChatInterface
      v-else-if="toolConfig"
      :tool-config="toolConfig"
      :tool-id="toolId"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { DifyAppConfig } from '@/config/ai'
import aiConfig from '@/config/ai'
import UniversalChatInterface from '@/components/UniversalChatInterface.vue'

/**
 * 路由参数
 */
interface Props {
  toolId: string
}

const props = defineProps<Props>()
const router = useRouter()

// 状态管理
const isLoading = ref(true)
const error = ref('')
const toolConfig = ref<DifyAppConfig | null>(null)

/**
 * 加载工具配置
 */
const loadToolConfig = async () => {
  isLoading.value = true
  error.value = ''

  try {
    // 从AI配置中查找对应的工具
    const tool = aiConfig.apps[props.toolId]
    
    if (!tool) {
      throw new Error(`未找到工具配置: ${props.toolId}`)
    }

    // 验证工具配置的完整性
    if (!tool.name || !tool.description) {
      throw new Error('工具配置不完整')
    }

    toolConfig.value = tool
  } catch (err) {
    console.error('加载工具配置失败:', err)
    error.value = err instanceof Error ? err.message : '未知错误'
  } finally {
    isLoading.value = false
  }
}

/**
 * 返回工具箱
 */
const goToToolbox = () => {
  router.push({ name: 'aiMagicToolbox' })
}

// 组件挂载时加载配置
onMounted(() => {
  loadToolConfig()
})
</script>

<style scoped>
.ai-chat-view {
  /* 确保页面占满整个视口高度 */
  min-height: 100%;
}
</style> 