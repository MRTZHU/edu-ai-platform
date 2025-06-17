<template>
  <div class="ai-painting-view min-h-screen bg-slate-50 dark:bg-slate-900">
    <!-- 工具选择模式 -->
    <div v-if="!selectedTool" class="tool-selection-mode p-6">
      <div class="max-w-7xl mx-auto">
        <!-- 页面标题 -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            🎨 AI美育工具箱
          </h1>
          <p class="text-slate-600 dark:text-slate-400">
            探索强大的AI美育工具，释放您的创意潜能
          </p>
        </div>

        <!-- 收藏工具区域 -->
        <div v-if="favoriteTools.length > 0" class="mb-8">
          <h2 class="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <i-heroicons-outline:star class="h-5 w-5 text-yellow-500 fill-current" />
            我的收藏
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <PaintingToolCard
              v-for="tool in favoriteTools"
              :key="tool.id"
              :tool="tool"
              :is-favorited="favoriteToolIds.includes(tool.id)"
              @use="handleUseTool"
              @favorite="handleToggleFavorite"
            />
          </div>
        </div>

        <!-- 推荐工具区域 -->
        <div class="mb-8">
          <h2 class="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <i-heroicons-outline:star class="h-5 w-5 text-blue-500" />
            推荐工具
          </h2>
          
          <!-- 分类筛选 -->
          <div class="mb-6">
            <div class="flex flex-wrap gap-2">
              <button
                v-for="category in categories"
                :key="category.value"
                @click="selectedCategory = category.value"
                class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                :class="selectedCategory === category.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600'"
              >
                {{ category.label }}
              </button>
            </div>
          </div>

          <!-- 工具网格 -->
          <div v-if="filteredTools.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <PaintingToolCard
              v-for="tool in filteredTools"
              :key="tool.id"
              :tool="tool"
              :is-favorited="favoriteToolIds.includes(tool.id)"
              @use="handleUseTool"
              @favorite="handleToggleFavorite"
            />
          </div>

          <!-- 空状态 -->
          <div v-else class="text-center py-12">
            <i-heroicons-outline:search class="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 class="text-lg font-medium text-slate-900 dark:text-white mb-2">
              暂无工具
            </h3>
            <p class="text-slate-500 dark:text-slate-400">
              该分类下暂时没有可用的工具
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 工具使用模式 -->
    <div v-else class="tool-usage-mode">
      <!-- 顶部导航栏 -->
      <div class="top-nav bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <!-- 返回按钮 -->
            <button
              @click="goBackToToolSelection"
              class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <i-heroicons-outline:arrow-left class="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </button>
            
            <!-- 当前工具信息 -->
            <div class="flex items-center gap-3">
              <div 
                class="p-2 rounded-lg"
                :style="{ backgroundColor: selectedTool.iconBgColor }"
              >
                <component :is="selectedTool.icon" class="h-6 w-6" />
              </div>
              <div>
                <h2 class="font-semibold text-slate-900 dark:text-white">{{ selectedTool.name }}</h2>
                <p class="text-sm text-slate-600 dark:text-slate-400">{{ selectedTool.description }}</p>
              </div>
            </div>
          </div>

          <!-- 历史记录按钮 -->
          <button
            @click="toggleHistory"
            class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            :class="{ 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400': isHistoryExpanded }"
          >
            <i-heroicons-outline:clock class="h-5 w-5" />
          </button>
        </div>
      </div>

      <!-- 主内容区域 -->
      <div class="main-content" :class="{ 'with-history': isHistoryExpanded }">
        <!-- 作品展示区域 -->
        <div class="artwork-display-area">
          <ArtworkGallery
            :artworks="currentArtworks"
            :current-artwork-id="currentArtworkId"
            :is-generating="isGenerating"
            :generating-message="generatingMessage"
            :generating-progress="generatingProgress"
            :can-cancel="canCancelGeneration"
            :show-latest-only="showLatestOnly"
            @artwork-changed="onArtworkChanged"
            @favorite-toggled="onFavoriteToggled"
            @artwork-downloaded="onArtworkDownloaded"
            @artwork-shared="onArtworkShared"
            @artwork-deleted="onArtworkDeleted"
            @cancel-generation="onCancelGeneration"
            @suggestion-clicked="onSuggestionClicked"
          />
        </div>

        <!-- 智能悬浮输入框 -->
        <div class="floating-input-area">
          <SmartFloatingInput
            :available-tools="[selectedTool]"
            :current-tool-id="selectedTool.id"
            :is-generating="isGenerating"
            @tool-changed="onToolChanged"
            @form-submitted="onFormSubmitted"
            @generation-cancelled="onCancelGeneration"
          />
        </div>
      </div>

      <!-- 历史记录面板 -->
      <div 
        v-if="isHistoryExpanded"
        class="history-panel"
      >
        <HistoryPanel
          :artworks="historyArtworks"
          :current-artwork-id="currentArtworkId"
          :is-loading="isLoadingHistory"
          :has-more="hasMoreHistory"
          :default-expanded="isHistoryExpanded"
          @artwork-selected="onHistoryArtworkSelected"
          @favorite-toggled="onFavoriteToggled"
          @artwork-downloaded="onArtworkDownloaded"
          @artwork-deleted="onArtworkDeleted"
          @load-more="loadMoreHistory"
          @expanded-changed="onHistoryExpandedChanged"
        />
      </div>
    </div>

    <!-- 通知系统 -->
    <div class="notification-container">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="notification"
        :class="[
          `notification-${notification.type}`,
          { 'notification-entering': notification.entering }
        ]"
      >
        <div class="notification-icon">
          <i-heroicons-outline:check-circle v-if="notification.type === 'success'" class="h-5 w-5" />
          <i-heroicons-outline:exclamation-circle v-else-if="notification.type === 'error'" class="h-5 w-5" />
          <i-heroicons-outline:information-circle v-else class="h-5 w-5" />
        </div>
        <div class="notification-content">
          <p class="notification-title">{{ notification.title }}</p>
          <p v-if="notification.message" class="notification-message">{{ notification.message }}</p>
        </div>
        <button
          @click="dismissNotification(notification.id)"
          class="notification-close"
        >
          <i-heroicons-outline:x-circle class="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import PaintingToolCard from '@/components/painting/PaintingToolCard.vue'
