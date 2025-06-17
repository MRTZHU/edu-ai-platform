<template>
  <div class="history-panel" :class="{ 'collapsed': !isExpanded }">
    <!-- 面板头部 -->
    <div class="panel-header">
      <div class="header-content">
        <h3 class="panel-title">
          <i-heroicons-outline:clock class="h-5 w-5" />
          历史记录
        </h3>
        <div class="header-actions">
          <span v-if="totalCount > 0" class="count-badge">
            {{ totalCount }}
          </span>
          <button
            @click="toggleExpanded"
            class="toggle-btn"
            :title="isExpanded ? '收起面板' : '展开面板'"
          >
            <i-heroicons-outline:chevron-left v-if="isExpanded" class="h-5 w-5" />
            <i-heroicons-outline:chevron-right v-else class="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>

    <!-- 面板内容 -->
    <div v-if="isExpanded" class="panel-content">
      <!-- 搜索和筛选 -->
      <div class="search-filters">
        <!-- 搜索框 -->
        <div class="search-box">
          <div class="search-input-container">
            <i-heroicons-outline:search class="search-icon" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索作品..."
              class="search-input"
            />
            <button
              v-if="searchQuery"
              @click="clearSearch"
              class="clear-search"
            >
              <i-heroicons-outline:x-circle class="h-4 w-4" />
            </button>
          </div>
        </div>

        <!-- 筛选选项 -->
        <div class="filter-options">
          <!-- 工具筛选 -->
          <select v-model="selectedTool" class="filter-select">
            <option value="">所有工具</option>
            <option
              v-for="tool in availableTools"
              :key="tool.id"
              :value="tool.id"
            >
              {{ tool.name }}
            </option>
          </select>

          <!-- 类型筛选 -->
          <select v-model="selectedCategory" class="filter-select">
            <option value="">所有类型</option>
            <option value="image">图像</option>
            <option value="music">音乐</option>
            <option value="video">视频</option>
            <option value="design">设计</option>
          </select>

          <!-- 收藏筛选 -->
          <button
            @click="toggleFavoriteFilter"
            class="favorite-filter"
            :class="{ active: showFavoritesOnly }"
          >
            <i-heroicons-solid:heart v-if="showFavoritesOnly" class="h-4 w-4" />
            <i-heroicons-outline:heart v-else class="h-4 w-4" />
            收藏
          </button>
        </div>
      </div>

      <!-- 批量操作 -->
      <div v-if="selectedItems.length > 0" class="batch-actions">
        <div class="batch-info">
          已选择 {{ selectedItems.length }} 项
        </div>
        <div class="batch-buttons">
          <button
            @click="batchToggleFavorite"
            class="batch-btn"
          >
            <i-heroicons-outline:heart class="h-4 w-4" />
            收藏
          </button>
          <button
            @click="batchDownload"
            class="batch-btn"
          >
            <i-heroicons-outline:arrow-down class="h-4 w-4" />
            下载
          </button>
          <button
            @click="batchDelete"
            class="batch-btn text-red-600 hover:text-red-700"
          >
            <i-heroicons-outline:trash class="h-4 w-4" />
            删除
          </button>
        </div>
      </div>

      <!-- 历史记录列表 -->
      <div class="history-list">
        <!-- 加载状态 -->
        <div v-if="isLoading" class="loading-state">
          <i-lucide-loader-2 class="h-6 w-6 animate-spin text-blue-500" />
          <p class="text-sm text-slate-600 dark:text-slate-400 mt-2">加载中...</p>
        </div>

        <!-- 空状态 -->
        <div v-else-if="filteredArtworks.length === 0" class="empty-state">
          <div v-if="searchQuery || selectedTool || selectedCategory || showFavoritesOnly">
            <i-heroicons-outline:search class="h-12 w-12 text-slate-300 dark:text-slate-600" />
            <p class="text-sm text-slate-600 dark:text-slate-400 mt-2">
              没有找到匹配的作品
            </p>
            <button
              @click="clearAllFilters"
              class="mt-2 text-blue-600 hover:text-blue-700 text-sm"
            >
              清除筛选条件
            </button>
          </div>
          <div v-else>
            <i-heroicons-outline:camera class="h-12 w-12 text-slate-300 dark:text-slate-600" />
            <p class="text-sm text-slate-600 dark:text-slate-400 mt-2">
              还没有创作记录
            </p>
          </div>
        </div>

        <!-- 作品列表 -->
        <div v-else class="artwork-list">
          <!-- 按日期分组 -->
          <div
            v-for="group in groupedArtworks"
            :key="group.date"
            class="date-group"
          >
            <div class="date-header">
              <h4 class="date-title">{{ group.dateLabel }}</h4>
              <span class="date-count">{{ group.artworks.length }} 个作品</span>
            </div>
            
            <div class="artwork-items">
              <div
                v-for="artwork in group.artworks"
                :key="artwork.id"
                class="artwork-item"
                :class="{ 
                  selected: selectedItems.includes(artwork.id),
                  active: currentArtworkId === artwork.id
                }"
                @click="selectArtwork(artwork)"
              >
                <!-- 选择框 -->
                <div class="item-checkbox">
                  <input
                    type="checkbox"
                    :checked="selectedItems.includes(artwork.id)"
                    @click.stop
                    @change="toggleItemSelection(artwork.id)"
                    class="checkbox"
                  />
                </div>

                <!-- 作品缩略图 -->
                <div class="item-thumbnail">
                  <img
                    v-if="getImageUrl(artwork) && isImageFormat(artwork)"
                    :src="getImageUrl(artwork)"
                    :alt="artwork.title || '作品'"
                    :data-artwork-id="artwork.id"
                    class="thumbnail-image"
                    @error="onThumbnailError"
                    @load="onThumbnailLoad"
                  />
                  <div v-else class="thumbnail-placeholder">
                    <component
                      :is="getFormatIcon(artwork)"
                      class="h-6 w-6 text-slate-400"
                    />
                  </div>
                  
                  <!-- 加载状态指示器 -->
                  <div v-if="loadingThumbnails.has(artwork.id)" class="thumbnail-loading">
                    <i-lucide-loader-2 class="h-4 w-4 animate-spin text-blue-500" />
                  </div>
                </div>

                <!-- 作品信息 -->
                <div class="item-info">
                  <h5 class="item-title">
                    {{ artwork.title || '未命名作品' }}
                  </h5>
                  <p class="item-prompt">
                    {{ truncateText(artwork.prompt || '', 50) }}
                  </p>
                  <div class="item-meta">
                    <span class="meta-item">
                      <i-heroicons-outline:clock class="h-3 w-3" />
                      {{ formatRelativeTime(artwork.created_at) }}
                    </span>
                    <span v-if="artwork.tool_name" class="meta-item">
                      <i-heroicons-outline:cog class="h-3 w-3" />
                      {{ artwork.tool_name }}
                    </span>
                  </div>
                </div>

                <!-- 作品操作 -->
                <div class="item-actions">
                  <button
                    @click.stop="toggleFavorite(artwork)"
                    class="action-btn"
                    :class="{ favorited: artwork.is_favorite }"
                  >
                    <i-heroicons-solid:heart v-if="artwork.is_favorite" class="h-4 w-4" />
                    <i-heroicons-outline:heart v-else class="h-4 w-4" />
                  </button>
                  
                  <button
                    @click.stop="downloadArtwork(artwork)"
                    class="action-btn"
                  >
                    <i-heroicons-outline:arrow-down class="h-4 w-4" />
                  </button>
                  
                  <button
                    @click.stop="deleteArtwork(artwork)"
                    class="action-btn text-red-600 hover:text-red-700"
                  >
                    <i-heroicons-outline:trash class="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 加载更多 -->
        <div v-if="hasMore && !isLoading" class="load-more">
          <button
            @click="loadMore"
            class="load-more-btn"
          >
            加载更多
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import type { Artwork } from '@/services/database'
import { paintingToolsConfig } from '@/config/ai/painting'

