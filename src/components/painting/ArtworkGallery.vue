<template>
  <div class="artwork-gallery">
    <!-- 主展示区域 -->
    <div class="main-display-area">
      <!-- 空状态 -->
      <div v-if="!currentArtwork && !isGenerating" class="empty-state">
        <div class="empty-content">
          <div class="empty-icon">
            <i-heroicons-outline:camera class="h-24 w-24 text-slate-300 dark:text-slate-600" />
          </div>
          <h3 class="text-xl font-semibold text-slate-600 dark:text-slate-400 mt-4">
            开始您的AI创作之旅
          </h3>
          <p class="text-slate-500 dark:text-slate-500 mt-2 max-w-md text-center">
            选择右下角的AI工具，输入您的创意描述，让AI为您创作精美的艺术作品
          </p>
          <div class="suggested-actions mt-6 flex flex-wrap gap-3 justify-center">
            <button
              v-for="suggestion in suggestions"
              :key="suggestion.title"
              @click="$emit('suggestion-clicked', suggestion)"
              class="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 
                     dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/30 
                     transition-colors text-sm"
            >
              {{ suggestion.title }}
            </button>
          </div>
        </div>
      </div>

      <!-- 生成中状态 -->
      <div v-else-if="isGenerating" class="generating-state">
        <div class="generating-content">
          <div class="generating-animation">
            <div class="pulse-rings">
              <div class="pulse-ring"></div>
              <div class="pulse-ring"></div>
              <div class="pulse-ring"></div>
            </div>
            <i-heroicons-outline:star class="h-12 w-12 text-blue-500 animate-pulse" />
          </div>
          <h3 class="text-xl font-semibold text-slate-800 dark:text-white mt-6">
            AI正在创作中...
          </h3>
          <p class="text-slate-600 dark:text-slate-400 mt-2">
            {{ generatingMessage || '请稍候，精彩即将呈现' }}
          </p>
          
          <!-- 进度条 -->
          <div v-if="generatingProgress > 0" class="progress-container mt-4">
            <div class="progress-bar">
              <div 
                class="progress-fill"
                :style="{ width: `${generatingProgress}%` }"
              ></div>
            </div>
            <span class="progress-text">{{ generatingProgress }}%</span>
          </div>

          <!-- 取消按钮 -->
          <button
            v-if="canCancel"
            @click="$emit('cancel-generation')"
            class="mt-4 px-4 py-2 text-sm text-slate-600 hover:text-slate-800 
                   dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          >
            取消生成
          </button>
        </div>
      </div>

      <!-- 作品展示 -->
      <div v-else-if="currentArtwork" class="artwork-display">
        <!-- 单作品展示 -->
        <div class="single-artwork">
          <ArtworkViewer
            :artwork="currentArtwork"
            :is-fullscreen="isFullscreen"
            @fullscreen-toggle="toggleFullscreen"
            @download="downloadArtwork"
            @share="shareArtwork"
            @favorite="toggleFavorite"
          />
        </div>

        <!-- 作品信息 -->
        <div class="artwork-info mt-4">
          <div class="artwork-meta">
            <h4 class="artwork-title">
              {{ currentArtwork.title || '未命名作品' }}
            </h4>
            <p v-if="currentArtwork.prompt" class="artwork-prompt">
              {{ currentArtwork.prompt }}
            </p>
            <div class="artwork-details">
              <span class="detail-item">
                <i-heroicons-outline:clock class="h-4 w-4" />
                {{ formatDate(currentArtwork.created_at) }}
              </span>
              <span v-if="currentArtwork.tool_name" class="detail-item">
                <i-heroicons-outline:cog class="h-4 w-4" />
                {{ currentArtwork.tool_name }}
              </span>
              <span v-if="currentArtwork.output_metadata?.dimensions" class="detail-item">
                <i-heroicons-outline:camera class="h-4 w-4" />
                {{ currentArtwork.output_metadata.dimensions }}
              </span>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="artwork-actions">
            <button
              v-if="currentArtwork"
              @click="currentArtwork && toggleFavorite(currentArtwork)"
              class="action-btn"
              :class="{ 'text-red-500': currentArtwork.is_favorite }"
              title="收藏"
            >
              <i-heroicons-outline:heart v-if="!currentArtwork.is_favorite" class="h-5 w-5" />
              <i-heroicons-solid:heart v-else class="h-5 w-5" />
            </button>
            
            <button
              v-if="currentArtwork"
              @click="currentArtwork && downloadArtwork(currentArtwork)"
              class="action-btn"
              title="下载"
            >
              <i-heroicons-outline:arrow-down class="h-5 w-5" />
            </button>
            
            <button
              v-if="currentArtwork"
              @click="currentArtwork && shareArtwork(currentArtwork)"
              class="action-btn"
              title="分享"
            >
              <i-heroicons-outline:share class="h-5 w-5" />
            </button>
            
            <button
              v-if="currentArtwork"
              @click="currentArtwork && deleteArtwork(currentArtwork)"
              class="action-btn text-red-500"
              title="删除"
            >
              <i-heroicons-outline:trash class="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 全屏模态框 -->
    <div v-if="isFullscreen" class="fullscreen-modal" @click="toggleFullscreen">
      <div class="fullscreen-content" @click.stop>
        <button
          @click="toggleFullscreen"
          class="fullscreen-close"
        >
          <i-heroicons-outline:x-circle class="h-6 w-6" />
        </button>
        <ArtworkViewer
          v-if="currentArtwork"
          :artwork="currentArtwork!"
          :is-fullscreen="true"
          @fullscreen-toggle="toggleFullscreen"
          @download="downloadArtwork"
          @share="shareArtwork"
          @favorite="toggleFavorite"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import ArtworkViewer from './ArtworkViewer.vue'