import ArtworkGallery from '@/components/painting/ArtworkGallery.vue'
import SmartFloatingInput from '@/components/painting/SmartFloatingInput.vue'
import HistoryPanel from '@/components/painting/HistoryPanel.vue'
import { DatabaseService, type Artwork } from '@/services/database'
import { paintingToolsConfig, getToolsByCategory, type PaintingToolConfig } from '@/config/ai/painting'
import { DifyApiService } from '@/services/difyApi'
import { FormAdapter } from '@/services/formAdapter'
import { StorageService } from '@/services/storage'

/**
 * 通知接口
 */
interface Notification {
  id: string
  type: 'success' | 'error' | 'info'
  title: string
  message?: string
  entering?: boolean
}

/**
 * 建议接口
 */
interface Suggestion {
  title: string
  description?: string
  prompt?: string
}

const router = useRouter()
const route = useRoute()

// 工具选择相关状态
const selectedTool = ref<PaintingToolConfig | null>(null)
const selectedCategory = ref('全部')
const favoriteToolIds = ref<string[]>([])

// 分类配置
const categories = [
  { value: '全部', label: '全部工具' },
  { value: 'image', label: '图像生成' },
  { value: 'music', label: '音乐创作' },
  { value: 'video', label: '视频制作' },
  { value: 'design', label: '设计工具' }
]

// 计算属性
const allTools = computed(() => Object.values(paintingToolsConfig))

const favoriteTools = computed(() => {
  return allTools.value.filter(tool => favoriteToolIds.value.includes(tool.id))
})

const filteredTools = computed(() => {
  if (selectedCategory.value === '全部') {
    return allTools.value
  }
  return allTools.value.filter(tool => tool.category === selectedCategory.value)
})