/**
 * 组件属性
 */
interface Props {
  artworks: Artwork[]
  currentArtworkId?: string
  isLoading?: boolean
  hasMore?: boolean
  defaultExpanded?: boolean
}

/**
 * 组件事件
 */
interface Emits {
  (e: 'artwork-selected', artwork: Artwork): void
  (e: 'favorite-toggled', artwork: Artwork): void
  (e: 'artwork-downloaded', artwork: Artwork): void
  (e: 'artwork-deleted', artwork: Artwork): void
  (e: 'batch-favorite-toggled', artworkIds: string[]): void
  (e: 'batch-downloaded', artworkIds: string[]): void
  (e: 'batch-deleted', artworkIds: string[]): void
  (e: 'load-more'): void
  (e: 'expanded-changed', expanded: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  artworks: () => [],
  isLoading: false,
  hasMore: false,
  defaultExpanded: true
})

const emit = defineEmits<Emits>()

// 组件状态
const isExpanded = ref(props.defaultExpanded)
const searchQuery = ref('')
const selectedTool = ref('')
const selectedCategory = ref('')
const showFavoritesOnly = ref(false)
const selectedItems = ref<string[]>([])

// 缩略图加载状态管理
const loadingThumbnails = ref(new Set<string>())
const failedThumbnails = ref(new Set<string>())

