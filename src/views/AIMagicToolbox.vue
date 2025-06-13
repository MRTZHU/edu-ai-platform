<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          🪄 AI 魔法工具箱
        </h1>
        <p class="text-slate-600 dark:text-slate-400">
          探索强大的AI工具，提升您的工作效率
        </p>
      </div>

      <!-- 收藏工具区域 -->
      <div v-if="favoriteTools.length > 0" class="mb-8">
        <h2 class="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <i-lucide-star class="h-5 w-5 text-yellow-500 fill-current" />
          我的收藏
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <ToolCard
            v-for="tool in favoriteTools"
            :key="tool.id"
            :tool="tool"
            @use="handleUseTool"
            @test="handleTestTool"
            @favorite="handleToggleFavorite"
          />
        </div>
      </div>

      <!-- 推荐工具区域 -->
      <div class="mb-8">
        <h2 class="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <i-lucide-star class="h-5 w-5 text-blue-500" />
          推荐工具
        </h2>
        
        <!-- 分类筛选 -->
        <CategoryFilter
          v-model:selectedCategory="selectedCategory"
          :tools="allTools"
        />

        <!-- 工具网格 -->
        <div v-if="filteredTools.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <ToolCard
            v-for="tool in filteredTools"
            :key="tool.id"
            :tool="tool"
            @use="handleUseTool"
            @test="handleTestTool"
            @favorite="handleToggleFavorite"
          />
        </div>

        <!-- 空状态 -->
        <div v-else class="text-center py-12">
          <i-lucide-search class="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-slate-900 dark:text-white mb-2">
            暂无工具
          </h3>
          <p class="text-slate-500 dark:text-slate-400">
            该分类下暂时没有可用的工具
          </p>
        </div>
      </div>

      <!-- 工具使用弹窗 -->
      <div v-if="showToolDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full m-4 max-h-[80vh] overflow-y-auto">
          <div class="p-6 border-b border-slate-200 dark:border-slate-700">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-slate-900 dark:text-white">
                {{ selectedTool?.name }}
              </h3>
              <button
                @click="closeToolDialog"
                class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <i-lucide-x class="h-6 w-6" />
              </button>
            </div>
            <p class="text-slate-600 dark:text-slate-400 mt-2">
              {{ selectedTool?.description }}
            </p>
          </div>
          
          <div class="p-6">
            <!-- 这里将来放置具体的工具使用界面 -->
            <div class="text-center py-8">
              <i-lucide-cpu class="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h4 class="text-lg font-medium text-slate-900 dark:text-white mb-2">
                工具界面开发中
              </h4>
              <p class="text-slate-500 dark:text-slate-400 mb-4">
                {{ selectedTool?.name }} 的具体使用界面正在开发中
              </p>
              
              <!-- 测试API按钮 -->
              <div class="space-y-4">
                <!-- API配置信息 -->
                <div class="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <h5 class="font-medium text-slate-900 dark:text-white mb-2">🔧 API配置信息</h5>
                  <div class="text-sm space-y-1">
                    <div class="flex justify-between">
                      <span class="text-slate-600 dark:text-slate-400">应用类型:</span>
                      <span class="text-slate-900 dark:text-white font-mono">
                        {{ selectedTool?.type }} 
                        <span class="text-xs text-slate-500">
                          ({{ selectedTool?.type === 'chat' ? 'Chat应用' : 'Workflow应用' }})
                        </span>
                      </span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-slate-600 dark:text-slate-400">API端点:</span>
                      <span class="text-slate-900 dark:text-white font-mono text-xs">
                        {{ selectedTool?.type === 'chat' ? '/chat-messages' : '/workflows/run' }}
                      </span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-slate-600 dark:text-slate-400">Base URL:</span>
                      <span class="text-slate-900 dark:text-white font-mono text-xs">{{ apiConfigInfo.baseUrl }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-slate-600 dark:text-slate-400">API Key:</span>
                      <span class="text-slate-900 dark:text-white font-mono text-xs">
                        {{ apiConfigInfo.hasApiKey ? apiConfigInfo.keyPrefix : '❌ 未配置' }}
                      </span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-slate-600 dark:text-slate-400">工具ID:</span>
                      <span class="text-slate-900 dark:text-white font-mono text-xs">{{ selectedToolKey }}</span>
                    </div>
                  </div>
                </div>

                <button
                  @click="testApiCall"
                  :disabled="isTestingApi || !apiConfigInfo.hasApiKey"
                  class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
                >
                  {{ isTestingApi ? '测试中...' : '测试API连接' }}
                </button>
              </div>
              
              <!-- API测试结果 -->
              <div v-if="apiTestResult" class="mt-4 p-4 rounded-lg text-left" :class="[
                apiTestResult.success 
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              ]">
                <h5 class="font-medium mb-2" :class="[
                  apiTestResult.success 
                    ? 'text-green-800 dark:text-green-200'
                    : 'text-red-800 dark:text-red-200'
                ]">
                  {{ apiTestResult.success ? '✅ API测试成功' : '❌ API测试失败' }}
                </h5>
                
                <!-- 错误详情 -->
                <div v-if="!apiTestResult.success && apiTestResult.details" class="mb-3 text-sm">
                  <div class="font-medium mb-1 text-red-700 dark:text-red-300">错误详情:</div>
                  <div class="space-y-1 text-red-600 dark:text-red-400">
                    <div v-if="apiTestResult.details.status">
                      HTTP状态: {{ apiTestResult.details.status }} {{ apiTestResult.details.statusText }}
                    </div>
                    <div v-if="apiTestResult.details.responseData">
                      响应数据: {{ JSON.stringify(apiTestResult.details.responseData, null, 2) }}
                    </div>
                  </div>
                </div>

                <!-- 完整响应数据 -->
                <details class="mt-2">
                  <summary class="cursor-pointer text-sm font-medium" :class="[
                    apiTestResult.success 
                      ? 'text-green-700 dark:text-green-300'
                      : 'text-red-700 dark:text-red-300'
                  ]">
                    查看完整响应 ▼
                  </summary>
                  <pre class="mt-2 text-xs overflow-x-auto p-2 bg-black/5 dark:bg-white/5 rounded" :class="[
                    apiTestResult.success 
                      ? 'text-green-700 dark:text-green-300'
                      : 'text-red-700 dark:text-red-300'
                  ]">{{ JSON.stringify(apiTestResult, null, 2) }}</pre>
                </details>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import ToolCard from '@/components/ToolCard.vue'