// 原有的状态管理
const currentToolId = ref('')
const currentTool = computed(() => {
  if (!currentToolId.value) return null
  return paintingToolsConfig[currentToolId.value] || null
})

const availableTools = computed(() => Object.values(paintingToolsConfig))

// 作品相关状态
const currentArtworks = ref<Artwork[]>([])
const currentArtworkId = ref<string>('')
const historyArtworks = ref<Artwork[]>([])

// 生成状态
const isGenerating = ref(false)
const generatingMessage = ref('')
const generatingProgress = ref(0)
const canCancelGeneration = ref(false)

// UI状态
const isHistoryExpanded = ref(false)
const isLoadingHistory = ref(false)
const hasMoreHistory = ref(true)
const showLatestOnly = ref(true)

// 通知系统
const notifications = ref<Notification[]>([])

// 预加载任务管理
const activePreloadTasks = ref<Map<string, () => void>>(new Map())

// 服务实例
const databaseService = new DatabaseService()
const difyApiService = new DifyApiService()
const formAdapter = new FormAdapter()
const storageService = new StorageService()

/**
 * 工具选择处理
 */
const handleUseTool = (tool: PaintingToolConfig) => {
  selectedTool.value = tool
  currentToolId.value = tool.id
  console.log('🎨 选择工具:', tool.name)
  
  // 更新URL参数但不刷新页面
  router.replace({ 
    name: 'aiPainting', 
    query: { tool: tool.id } 
  })
  
  // 初始状态：清空当前作品，显示引导界面
  currentArtworks.value = []
  currentArtworkId.value = ''
  showLatestOnly.value = true
  
  // 注释掉：不在初始状态加载历史作品
  // loadToolArtworks(tool.id)
}

const goBackToToolSelection = () => {
  selectedTool.value = null
  currentToolId.value = ''
  
  // 清除URL参数
  router.replace({ name: 'aiPainting' })
}

/**
 * 收藏处理
 */
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
  
  // 保存到localStorage
  localStorage.setItem('ai-painting-favorites', JSON.stringify(favoriteToolIds.value))
}

/**
 * 历史记录处理
 */
const toggleHistory = async () => {
  isHistoryExpanded.value = !isHistoryExpanded.value
  
  // 第一次打开历史记录时加载数据
  if (isHistoryExpanded.value && historyArtworks.value.length === 0) {
    await loadMoreHistory()
  }
}

const onHistoryExpandedChanged = (expanded: boolean) => {
  isHistoryExpanded.value = expanded
}

/**
 * 工具切换处理
 */
const onToolChanged = (toolConfig: PaintingToolConfig | null) => {
  if (toolConfig && toolConfig.id !== currentToolId.value) {
    currentToolId.value = toolConfig.id
    console.log('🎨 切换到工具:', toolConfig.name)
  }
}

const onFormSubmitted = async (data: { inputs: Record<string, any>, files?: File[] }) => {
  if (!selectedTool.value) {
    showNotification('error', '请选择工具', '请先选择一个AI工具')
    return
  }
  
  try {
    await startGeneration(selectedTool.value.id, data.inputs, data.files)
  } catch (error) {
    console.error('生成失败:', error)
    showNotification('error', '生成失败', error instanceof Error ? error.message : '未知错误')
  }
}

/**
 * 作品相关处理
 */
const onArtworkChanged = (artwork: Artwork | null) => {
  currentArtworkId.value = artwork?.id || ''
}

const onFavoriteToggled = async (artwork: Artwork) => {
  try {
    const updatedArtwork = await databaseService.updateArtwork(artwork.id, {
      is_favorite: !artwork.is_favorite
    })
    
    // 更新本地状态
    updateArtworkInLists(updatedArtwork)
    
    showNotification('success', 
      updatedArtwork.is_favorite ? '已添加到收藏' : '已取消收藏'
    )
  } catch (error) {
    console.error('收藏操作失败:', error)
    showNotification('error', '操作失败', '收藏状态更新失败')
  }
}

const onArtworkDownloaded = (artwork: Artwork) => {
  showNotification('success', '下载成功', `作品 "${artwork.title}" 已保存到本地`)
}