// 计算属性
const totalCount = computed(() => props.artworks.length)

const availableTools = computed(() => {
  const toolIds = [...new Set(props.artworks.map(artwork => artwork.tool_id))]
  return toolIds.map(id => ({
    id,
    name: paintingToolsConfig[id]?.name || id
  }))
})

const filteredArtworks = computed(() => {
  let filtered = props.artworks

  // 搜索筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(artwork =>
      (artwork.title?.toLowerCase().includes(query)) ||
      (artwork.prompt?.toLowerCase().includes(query))
    )
  }

  // 工具筛选
  if (selectedTool.value) {
    filtered = filtered.filter(artwork => artwork.tool_id === selectedTool.value)
  }

  // 类型筛选
  if (selectedCategory.value) {
    filtered = filtered.filter(artwork => {
      const tool = paintingToolsConfig[artwork.tool_id]
      return tool?.category === selectedCategory.value
    })
  }

  // 收藏筛选
  if (showFavoritesOnly.value) {
    filtered = filtered.filter(artwork => artwork.is_favorite)
  }

  return filtered
})

const groupedArtworks = computed(() => {
  const groups: Record<string, Artwork[]> = {}
  
  filteredArtworks.value.forEach(artwork => {
    const date = new Date(artwork.created_at)
    const dateKey = date.toDateString()
    
    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    groups[dateKey].push(artwork)
  })

  return Object.entries(groups)
    .map(([date, artworks]) => ({
      date,
      dateLabel: formatDateLabel(new Date(date)),
      artworks: artworks.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

// 方法
const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
  emit('expanded-changed', isExpanded.value)
}

const clearSearch = () => {
  searchQuery.value = ''
}

const toggleFavoriteFilter = () => {
  showFavoritesOnly.value = !showFavoritesOnly.value
}

const clearAllFilters = () => {
  searchQuery.value = ''
  selectedTool.value = ''
  selectedCategory.value = ''
  showFavoritesOnly.value = false
}

const selectArtwork = (artwork: Artwork) => {
  emit('artwork-selected', artwork)
}

const toggleItemSelection = (artworkId: string) => {
  const index = selectedItems.value.indexOf(artworkId)
  if (index > -1) {
    selectedItems.value.splice(index, 1)
  } else {
    selectedItems.value.push(artworkId)
  }
}

const toggleFavorite = (artwork: Artwork) => {
  emit('favorite-toggled', artwork)
}

const downloadArtwork = (artwork: Artwork) => {
  emit('artwork-downloaded', artwork)
}

const deleteArtwork = (artwork: Artwork) => {
  if (confirm('确定要删除这个作品吗？此操作无法撤销。')) {
    emit('artwork-deleted', artwork)
  }
}

const batchToggleFavorite = () => {
  emit('batch-favorite-toggled', [...selectedItems.value])
  selectedItems.value = []
}

const batchDownload = () => {
  emit('batch-downloaded', [...selectedItems.value])
  selectedItems.value = []
}

const batchDelete = () => {
  if (confirm(`确定要删除选中的 ${selectedItems.value.length} 个作品吗？此操作无法撤销。`)) {
    emit('batch-deleted', [...selectedItems.value])
    selectedItems.value = []
  }
}

const loadMore = () => {
  emit('load-more')
}

const isImageFormat = (artwork: Artwork) => {
  const url = artwork.output_image_url
  if (!url) return false
  
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp']
  return imageExtensions.some(ext => url.toLowerCase().includes(ext)) ||
         url.includes('image') ||
         artwork.output_metadata?.format?.startsWith('image/')
}

const getFormatIcon = (artwork: Artwork) => {
  const tool = paintingToolsConfig[artwork.tool_id]
  if (tool?.category === 'music') return 'i-heroicons-outline:music-note'
  if (tool?.category === 'video') return 'i-heroicons-outline:film'
  if (tool?.category === 'design') return 'i-heroicons-outline:swatch'
  return 'i-heroicons-outline:document'
}

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

const formatDateLabel = (date: Date) => {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  if (date.toDateString() === today.toDateString()) {
    return '今天'
  } else if (date.toDateString() === yesterday.toDateString()) {
    return '昨天'
  } else {
    return date.toLocaleDateString('zh-CN', {
      month: 'long',
      day: 'numeric'
    })
  }
}

const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffMins < 1) return '刚刚'
  if (diffMins < 60) return `${diffMins}分钟前`
  if (diffHours < 24) return `${diffHours}小时前`
  if (diffDays < 7) return `${diffDays}天前`
  
  return date.toLocaleDateString('zh-CN')
}

const onThumbnailError = (event: Event) => {
  const img = event.target as HTMLImageElement
  const artworkId = img.dataset.artworkId
  
  if (artworkId) {
    failedThumbnails.value.add(artworkId)
    loadingThumbnails.value.delete(artworkId)
  }
  
  img.style.display = 'none'
}

const onThumbnailLoad = (event: Event) => {
  const img = event.target as HTMLImageElement
  const artworkId = img.dataset.artworkId
  
  if (artworkId) {
    loadingThumbnails.value.delete(artworkId)
  }
}

/**
 * 获取图片URL，优先使用缩略图
 * @param artwork 作品对象
 * @returns 图片URL或undefined
 */
const getImageUrl = (artwork: Artwork): string | undefined => {
  // 如果缩略图加载失败，使用原图
  if (failedThumbnails.value.has(artwork.id)) {
    return artwork.output_image_url
  }
  
  // 优先使用缩略图，回退到原图
  return artwork.thumbnail_url || artwork.output_image_url
}

// 监听器
watch(() => props.artworks, () => {
  // 清除已删除作品的选择状态
  const existingIds = new Set(props.artworks.map(artwork => artwork.id))
  selectedItems.value = selectedItems.value.filter(id => existingIds.has(id))
})

// 导出方法供父组件调用
defineExpose({
  toggleExpanded,
  clearAllFilters,
  selectedItems
})
</script>

<style scoped>
.history-panel {
  @apply fixed top-0 right-0 h-full w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700
         shadow-xl transition-all duration-300 ease-in-out z-30;
}

.history-panel.collapsed {
  @apply w-12;
}

/* 面板头部 */
.panel-header {
  @apply p-4 border-b border-slate-200 dark:border-slate-700;
}

.header-content {
  @apply flex items-center justify-between;
}

.panel-title {
  @apply flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-white;
}

.header-actions {
  @apply flex items-center gap-2;
}

.count-badge {
  @apply px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full
         dark:bg-blue-900/20 dark:text-blue-300;
}

.toggle-btn {
  @apply p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 
         text-slate-600 dark:text-slate-400 transition-colors;
}

/* 面板内容 */
.panel-content {
  @apply flex flex-col h-[calc(100%-5rem)] overflow-hidden;
}

/* 搜索和筛选 */
.search-filters {
  @apply p-4 space-y-3 border-b border-slate-200 dark:border-slate-700;
}

.search-box {
  @apply relative;
}

.search-input-container {
  @apply relative flex items-center;
}

.search-icon {
  @apply absolute left-3 h-4 w-4 text-slate-400;
}

.search-input {
  @apply w-full pl-10 pr-8 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg
         focus:ring-2 focus:ring-blue-500 focus:border-blue-500
         bg-white dark:bg-slate-800 text-slate-900 dark:text-white;
}

.clear-search {
  @apply absolute right-2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700
         text-slate-400 hover:text-slate-600 dark:hover:text-slate-300;
}

.filter-options {
  @apply flex gap-2;
}

.filter-select {
  @apply flex-1 px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg
         focus:ring-2 focus:ring-blue-500 focus:border-blue-500
         bg-white dark:bg-slate-800 text-slate-900 dark:text-white;
}

.favorite-filter {
  @apply px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg
         hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors
         flex items-center gap-1;
}

.favorite-filter.active {
  @apply bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300;
}

/* 批量操作 */
.batch-actions {
  @apply flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800;
}

.batch-info {
  @apply text-sm font-medium text-blue-700 dark:text-blue-300;
}

.batch-buttons {
  @apply flex gap-2;
}

.batch-btn {
  @apply px-2 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600
         rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors
         flex items-center gap-1;
}

/* 历史记录列表 */
.history-list {
  @apply flex-1 overflow-y-auto;
}

.loading-state,
.empty-state {
  @apply flex flex-col items-center justify-center p-8 text-center;
}

.artwork-list {
  @apply p-4 space-y-6;
}

/* 日期分组 */
.date-group {
  @apply space-y-3;
}

.date-header {
  @apply flex items-center justify-between;
}

.date-title {
  @apply text-sm font-medium text-slate-700 dark:text-slate-300;
}

.date-count {
  @apply text-xs text-slate-500 dark:text-slate-500;
}

.artwork-items {
  @apply space-y-2;
}

/* 作品项 */
.artwork-item {
  @apply flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700
         hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-all duration-200;
}

.artwork-item.selected {
  @apply bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800;
}

.artwork-item.active {
  @apply ring-2 ring-blue-500 ring-opacity-50;
}

.item-checkbox {
  @apply flex-shrink-0;
}

.checkbox {
  @apply rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500;
}

.item-thumbnail {
  @apply flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 relative;
}

.thumbnail-image {
  @apply w-full h-full object-cover transition-opacity duration-200;
}

.thumbnail-loading {
  @apply absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800 bg-opacity-80;
}

.thumbnail-placeholder {
  @apply w-full h-full flex items-center justify-center;
}

.item-info {
  @apply flex-1 min-w-0;
}

.item-title {
  @apply text-sm font-medium text-slate-800 dark:text-white truncate;
}

.item-prompt {
  @apply text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2;
}

.item-meta {
  @apply flex items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-500;
}

.meta-item {
  @apply flex items-center gap-1;
}

.item-actions {
  @apply flex-shrink-0 flex gap-1;
}

.action-btn {
  @apply p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700
         text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200
         transition-colors;
}

.action-btn.favorited {
  @apply text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300;
}

/* 加载更多 */
.load-more {
  @apply p-4 text-center;
}

.load-more-btn {
  @apply px-4 py-2 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200
         dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors;
}

/* 自定义滚动条 */
.history-list::-webkit-scrollbar {
  @apply w-2;
}

.history-list::-webkit-scrollbar-track {
  @apply bg-slate-100 dark:bg-slate-800;
}

.history-list::-webkit-scrollbar-thumb {
  @apply bg-slate-300 dark:bg-slate-600 rounded-full hover:bg-slate-400 dark:hover:bg-slate-500;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .history-panel {
    @apply w-72;
  }
  
  .history-panel.collapsed {
    @apply w-0 opacity-0 pointer-events-none;
  }
}

@media (max-width: 768px) {
  .history-panel {
    @apply w-full;
  }
}
</style> 