import { type Artwork } from '@/services/database'

/**
 * 建议操作接口
 */
export interface Suggestion {
  title: string
  description: string
  action: string
}

/**
 * 组件属性
 */
interface Props {
  artworks: Artwork[]
  currentArtworkId?: string
  isGenerating?: boolean
  generatingMessage?: string
  generatingProgress?: number
  canCancel?: boolean
  showLatestOnly?: boolean
  suggestions?: Suggestion[]
}

/**
 * 组件事件
 */
interface Emits {
  (e: 'artwork-changed', artwork: Artwork | null): void
  (e: 'favorite-toggled', artwork: Artwork): void
  (e: 'artwork-downloaded', artwork: Artwork): void
  (e: 'artwork-shared', artwork: Artwork): void
  (e: 'artwork-deleted', artwork: Artwork): void
  (e: 'cancel-generation'): void
  (e: 'suggestion-clicked', suggestion: Suggestion): void
}

const props = withDefaults(defineProps<Props>(), {
  artworks: () => [],
  isGenerating: false,
  generatingProgress: 0,
  canCancel: true,
  showLatestOnly: false,
  suggestions: () => [
    { title: '🎨 创作风景画', description: '生成美丽的自然风景', action: 'landscape' },
    { title: '👤 绘制人物肖像', description: '创作人物肖像画', action: 'portrait' },
    { title: '🏛️ 设计建筑', description: '设计现代建筑', action: 'architecture' },
    { title: '🎭 抽象艺术', description: '创作抽象艺术作品', action: 'abstract' }
  ]
})

const emit = defineEmits<Emits>()

// 组件状态
const isFullscreen = ref(false)

// 计算属性
const currentArtwork = computed(() => {
  if (props.showLatestOnly) {
    // 只显示最新作品模式：显示第一个作品（最新的）
    return props.artworks[0] || null
  }
  
  if (props.currentArtworkId) {
    return props.artworks.find(artwork => artwork.id === props.currentArtworkId) || null
  }
  return props.artworks[0] || null
})

// 方法
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
}