const onArtworkShared = (artwork: Artwork) => {
  showNotification('success', '分享成功', `作品 "${artwork.title}" 分享链接已复制`)
}

const onArtworkDeleted = async (artwork: Artwork) => {
  try {
    await databaseService.deleteArtwork(artwork.id)
    
    // 从本地列表中移除
    removeArtworkFromLists(artwork.id)
    
    showNotification('success', '删除成功', `作品 "${artwork.title}" 已删除`)
  } catch (error) {
    console.error('删除失败:', error)
    showNotification('error', '删除失败', '作品删除失败')
  }
}

const onHistoryArtworkSelected = (artwork: Artwork) => {
  currentArtworkId.value = artwork.id
  
  // 切换到历史模式：允许轮播显示
  showLatestOnly.value = false
  
  // 如果不在当前作品列表中，加载该工具的所有历史作品
  if (!currentArtworks.value.find(a => a.id === artwork.id)) {
    loadToolArtworks(selectedTool.value?.id || '')
  }
}

const onCancelGeneration = () => {
  isGenerating.value = false
  canCancelGeneration.value = false
  showNotification('info', '生成已取消')
}

const onSuggestionClicked = (suggestion: Suggestion) => {
  // 这里可以处理建议点击，比如自动填充到输入框
  console.log('建议被点击:', suggestion.title)
}

/**
 * 生成相关方法
 */
const startGeneration = async (toolId: string, inputs: Record<string, any>, files?: File[]) => {
  const tool = paintingToolsConfig[toolId]
  if (!tool) {
    throw new Error('工具配置不存在')
  }

  isGenerating.value = true
  generatingMessage.value = `正在使用 ${tool.name} 生成作品...`
  generatingProgress.value = 0
  canCancelGeneration.value = true

  try {
    // 模拟生成进度
    const progressInterval = setInterval(() => {
      if (generatingProgress.value < 70) {
        generatingProgress.value += Math.random() * 10
      }
    }, 500)

    // 调用Dify API - 直接使用原始toolId
    const result = await difyApiService.runWorkflow({
      toolId: toolId, // 直接使用原始toolId，不进行转换
      inputs,
      user: 'current-user'
    })
    
    clearInterval(progressInterval)
    generatingProgress.value = 80

    // 检查API调用是否成功
    if (!result.success) {
      throw new Error(result.error || 'API调用失败')
    }

    // 从API响应中提取图片URL
    let temporaryImageUrl = ''
    let thumbnailUrl = ''
    
    // 检查不同可能的响应结构
    if (result.data?.data?.outputs?.files && result.data.data.outputs.files.length > 0) {
      // Dify工作流响应格式：result.data.data.outputs.files[0].url
      const file = result.data.data.outputs.files[0]
      if (file.url) {
        // 如果是相对路径，拼接完整URL
        if (file.url.startsWith('/')) {
          // 从环境变量获取Dify服务器地址，默认使用本地地址
          const difyBaseUrl = import.meta.env.VITE_DIFY_BASE_URL || 'http://127.0.0.1'
          temporaryImageUrl = `${difyBaseUrl}${file.url}`
        } else {
          temporaryImageUrl = file.url
        }
      }
    } else if (result.data?.output_image_url) {
      // 备用：直接的output_image_url字段
      temporaryImageUrl = result.data.output_image_url
    } else if (result.data?.image_url) {
      // 备用：image_url字段
      temporaryImageUrl = result.data.image_url
    }

    console.log('🖼️ 提取的临时图片URL:', temporaryImageUrl)

    if (!temporaryImageUrl) {
      console.warn('⚠️ 未能从API响应中提取到图片URL，响应数据:', result.data)
      throw new Error('未能获取生成的图片')
    }

    generatingProgress.value = 100

    // 🎯 方案一实现：立即创建作品记录并显示临时图片
    console.log('⚡ 立即显示临时图片，开始后台上传...')
    
    // 创建作品记录（使用临时URL）
    const artwork: Omit<Artwork, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
      title: inputs.title || `${tool.name}作品`,
      content_type: 'image' as const,
      content_url: temporaryImageUrl, // 先使用临时URL
      thumbnail_url: thumbnailUrl || temporaryImageUrl,
      prompt: inputs.text || inputs.prompt || inputs.description || JSON.stringify(inputs),
      input_image_url: inputs.input_image_url,
      output_image_url: temporaryImageUrl, // 先使用临时URL
      output_metadata: {
        tool_config: tool,
        api_result: result,
        generation_time: Date.now(),
        temporary_url: temporaryImageUrl, // 保存原始临时URL
        upload_status: 'uploading', // 标记正在上传
        ...result.data
      },
      tool_id: toolId,
      tool_name: tool.name,
      is_favorite: false,
      is_public: false
    }

    const savedArtwork = await databaseService.createArtwork(artwork)
    
    // 切换回最新作品模式：只显示新生成的作品
    showLatestOnly.value = true
    currentArtworks.value = [savedArtwork]  // 只包含新作品
    currentArtworkId.value = savedArtwork.id

    showNotification('success', '生成成功', `作品 "${savedArtwork.title}" 已生成，正在保存到云端...`)

    // 🚀 后台异步上传到Supabase存储桶
    uploadImageToSupabaseAsync(savedArtwork, temporaryImageUrl)
    
  } catch (error) {
    console.error('生成失败:', error)
    throw error
  } finally {
    isGenerating.value = false
    canCancelGeneration.value = false
    generatingProgress.value = 0
  }
}