import CategoryFilter from '@/components/CategoryFilter.vue'
import aiConfig, { type DifyAppConfig } from '../config/ai'
import { difyApiService, type DifyApiResponse } from '@/services/difyApi'

// 响应式数据
const selectedCategory = ref('全部')
const favoriteToolIds = ref<string[]>([]) // 收藏的工具ID列表
const showToolDialog = ref(false)
const selectedTool = ref<DifyAppConfig | null>(null)
const selectedToolKey = ref('') // 当前选中工具的API Key标识
const isTestingApi = ref(false)
const apiTestResult = ref<DifyApiResponse | null>(null)
const apiConfigInfo = ref<{
  baseUrl: string;
  hasApiKey: boolean;
  keyPrefix?: string;
}>({
  baseUrl: '',
  hasApiKey: false,
  keyPrefix: undefined
})

// 所有可用工具
const allTools = computed((): DifyAppConfig[] => {
  if (!aiConfig.enable) return []
  return Object.values(aiConfig.apps)
})

// 收藏的工具
const favoriteTools = computed((): DifyAppConfig[] => {
  return allTools.value.filter(tool => favoriteToolIds.value.includes(tool.id))
})

// 根据分类筛选的工具
const filteredTools = computed((): DifyAppConfig[] => {
  if (selectedCategory.value === '全部') {
    return allTools.value
  }
  return allTools.value.filter(tool => tool.category === selectedCategory.value)
})

// 处理工具使用
const handleUseTool = (tool: DifyAppConfig) => {
  console.log('使用工具:', tool.name, '- 跳转到对话界面')
  // 由ToolCard组件直接处理路由跳转，这里只做日志记录
}

// 处理工具测试
const handleTestTool = (tool: DifyAppConfig) => {
  selectedTool.value = tool
  selectedToolKey.value = tool.apikey.replace('VITE_DIFY_API_KEY_', '')
  showToolDialog.value = true
  apiTestResult.value = null
  
  // 更新API配置信息
  apiConfigInfo.value = difyApiService.getApiConfigInfo(selectedToolKey.value)
  
  console.log('测试工具:', tool.name, '- 打开API测试弹窗')
}

// 处理收藏切换
const handleToggleFavorite = (toolId: string, favorited: boolean) => {
  if (favorited) {
    if (!favoriteToolIds.value.includes(toolId)) {
      favoriteToolIds.value.push(toolId)
    }
  } else {
    const index = favoriteToolIds.value.indexOf(toolId)
    if (index > -1) {
      favoriteToolIds.value.splice(index, 1)
    }
  }
  
  // 保存到localStorage (后续可改为API调用)
  localStorage.setItem('ai-toolbox-favorites', JSON.stringify(favoriteToolIds.value))
}

// 关闭工具对话框
const closeToolDialog = () => {
  showToolDialog.value = false
  selectedTool.value = null
  selectedToolKey.value = ''
  apiTestResult.value = null
  apiConfigInfo.value = {
    baseUrl: '',
    hasApiKey: false,
    keyPrefix: undefined
  }
}

// 测试API调用
const testApiCall = async () => {
  if (!selectedTool.value || !selectedToolKey.value) return
  
  isTestingApi.value = true
  
  try {
    const testInputs = {
      query: '这是一个API连接测试',
      test: true
    }
    
    console.log('🧪 开始测试API调用:', {
      toolId: selectedToolKey.value,
      toolName: selectedTool.value.name,
      appType: selectedTool.value.type,
      inputs: testInputs
    })
    
    // 根据应用类型调用对应的API
    const result = await difyApiService.callApp(
      selectedToolKey.value, 
      selectedTool.value.type, 
      testInputs,
      '这是一个API连接测试' // chat类型需要的query参数
    )
    
    apiTestResult.value = result
    
    console.log('🧪 API测试结果:', result)
  } catch (error) {
    console.error('🧪 API测试异常:', error)
    apiTestResult.value = {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
      details: { originalError: error }
    }
  } finally {
    isTestingApi.value = false
  }
}

// 加载收藏数据
const loadFavorites = () => {
  const saved = localStorage.getItem('ai-toolbox-favorites')
  if (saved) {
    try {
      favoriteToolIds.value = JSON.parse(saved)
    } catch (error) {
      console.error('加载收藏数据失败:', error)
      favoriteToolIds.value = []
    }
  }
}

onMounted(() => {
  loadFavorites()
})
</script> 