const toggleFavorite = (artwork: Artwork) => {
  emit('favorite-toggled', artwork)
}

const downloadArtwork = (artwork: Artwork) => {
  emit('artwork-downloaded', artwork)
}

const shareArtwork = (artwork: Artwork) => {
  emit('artwork-shared', artwork)
}

const deleteArtwork = (artwork: Artwork) => {
  if (confirm('确定要删除这个作品吗？此操作无法撤销。')) {
    emit('artwork-deleted', artwork)
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 监听器
watch(currentArtwork, (newArtwork) => {
  emit('artwork-changed', newArtwork)
})

// 键盘事件处理
const handleKeydown = (event: KeyboardEvent) => {
  if (isFullscreen.value) {
    switch (event.key) {
      case 'Escape':
        toggleFullscreen()
        break
    }
  }
}

// 生命周期
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

// 导出方法供父组件调用
defineExpose({
  toggleFullscreen,
  currentArtwork
})
</script>

<style scoped>
.artwork-gallery {
  @apply h-full flex flex-col;
}

.main-display-area {
  @apply flex-1 flex items-center justify-center p-6;
}

/* 空状态样式 */
.empty-state {
  @apply w-full max-w-2xl mx-auto text-center;
}

.empty-content {
  @apply flex flex-col items-center;
}

.empty-icon {
  @apply p-6 bg-slate-50 dark:bg-slate-800 rounded-full;
}

.suggested-actions {
  @apply max-w-lg;
}

/* 生成中状态样式 */
.generating-state {
  @apply w-full max-w-md mx-auto text-center;
}

.generating-animation {
  @apply relative flex items-center justify-center;
}

.pulse-rings {
  @apply absolute inset-0 flex items-center justify-center;
}

.pulse-ring {
  @apply absolute w-16 h-16 border-2 border-blue-300 rounded-full animate-ping;
}

.pulse-ring:nth-child(2) {
  @apply w-20 h-20 animation-delay-200;
}

.pulse-ring:nth-child(3) {
  @apply w-24 h-24 animation-delay-400;
}

.progress-container {
  @apply w-full max-w-xs mx-auto;
}

.progress-bar {
  @apply w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden;
}

.progress-fill {
  @apply h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300;
}

.progress-text {
  @apply text-sm text-slate-600 dark:text-slate-400 mt-2;
}

/* 作品展示样式 */
.artwork-display {
  @apply w-full h-full flex flex-col;
}

.single-artwork {
  @apply flex-1 flex items-center justify-center;
}

/* 作品信息样式 */
.artwork-info {
  @apply flex items-start justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg;
}

.artwork-meta {
  @apply flex-1;
}

.artwork-title {
  @apply text-lg font-semibold text-slate-800 dark:text-white mb-2;
}

.artwork-prompt {
  @apply text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2;
}

.artwork-details {
  @apply flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-500;
}

.detail-item {
  @apply flex items-center gap-1;
}

.artwork-actions {
  @apply flex gap-2;
}

.action-btn {
  @apply p-2 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600
         hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-400
         hover:text-slate-800 dark:hover:text-slate-200 transition-all duration-200;
}

.action-btn.favorited {
  @apply text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300;
}

/* 全屏模态框样式 */
.fullscreen-modal {
  @apply fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50;
}

.fullscreen-content {
  @apply relative w-full h-full flex items-center justify-center p-4;
}

.fullscreen-close {
  @apply absolute top-4 right-4 p-2 rounded-full bg-black bg-opacity-50 text-white
         hover:bg-opacity-70 transition-all duration-200 z-10;
}

/* 动画延迟类 */
.animation-delay-200 {
  animation-delay: 0.2s;
}

.animation-delay-400 {
  animation-delay: 0.4s;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-display-area {
    @apply p-4;
  }
  
  .artwork-info {
    @apply flex-col gap-3;
  }
  
  .artwork-actions {
    @apply justify-center;
  }
  
  .carousel-nav {
    @apply p-2;
  }
}
</style> 