/**
 * 后台异步上传图片到Supabase并更新作品记录
 */
const uploadImageToSupabaseAsync = async (artwork: Artwork, temporaryImageUrl: string) => {
  try {
    console.log('🔄 开始后台上传图片到Supabase...')
    
    // 使用新的带缩略图的上传方法
    const { originalUrl: permanentImageUrl, thumbnailUrl } = await storageService.uploadImageWithThumbnail(temporaryImageUrl)
    console.log('✅ 图片已保存到云端:', permanentImageUrl)
    console.log('📸 缩略图已生成:', thumbnailUrl)
    
    // 立即更新数据库记录，但保持临时URL在前端显示
    const uploadingMetadata = {
      ...artwork.output_metadata,
      permanent_url: permanentImageUrl,
      temporary_url: temporaryImageUrl,
      upload_status: 'completed' as const,
      upload_completed_at: Date.now(),
      preload_status: 'loading' as const
    }
    
    await databaseService.updateArtwork(artwork.id, {
      thumbnail_url: thumbnailUrl,
      output_metadata: uploadingMetadata
    })
    
    // 🎯 使用持续预加载机制 - 即使失败也会继续尝试
    console.log('🔄 开始持续预加载永久URL图片...')
    
    // 停止任何现有的预加载任务
    const existingStopFn = activePreloadTasks.value.get(artwork.id)
    if (existingStopFn) {
      existingStopFn()
      activePreloadTasks.value.delete(artwork.id)
    }
    
    // 启动新的持续预加载任务
    const stopPreload = storageService.continuousPreloadImage(
      permanentImageUrl,
      async () => {
        // 🎉 预加载成功回调 - 更新UI显示永久URL
        try {
          console.log('✅ 永久URL图片预加载完成，更新UI显示')
          
          // 更新作品记录中的URL（现在前端显示永久URL）
          const completedMetadata = {
            ...uploadingMetadata,
            preload_status: 'completed' as const,
            preload_completed_at: Date.now()
          }
          
          const updatedArtwork = await databaseService.updateArtwork(artwork.id, {
            content_url: permanentImageUrl,        // 🎯 现在更新主要内容URL
            output_image_url: permanentImageUrl,   // 🎯 现在更新输出图片URL
            output_metadata: completedMetadata
          })
          
          // 更新本地状态显示永久URL
          updateArtworkInLists({
            ...updatedArtwork,
            content_url: permanentImageUrl,
            output_image_url: permanentImageUrl,
            thumbnail_url: thumbnailUrl
          })
          
          console.log('🎉 图片预加载完成，UI已切换到永久链接')
          
          // 清理预加载任务
          activePreloadTasks.value.delete(artwork.id)
          
          // 如果当前正在查看这个作品，刷新历史记录
          if (isHistoryExpanded.value) {
            await refreshHistoryArtworks()
          }
          
        } catch (updateError) {
          console.error('❌ 预加载成功后更新UI失败:', updateError)
        }
      },
      10, // 最大重试10次
      5000 // 每5秒重试一次
    )
    
    // 记录停止函数，以便需要时可以停止
    activePreloadTasks.value.set(artwork.id, stopPreload)
    
    console.log('🔄 持续预加载任务已启动，将在后台持续尝试直到成功')
    
  } catch (uploadError) {
    console.warn('⚠️ 后台上传失败，保持使用临时URL:', uploadError)
    
    // 更新上传状态为失败，但保持作品可用
    try {
      const failedMetadata = {
        ...artwork.output_metadata,
        temporary_url: temporaryImageUrl,
        upload_status: 'failed' as const,
        upload_error: uploadError instanceof Error ? uploadError.message : String(uploadError),
        upload_failed_at: Date.now()
      }
      
      await databaseService.updateArtwork(artwork.id, {
        output_metadata: failedMetadata
      })
      
      // 静默更新本地状态
      updateArtworkInLists({
        ...artwork,
        output_metadata: failedMetadata
      })
      
    } catch (updateError) {
      console.error('更新上传失败状态时出错:', updateError)
    }
  }
}

/**
 * 刷新历史记录中的作品
 */
const refreshHistoryArtworks = async () => {
  try {
    // 重新加载历史记录，确保获得最新的永久URL
    const refreshedArtworks = await databaseService.getArtworks({
      limit: historyArtworks.value.length || 20,
      offset: 0
    })
    
    historyArtworks.value = refreshedArtworks
  } catch (error) {
    console.error('刷新历史记录失败:', error)
  }
}

/**
 * 数据加载方法
 */
const loadToolArtworks = async (toolId: string) => {
  try {
    const artworks = await databaseService.getArtworks({
      toolId: toolId,
      limit: 20,
      offset: 0
    })
    
    currentArtworks.value = artworks
    if (artworks.length > 0) {
      currentArtworkId.value = artworks[0].id
    }
  } catch (error) {
    console.error('加载作品失败:', error)
    showNotification('error', '加载失败', '无法加载作品历史')
  }
}

const loadMoreHistory = async () => {
  if (isLoadingHistory.value || !hasMoreHistory.value) return
  
  isLoadingHistory.value = true
  
  try {
    const moreArtworks = await databaseService.getArtworks({
      limit: 20,
      offset: historyArtworks.value.length
    })
    
    historyArtworks.value.push(...moreArtworks)
    hasMoreHistory.value = moreArtworks.length === 20
    
  } catch (error) {
    console.error('加载更多历史失败:', error)
    showNotification('error', '加载失败', '无法加载更多历史记录')
  } finally {
    isLoadingHistory.value = false
  }
}

/**
 * 工具方法
 */
const updateArtworkInLists = (artwork: Artwork) => {
  // 更新当前作品列表
  const currentIndex = currentArtworks.value.findIndex(a => a.id === artwork.id)
  if (currentIndex !== -1) {
    currentArtworks.value[currentIndex] = artwork
  }
  
  // 更新历史列表
  const historyIndex = historyArtworks.value.findIndex(a => a.id === artwork.id)
  if (historyIndex !== -1) {
    historyArtworks.value[historyIndex] = artwork
  }
}

const removeArtworkFromLists = (artworkId: string) => {
  currentArtworks.value = currentArtworks.value.filter(a => a.id !== artworkId)
  historyArtworks.value = historyArtworks.value.filter(a => a.id !== artworkId)
  
  if (currentArtworkId.value === artworkId) {
    currentArtworkId.value = currentArtworks.value[0]?.id || ''
  }
}

/**
 * 通知系统
 */
const showNotification = (type: Notification['type'], title: string, message?: string) => {
  const notification: Notification = {
    id: Date.now().toString(),
    type,
    title,
    message,
    entering: true
  }
  
  notifications.value.push(notification)
  
  // 3秒后自动消失
  setTimeout(() => {
    dismissNotification(notification.id)
  }, 3000)
  
  // 移除entering状态
  nextTick(() => {
    notification.entering = false
  })
}

const dismissNotification = (id: string) => {
  const index = notifications.value.findIndex(n => n.id === id)
  if (index !== -1) {
    notifications.value.splice(index, 1)
  }
}

/**
 * 初始化
 */
const loadFavorites = () => {
  const saved = localStorage.getItem('ai-painting-favorites')
  if (saved) {
    try {
      favoriteToolIds.value = JSON.parse(saved)
    } catch (error) {
      console.error('加载收藏数据失败:', error)
      favoriteToolIds.value = []
    }
  }
}

const initializeFromRoute = () => {
  const toolId = route.query.tool as string
  if (toolId && paintingToolsConfig[toolId]) {
    handleUseTool(paintingToolsConfig[toolId])
  }
}

onMounted(() => {
  loadFavorites()
  initializeFromRoute()
})

onUnmounted(() => {
  // 清理所有活跃的预加载任务
  activePreloadTasks.value.forEach((stopFn, artworkId) => {
    console.log('🧹 清理预加载任务:', artworkId)
    stopFn()
  })
  activePreloadTasks.value.clear()
})
</script>

<style scoped>
.ai-painting-view {
  @apply h-screen w-full bg-slate-50 dark:bg-slate-900 overflow-hidden relative;
}

/* 主内容区域 */
.main-content {
  @apply h-full transition-all duration-300 ease-in-out;
  margin-right: 0;
}

.main-content.with-history {
  margin-right: 400px;
}

.artwork-display-area {
  @apply h-full relative;
}

.floating-input-area {
  @apply absolute bottom-6 right-6 z-20;
}

/* 历史记录面板区域 */
.history-panel-area {
  @apply relative z-30;
}

/* 全局遮罩 */
.loading-overlay,
.error-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50;
}

.loading-content,
.error-content {
  @apply bg-white dark:bg-slate-800 rounded-lg p-8 text-center max-w-md mx-4;
}

/* 通知系统 */
.notification-container {
  @apply fixed top-4 right-4 z-50 space-y-2;
}

.notification {
  @apply flex items-start gap-3 p-4 bg-white dark:bg-slate-800 rounded-lg shadow-lg border
         transform transition-all duration-300 ease-in-out max-w-sm;
}

.notification-entering {
  @apply translate-x-full opacity-0;
}

.notification-success {
  @apply border-green-200 dark:border-green-800;
}

.notification-error {
  @apply border-red-200 dark:border-red-800;
}

.notification-info {
  @apply border-blue-200 dark:border-blue-800;
}

.notification-icon {
  @apply flex-shrink-0 mt-0.5;
}

.notification-success .notification-icon {
  @apply text-green-500;
}

.notification-error .notification-icon {
  @apply text-red-500;
}

.notification-info .notification-icon {
  @apply text-blue-500;
}

.notification-content {
  @apply flex-1 min-w-0;
}

.notification-title {
  @apply font-medium text-slate-800 dark:text-white text-sm;
}

.notification-message {
  @apply text-slate-600 dark:text-slate-400 text-xs mt-1;
}

.notification-close {
  @apply flex-shrink-0 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700
         text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .main-content.with-history {
    margin-right: 0;
  }
  
  .history-panel {
    width: 100%;
    transform: translateX(100%);
    transition: transform 0.3s ease-out;
  }
  
  .history-panel.expanded {
    transform: translateX(0);
  }
}

@media (max-width: 640px) {
  .notification-container {
    left: 20px;
    right: 20px;
    max-width: none;
  }
  
  .notification {
    margin-bottom: 8px;
  }
}

/* 动画 */
@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.history-panel {
  animation: slideInRight 0.3s ease-out;
}
</style> 
 